// Identidade de convidado para o modo multiplayer (não exige login).
// Persistida em sessionStorage: só token e user ficam no localStorage; o
// resto (estado de sessão/jogo) vive no sessionStorage.

const GUEST_ID_KEY = "mp_guest_id";
const GUEST_NAME_KEY = "mp_guest_name";

/** Retorna (criando se necessário) um id estável para esta sessão do navegador. */
export function getGuestId(): string {
  let id = sessionStorage.getItem(GUEST_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(GUEST_ID_KEY, id);
  }
  return id;
}

export function getGuestName(): string {
  return sessionStorage.getItem(GUEST_NAME_KEY) || "";
}

export function setGuestName(name: string): void {
  sessionStorage.setItem(GUEST_NAME_KEY, name);
}
