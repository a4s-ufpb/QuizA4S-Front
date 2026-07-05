// Configuração global de som (volume/mute), persistida em localStorage.

const VOLUME_KEY = "soundVolume";
const MUTED_KEY = "soundMuted";

export function getSoundVolume(): number {
  const raw = localStorage.getItem(VOLUME_KEY);
  const value = raw !== null ? Number(raw) : 1;
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 1;
}

export function getSoundMuted(): boolean {
  return localStorage.getItem(MUTED_KEY) === "true";
}

export function setSoundVolume(volume: number): void {
  localStorage.setItem(VOLUME_KEY, String(Math.min(1, Math.max(0, volume))));
}

export function setSoundMuted(muted: boolean): void {
  localStorage.setItem(MUTED_KEY, String(muted));
}

export function playSound(src: string): void {
  if (getSoundMuted()) return;
  const audio = new Audio(src);
  audio.volume = getSoundVolume();
  audio.play().catch(() => {});
}
