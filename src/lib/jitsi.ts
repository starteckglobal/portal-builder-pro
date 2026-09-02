/** Jitsi Meet embed helpers. Jitsi Meet is Apache-2.0 (github.com/jitsi/jitsi-meet). */
export const JITSI_DOMAIN = "meet.jit.si";

const WORDS = ["pitch", "media", "brief", "story", "signal", "coverage", "wire", "studio"];

export const randomRoomName = () =>
  `abm-${WORDS[Math.floor(Math.random() * WORDS.length)]}-${Math.random().toString(36).slice(2, 6)}`;

/** Accepts a bare room name or a pasted Jitsi URL and returns a safe room name. */
export const parseRoomInput = (input: string): string => {
  let value = input.trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value) || value.includes("/")) {
    const parts = value.replace(/^https?:\/\//i, "").split("/").filter(Boolean);
    value = parts[parts.length - 1] || "";
  }
  return value.split("#")[0].split("?")[0].replace(/[^A-Za-z0-9\-_]/g, "");
};

export const inviteLink = (room: string) => `https://${JITSI_DOMAIN}/${room}`;
