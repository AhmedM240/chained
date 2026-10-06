const SESSION_KEY = "chained-session-id";

function makeId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  // fallback for non-secure contexts (e.g. testing on a phone over the local network)
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) =>
    b.toString(16).padStart(2, "0")
  ).join("");
}

export function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = makeId();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}