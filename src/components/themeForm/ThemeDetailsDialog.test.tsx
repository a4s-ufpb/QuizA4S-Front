import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import ThemeDetailsDialog from "./ThemeDetailsDialog";
import type { Theme } from "../../types";

const theme: Theme = {
  id: 1,
  name: "Geografia",
  imageUrl: "http://img.com/geo.png",
  description: "Capitais e continentes",
  materials: [
    { id: 10, name: "Aula 1", link: "https://youtu.be/abc", type: "VIDEO" },
    { id: 11, name: "Apostila", link: "https://x.com/a.pdf", type: "FILE" },
  ],
};

function wrap(node: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{node}</QueryClientProvider>);
}

describe("ThemeDetailsDialog", () => {
  beforeEach(() => localStorage.clear());

  it("não renderiza nada sem tema", () => {
    const { container } = wrap(<ThemeDetailsDialog theme={null} onClose={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("mostra nome, conteúdos e materiais como links em nova guia", () => {
    wrap(<ThemeDetailsDialog theme={theme} onClose={vi.fn()} />);

    expect(screen.getByText("Geografia")).toBeInTheDocument();
    expect(screen.getByText("Capitais e continentes")).toBeInTheDocument();

    const link = screen.getByRole("link", { name: /Aula 1/i });
    expect(link).toHaveAttribute("href", "https://youtu.be/abc");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("aciona onPlay ao clicar em Jogar", async () => {
    const onPlay = vi.fn();
    wrap(<ThemeDetailsDialog theme={theme} onClose={vi.fn()} onPlay={onPlay} />);

    await userEvent.click(screen.getByRole("button", { name: /Jogar/i }));
    expect(onPlay).toHaveBeenCalledTimes(1);
  });

  it("informa quando não há materiais", () => {
    wrap(
      <ThemeDetailsDialog
        theme={{ ...theme, materials: [] }}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText(/Nenhum material disponível/i)).toBeInTheDocument();
  });

  it("toggle explicação alterna SIM/NÃO e persiste em localStorage", async () => {
    wrap(<ThemeDetailsDialog theme={theme} onClose={vi.fn()} />);
    const btn = screen.getByRole("button", { name: /SIM|NÃO/ });
    // Default true (SIM).
    expect(btn).toHaveTextContent("SIM");

    await userEvent.click(btn);
    expect(btn).toHaveTextContent("NÃO");
    expect(localStorage.getItem("quiz:showExplanation")).toBe("false");

    await userEvent.click(btn);
    expect(btn).toHaveTextContent("SIM");
    expect(localStorage.getItem("quiz:showExplanation")).toBe("true");
  });

  it("exibe contagem de likes e nunca abaixo do valor da prop", () => {
    wrap(
      <ThemeDetailsDialog
        theme={{ ...theme, likeCount: 7, likedByMe: false }}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText("7 gostei")).toBeInTheDocument();
  });
});
