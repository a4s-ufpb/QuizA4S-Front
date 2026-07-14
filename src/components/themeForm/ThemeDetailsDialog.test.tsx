import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

describe("ThemeDetailsDialog", () => {
  it("não renderiza nada sem tema", () => {
    const { container } = render(
      <ThemeDetailsDialog theme={null} onClose={vi.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("mostra nome, conteúdos e materiais como links em nova guia", () => {
    render(<ThemeDetailsDialog theme={theme} onClose={vi.fn()} />);

    expect(screen.getByText("Geografia")).toBeInTheDocument();
    expect(screen.getByText("Capitais e continentes")).toBeInTheDocument();

    const link = screen.getByRole("link", { name: /Aula 1/i });
    expect(link).toHaveAttribute("href", "https://youtu.be/abc");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("aciona onPlay ao clicar em Jogar", async () => {
    const onPlay = vi.fn();
    render(<ThemeDetailsDialog theme={theme} onClose={vi.fn()} onPlay={onPlay} />);

    await userEvent.click(screen.getByRole("button", { name: /Jogar/i }));
    expect(onPlay).toHaveBeenCalledTimes(1);
  });

  it("informa quando não há materiais", () => {
    render(
      <ThemeDetailsDialog
        theme={{ ...theme, materials: [] }}
        onClose={vi.fn()}
      />
    );
    expect(
      screen.getByText(/Nenhum material disponível/i)
    ).toBeInTheDocument();
  });
});
