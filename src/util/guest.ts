// Identidade de convidado para o modo multiplayer (não exige login).
// O id persiste no localStorage; o nome é escolhido a cada sessão.

const GUEST_ID_KEY = "mp_guest_id";
const GUEST_NAME_KEY = "mp_guest_name";

/** Retorna (criando se necessário) um id estável para este dispositivo/navegador. */
export function getGuestId(): string {
  let id = localStorage.getItem(GUEST_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(GUEST_ID_KEY, id);
  }
  return id;
}

export function getGuestName(): string {
  return localStorage.getItem(GUEST_NAME_KEY) || "";
}

export function setGuestName(name: string): void {
  localStorage.setItem(GUEST_NAME_KEY, name);
}
