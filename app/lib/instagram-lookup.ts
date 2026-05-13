export type InstagramLookupResult = {
  username: string;
  fullName: string;
  profileUrl: string;
  followerCount: string;
  found: boolean;
  warning?: string;
};

function cleanUsername(value: string) {
  return value.trim().replace(/^@+/, "").replace(/\/+$/, "");
}

function decodeHtml(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function getMetaContent(html: string, key: string) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${key}["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${key}["']`, "i"),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtml(match[1]);
  }

  return "";
}

function parseFollowerCount(description: string) {
  const match = description.match(/([\d.,]+(?:\s?[KMBkmb])?)\s+(?:followers|follower|takipçi|takipci)/i);
  return match?.[1]?.replaceAll(",", ".").replace(/\s+/g, "") ?? "";
}

function parseFullName(title: string, username: string) {
  const withoutSuffix = title.replace(/\s*•\s*Instagram.*$/i, "").trim();
  const nameMatch = withoutSuffix.match(/^(.*?)\s+\(@/);
  return nameMatch?.[1]?.trim() || username;
}

export async function lookupInstagramProfile(rawUsername: string): Promise<InstagramLookupResult> {
  const username = cleanUsername(rawUsername);

  if (!username || !/^[a-zA-Z0-9._]{1,30}$/.test(username)) {
    throw new Error("Geçerli bir Instagram kullanıcı adı yaz.");
  }

  const profileUrl = `https://www.instagram.com/${username}/`;

  try {
    const response = await fetch(profileUrl, {
      cache: "no-store",
      headers: {
        "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return {
        username,
        fullName: username,
        profileUrl,
        followerCount: "",
        found: false,
        warning: "Instagram takipçi bilgisini şu an vermedi.",
      };
    }

    const html = await response.text();
    const description = getMetaContent(html, "og:description") || getMetaContent(html, "description");
    const title = getMetaContent(html, "og:title") || getMetaContent(html, "twitter:title");
    const followerCount = parseFollowerCount(description);

    return {
      username,
      fullName: parseFullName(title, username),
      profileUrl,
      followerCount,
      found: Boolean(followerCount),
      warning: followerCount ? undefined : "Profil bulundu ama takipçi sayısı otomatik okunamadı.",
    };
  } catch {
    return {
      username,
      fullName: username,
      profileUrl,
      followerCount: "",
      found: false,
      warning: "Instagram takipçi bilgisini otomatik okumaya izin vermedi.",
    };
  }
}
