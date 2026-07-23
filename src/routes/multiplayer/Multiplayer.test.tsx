import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Multiplayer from "./Multiplayer";

// Sem login (convidado) e sem chamadas de rede: só a UI das abas/rádio.
vi.mock("../../query/useUserQueries", () => ({
  useIsAdminQuery: () => ({ data: { data: { isAdmin: false } } }),
}));

function renderMultiplayer() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <Multiplayer />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("Multiplayer", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("abre por padrão na aba Criar Sala com o modo do criador", () => {
    renderMultiplayer();

    expect(screen.getByText("Modo do criador da sala")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Participar do quiz" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Modo espectador" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Criar sala" })).toBeInTheDocument();
  });

  it("por padrão o modo espectador vem selecionado", () => {
    renderMultiplayer();
    expect(screen.getByRole("radio", { name: "Modo espectador" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Participar do quiz" })).not.toBeChecked();
  });

  it("alternar para 'Entrar na Sala' mostra o campo de código e esconde o modo do criador", async () => {
    renderMultiplayer();

    await userEvent.click(screen.getByRole("button", { name: "Entrar na Sala" }));

    expect(screen.getByPlaceholderText("Código")).toBeInTheDocument();
    expect(screen.queryByText("Modo do criador da sala")).not.toBeInTheDocument();
  });
});
