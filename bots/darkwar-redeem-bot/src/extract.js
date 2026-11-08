// Finds gift codes in a message, e.g. an announcement followed from the official Dark War Discord.
// Codes are uppercase letters/digits. We take: `backticked` tokens, the token right after
// "code"/"codes", and standalone uppercase tokens that mix letters and digits (DWDC20EN).
const STOP = new Set(["DARKWAR", "SURVIVAL", "DISCORD", "EVERYONE", "HERE", "HTTPS", "HTTP", "GIFT", "CODE", "CODES",
  "REDEEM", "REWARD", "REWARDS", "UID", "VIP", "HQ", "PVP", "SVS", "UTC", "NEW", "FREE"]);

export function extractCodes(text) {
  const clean = String(text || "")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/<[@#&!:a-z0-9_]*\d+>/gi, " ");
  const found = new Set();
  for (const m of clean.matchAll(/`([A-Za-z0-9]{4,32})`/g)) found.add(m[1]);
  for (const m of clean.matchAll(/\bcodes?\b\s*[:：\-–—]?\s*\**([A-Z0-9]{4,32})\b/gi)) {
    if (m[1] === m[1].toUpperCase() && /[A-Z]/.test(m[1])) found.add(m[1]);
  }
  for (const m of clean.matchAll(/\b(?=[A-Z0-9]*\d)(?=[A-Z0-9]*[A-Z])[A-Z0-9]{6,20}\b/g)) found.add(m[0]);
  return [...found].filter(c => !STOP.has(c.toUpperCase()) && !/^\d+$/.test(c) && !/^\d{1,2}(AM|PM|H|MIN|D)$/i.test(c));
}

export const isCode = c => /^[A-Za-z0-9]{3,32}$/.test(String(c || ""));
