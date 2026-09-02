# Live Meeting (Jitsi Meet)

Add a **Live Meeting** section to the portal sidebar that runs the real Jitsi Meet client — Jitsi's own code, not a lookalike.

## What Jitsi ships for this

The `jitsi/jitsi-meet` repo is a full communications platform: the browser client plus the server side (Prosody XMPP, Jicofo, the Videobridge — Java/Lua services) and native mobile clients. Server components cannot run inside this project, and they are not what renders the meeting UI.

The part of that repo that renders meetings in a web page is its own official embed module, `modules/API/external/external_api.js`, published by the Jitsi team as `@jitsi/react-sdk`. That is the supported way Jitsi is put inside another app, and it loads the genuine Jitsi Meet client: same toolbar, tile view, screen share, chat, raise hand, recording, settings — pixel-for-pixel Jitsi, because it *is* Jitsi.

So: Jitsi's official package, Jitsi's UI, pointed at a meeting server. Default server is `meet.jit.si` (free, no account). The server domain lives in one constant, so pointing it at a self-hosted Jitsi later is a one-line change.

## The feature

- Sidebar item **Live Meeting** in the Workspace group, with a video icon.
- Landing screen in the portal dark theme:
  - **Start instant meeting** — generates a random room name and joins immediately. you can also rename and add name of room before start
  - **Join by name** — type or paste a room name (or a full `meet.jit.si/...` link) and join.
  - Your portal display name and email are prefilled into Jitsi, so participants see real names.
- Once joined, the full Jitsi Meet interface fills the content area with all its native controls.
- **Copy invite link** and **Leave meeting** controls above the meeting; hanging up in Jitsi returns to the landing screen.
- Nothing is stored in the database — instant rooms and join-by-name only, as chosen.
