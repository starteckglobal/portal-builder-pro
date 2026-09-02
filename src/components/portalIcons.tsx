export const Ico = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: d }} />
);

export const ICONS: Record<string, string> = {
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="4" rx="1.5"/><rect x="14" y="11" width="7" height="10" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>',
  leads: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>',
  chat: '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',
  deck: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M2 7h20"/>',
  press: '<path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2"/>',
  email: '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  clip: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  portal: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  report: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/>',
  assets: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/>',
  monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  kanban: '<rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="5" height="15" rx="1"/>',
  chart: '<path d="M18 20V10M12 20V4M6 20v-6"/>',
  calc: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h8M8 14h4M8 18h4M16 14h.01M16 18h.01"/>',
  bell: '<path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>',
  wizard: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
  notes: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
  health: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  sparkle: '<path fill="currentColor" stroke="none" d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z"/>',
  send: '<path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>',
  fire: '<path d="M12 22c4-2 8-6 8-12 0-2-1-4-3-5-1 2-3 3-5 3 0-3-1-6-4-8-1 3-3 5-5 6C1 8 1 11 1 13c0 5 4 9 11 9z"/>',
  trending: '<path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>',
  settings: '<path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"/><path d="M19.4 15a1.7 1.7 0 00.34 1.88l.06.06-1.5 1.5-.06-.06A1.7 1.7 0 0016.36 18a1.7 1.7 0 00-1.03 1.55V20h-2.12v-.45A1.7 1.7 0 0012.18 18a1.7 1.7 0 00-1.88.34l-.06.06-1.5-1.5.06-.06A1.7 1.7 0 009.14 15a1.7 1.7 0 00-1.55-1.03H7.14v-2.12h.45A1.7 1.7 0 009.14 10a1.7 1.7 0 00-.34-1.88l-.06-.06 1.5-1.5.06.06A1.7 1.7 0 0012.18 7a1.7 1.7 0 001.03-1.55V5h2.12v.45A1.7 1.7 0 0016.36 7a1.7 1.7 0 001.88-.34l.06-.06 1.5 1.5-.06.06A1.7 1.7 0 0019.4 10a1.7 1.7 0 001.55 1.03h.45v2.12h-.45A1.7 1.7 0 0019.4 15z"/>',
  gamma: '<polygon points="12,2 22,20 2,20"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>',
  video: '<path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
  logout: '<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',
};

export const I = ({ name, size = 18 }: { name: string; size?: number }) =>
  ICONS[name] ? <Ico d={ICONS[name]} size={size} /> : null;
