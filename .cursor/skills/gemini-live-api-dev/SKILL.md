---
name: gemini-live-api-dev
description: Use this skill when building real-time, bidirectional streaming applications with the Gemini Live API. Covers WebSocket-based audio/video/text streaming, voice activity detection (VAD), native audio features, function calling, session management, ephemeral tokens for client-side auth, and all Live API configuration options. SDKs covered - google-genai (Python), @google/genai (JavaScript/TypeScript).
---

# Gemini Live API Development Skill

## Overview

The Live API enables **low-latency, real-time voice and video interactions** with Gemini over WebSockets. It processes continuous streams of audio, video, or text to deliver immediate, human-like spoken responses.

Key capabilities:
- **Bidirectional audio streaming** — real-time mic-to-speaker conversations
- **Video streaming** — send camera/screen frames alongside audio
- **Text input/output** — send and receive text within a live session
- **Audio transcriptions** — get text transcripts of both input and output audio
- **Voice Activity Detection (VAD)** — automatic interruption handling
- **Native audio** — interleaved reasoning on 3.8 Live; extended background reasoning on 3.8 Live Extended Thinking
- **Function calling** — async by default on 3.8 Live (`NON_BLOCKING`); use `behavior: BLOCKING` when the model must wait for tool results
- **Google Search grounding** — ground responses in real-time search results
- **Session management** — context compression, session resumption, GoAway signals
- **Ephemeral tokens** — secure client-side authentication

> [!NOTE]
> The Live API currently **only supports WebSockets**. For WebRTC support or simplified integration, use a [partner integration](#partner-integrations).

## Models

- `gemini-3.8-live` — Default stable Live API model: low-latency voice agents, visual grounding, async function calling. **Recommended for most Live API use cases (including Talent2030).**
- `gemini-3.8-live-extended-thinking` — High-reasoning live audio; async tools only; use `thinking_config` and `interaction_status` on the client.

> [!WARNING]
> Legacy preview Live models (e.g. `gemini-3.1-flash-live-preview`) should be migrated to **`gemini-3.8-live`**. Older 2.x Live previews are deprecated — see [Gemini deprecations](https://ai.google.dev/gemini-api/docs/deprecations).

## SDKs

- **Python**: `google-genai` — `pip install google-genai`
- **JavaScript/TypeScript**: `@google/genai` — `npm install @google/genai`

> [!WARNING]
> Legacy SDKs `google-generativeai` (Python) and `@google/generative-ai` (JS) are deprecated. Use the new SDKs above.

## Partner Integrations

To streamline real-time audio/video app development, use a third-party integration supporting the Gemini Live API over **WebRTC** or **WebSockets**:

- [LiveKit](https://docs.livekit.io/agents/models/realtime/plugins/gemini/) — Use the Gemini Live API with LiveKit Agents.
- [Pipecat by Daily](https://docs.pipecat.ai/guides/features/gemini-live) — Create a real-time AI chatbot using Gemini Live and Pipecat.
- [Fishjam by Software Mansion](https://docs.fishjam.io/tutorials/gemini-live-integration) — Create live video and audio streaming applications with Fishjam.
- [Vision Agents by Stream](https://visionagents.ai/integrations/gemini) — Build real-time voice and video AI applications with Vision Agents.
- [Voximplant](https://voximplant.com/products/gemini-client) — Connect inbound and outbound calls to Live API with Voximplant.
- [Firebase AI SDK](https://firebase.google.com/docs/ai-logic/live-api?api=dev) — Get started with the Gemini Live API using Firebase AI Logic.

## Audio Formats

- **Input**: Raw PCM, little-endian, 16-bit, mono. 16kHz native (will resample others). MIME type: `audio/pcm;rate=16000`
- **Output**: Raw PCM, little-endian, 16-bit, mono. 24kHz sample rate.

> [!IMPORTANT]
> Use `send_realtime_input` / `sendRealtimeInput` for all real-time user input (audio, video, **and text**). `send_client_content` / `sendClientContent` is **only** supported for seeding initial context history (requires setting `initial_history_in_client_content` in `history_config`). Do **not** use it to send new user messages during the conversation.

> [!WARNING]
> Do **not** use `media` in `sendRealtimeInput`. Use the specific keys: `audio` for audio data, `video` for images/video frames, and `text` for text input.

---

## Quick Start

### Authentication

#### Python

```python
from google import genai

client = genai.Client(api_key="YOUR_API_KEY")
```

#### JavaScript

```js
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: 'YOUR_API_KEY' });
```

### Connecting to the Live API

#### Python
```python
from google.genai import types

config = types.LiveConnectConfig(
    response_modalities=[types.Modality.AUDIO],
    system_instruction=types.Content(
        parts=[types.Part(text="You are a helpful assistant.")]
    )
)

async with client.aio.live.connect(model="gemini-3.8-live", config=config) as session:
    pass  # Session is active
```

#### JavaScript
```js
const session = await ai.live.connect({
  model: 'gemini-3.8-live',
  config: {
    responseModalities: ['audio'],
    systemInstruction: { parts: [{ text: 'You are a helpful assistant.' }] }
  },
  callbacks: {
    onopen: () => console.log('Connected'),
    onmessage: (response) => console.log('Message:', response),
    onerror: (error) => console.error('Error:', error),
    onclose: () => console.log('Closed')
  }
});
```

### Sending Text

#### Python
```python
await session.send_realtime_input(text="Hello, how are you?")
```

#### JavaScript
```js
session.sendRealtimeInput({ text: 'Hello, how are you?' });
```

### Sending Audio

#### Python
```python
await session.send_realtime_input(
    audio=types.Blob(data=chunk, mime_type="audio/pcm;rate=16000")
)
```

#### JavaScript
```js
session.sendRealtimeInput({
  audio: { data: chunk.toString('base64'), mimeType: 'audio/pcm;rate=16000' }
});
```

### Sending Video

#### Python
```python
# frame: raw JPEG-encoded bytes
await session.send_realtime_input(
    video=types.Blob(data=frame, mime_type="image/jpeg")
)
```

#### JavaScript
```js
session.sendRealtimeInput({
  video: { data: frame.toString('base64'), mimeType: 'image/jpeg' }
});
```

### Receiving Audio and Text

> [!IMPORTANT]
> A single server event can contain **multiple content parts simultaneously** (e.g., audio chunks and transcript). Always process **all** parts in each event to avoid missing content.

#### Python
```python
async for response in session.receive():
    content = response.server_content
    if content:
        # Audio — process ALL parts in each event
        if content.model_turn:
            for part in content.model_turn.parts:
                if part.inline_data:
                    audio_data = part.inline_data.data
        # Transcription
        if content.input_transcription:
            print(f"User: {content.input_transcription.text}")
        if content.output_transcription:
            print(f"Gemini: {content.output_transcription.text}")
        # Interruption
        if content.interrupted is True:
            pass  # Stop playback, clear audio queue
```

#### JavaScript
```js
// Inside the onmessage callback
const content = response.serverContent;
if (content?.modelTurn?.parts) {
  for (const part of content.modelTurn.parts) {
    if (part.inlineData) {
      const audioData = part.inlineData.data; // Base64 encoded
    }
  }
}
if (content?.inputTranscription) console.log('User:', content.inputTranscription.text);
if (content?.outputTranscription) console.log('Gemini:', content.outputTranscription.text);
if (content?.interrupted) { /* Stop playback, clear audio queue */ }
```

---

## Limitations

- **Response modality** — Only `TEXT` **or** `AUDIO` per session, not both
- **Audio-only session** — 15 min without compression
- **Audio+video session** — 2 min without compression
- **Connection lifetime** — ~10 min (use session resumption)
- **Context window** — 128k tokens (native audio) / 32k tokens (standard)
- **Async function calling** — Default on `gemini-3.8-live` (`NON_BLOCKING`). Set `behavior: BLOCKING` on declarations when the model must wait for tool results before speaking.
- **Proactive audio** — Always enabled on `gemini-3.8-live`; `proactive_audio: false` returns an error.
- **Thinking config** — Not supported on `gemini-3.8-live` (omit `thinkingConfig`). Use `gemini-3.8-live-extended-thinking` with `thinking_level` low/medium/high when background reasoning is required.
- **Code execution** — Not supported
- **URL context** — Not supported

## Migrating to Gemini 3.8 Live

When migrating from `gemini-3.1-flash-live-preview` (or older Live previews) to `gemini-3.8-live`:

1. **Model string** — Use `gemini-3.8-live`.
2. **Thinking configuration** — Omit `thinkingConfig` / `thinking_level` on 3.8 Live (not supported).
3. **Function calling** — Async is the default; set `behavior: BLOCKING` on tools that must complete before the model speaks.
4. **Server events** — Process **all** parts in each event (audio + transcript can arrive together).
5. **Client content** — `sendClientContent` is supported for the full session; `turnComplete: true` interrupts active generation.
6. **Proactive audio** — Always on; remove `proactive_audio: false` and affective dialogue config.

## Best Practices

1. **Use headphones** when testing mic audio to prevent echo/self-interruption
2. **Enable context window compression** for sessions longer than 15 minutes
3. **Implement session resumption** to handle connection resets gracefully
4. **Use ephemeral tokens** for client-side deployments — never expose API keys in browsers
5. **Use `send_realtime_input`** for all real-time user input (audio, video, text). Reserve `send_client_content` only for seeding initial context history
6. **Send `audioStreamEnd`** when the mic is paused to flush cached audio
7. **Clear audio playback queues** on interruption signals
8. **Process all parts** in each server event — events can contain multiple content parts

## Documentation Lookup

### When MCP is Installed (Preferred)

If the **`search_docs`** tool (from the Google MCP server) is available, use it as your **only** documentation source:

1. Call `search_docs` with your query
2. Read the returned documentation
3. **Trust MCP results** as source of truth for API details — they are always up-to-date.

> [!IMPORTANT]
> When MCP tools are present, **never** fetch URLs manually. MCP provides up-to-date, indexed documentation that is more accurate and token-efficient than URL fetching.

### When MCP is NOT Installed (Fallback Only)

If no MCP documentation tools are available, fetch from the official docs index:

**llms.txt URL**: `https://ai.google.dev/gemini-api/docs/llms.txt`

This index contains links to all documentation pages in `.md.txt` format. Use web fetch tools to:

1. Fetch `llms.txt` to discover available documentation pages
2. Fetch specific pages (e.g., `https://ai.google.dev/gemini-api/docs/live-session.md.txt`)

### Key Documentation Pages 

> [!IMPORTANT]
> Those are not all the documentation pages. Use the `llms.txt` index to discover available documentation pages

- [Live API Overview](https://ai.google.dev/gemini-api/docs/live.md.txt) — getting started, raw WebSocket usage
- [Live API Capabilities Guide](https://ai.google.dev/gemini-api/docs/live-guide.md.txt) — voice config, transcription config, native audio (thinking), VAD configuration, media resolution
- [Live API Tool Use](https://ai.google.dev/gemini-api/docs/live-tools.md.txt) — function calling (sync and async), Google Search grounding
- [Session Management](https://ai.google.dev/gemini-api/docs/live-session.md.txt) — context window compression, session resumption, GoAway signals
- [Ephemeral Tokens](https://ai.google.dev/gemini-api/docs/ephemeral-tokens.md.txt) — secure client-side authentication for browser/mobile
- [WebSockets API Reference](https://ai.google.dev/api/live.md.txt) — raw WebSocket protocol details

## Supported Languages

The Live API supports 70 languages including: English, Spanish, French, German, Italian, Portuguese, Chinese, Japanese, Korean, Hindi, Arabic, Russian, and many more. Native audio models automatically detect and switch languages.
