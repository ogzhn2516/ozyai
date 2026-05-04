# ElevenLabs API routes

Environment:

```env
ELEVENLABS_API_KEY=
ELEVENLABS_TTS_MODEL=eleven_multilingual_v2
```

Routes:

- `GET /api/elevenlabs/voices` lists available voices. If `ELEVENLABS_API_KEY` is missing, it returns mock voices.
- `POST /api/elevenlabs/text-to-speech` converts text to audio. If `ELEVENLABS_API_KEY` is missing, it returns a generated demo WAV.
