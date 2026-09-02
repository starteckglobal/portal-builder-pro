## Technical details

**Dependency**: add `@jitsi/react-sdk` (the Jitsi team's own React wrapper around `modules/API/external/external_api.js` from `jitsi/jitsi-meet`). It is React 18 compatible, so the project's React 18 pin is respected.

**New files**
- `src/components/meeting/LiveMeeting.tsx` — landing screen (start instant / join by name) plus the meeting view using `JitsiMeeting` from the SDK: `domain`, `roomName`, `userInfo` from the auth context, `configOverwrite` (prejoin page, welcome page off), `interfaceConfigOverwrite`, and `onApiReady` / `onReadyToClose` to return to the landing screen on hangup.
- `src/lib/jitsi.ts` — `JITSI_DOMAIN` constant (default `meet.jit.si`), room-name generator, and a parser that accepts either a bare room name or a pasted Jitsi URL.

**Edits**
- `src/components/app-sidebar.tsx` — add `{ id: "livemeeting", label: "Live Meeting", icon: "video" }` to `NAV` and into the Workspace group.
- `src/components/portalIcons.tsx` — add a `video` icon in the existing icon style.
- `src/components/ABMPortal.tsx` — render `<LiveMeeting />` for the `livemeeting` tab; the meeting container gets a solid dark background so the starfield does not show through video.

**Notes**
- Meeting media runs on the Jitsi server; no backend, no edge function, no table, no secret. The default `meet.jit.si` requires no account.
- Camera and microphone are requested by Jitsi itself inside the embed.
- Verification: authenticated browser run — open Live Meeting, start an instant room, confirm the Jitsi client loads with its toolbar and prefilled display name, confirm leaving returns to the landing screen, and check the console for errors.
- Jitsi Meet is Apache-2.0; attribution noted in the component header.
