import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdvancedSearch, {
  type AdvancedField,
  type AdvancedFilterValues,
} from "./AdvancedSearch";

const FIELDS: AdvancedField[] = [
  { name: "themeName", label: "Tema", type: "text" },
  { name: "startDate", label: "Data Inicial", type: "date" },
];

const EMPTY: AdvancedFilterValues = { themeName: "", startDate: "" };

describe("AdvancedSearch", () => {
  it("mostra o botão de busca e desabilita Limpar sem filtros ativos", () => {
    render(<AdvancedSearch fields={FIELDS} values={EMPTY} onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: /Busca Avançada/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Limpar filtros/i })).toBeDisabled();
  });

  it("exibe um badge por filtro ativo", () => {
    render(
      <AdvancedSearch
        fields={FIELDS}
        values={{ themeName: "Geografia", startDate: "" }}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText("Tema: Geografia")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Limpar filtros/i })).toBeEnabled();
  });

  it("remover um badge chama onChange limpando aquele filtro", async () => {
    const onChange = vi.fn();
    render(
      <AdvancedSearch
        fields={FIELDS}
        values={{ themeName: "Geografia", startDate: "" }}
        onChange={onChange}
      />
    );

    // O chip do MUI expõe o botão de deletar com aria-label "delete".
    await userEvent.click(screen.getByTestId("CancelIcon"));

    expect(onChange).toHaveBeenCalledWith({ themeName: "", startDate: "" });
  });

  it("Limpar filtros zera todos os valores", async () => {
    const onChange = vi.fn();
    render(
      <AdvancedSearch
        fields={FIELDS}
        values={{ themeName: "Geografia", startDate: "2024-01-01" }}
        onChange={onChange}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: /Limpar filtros/i }));

    expect(onChange).toHaveBeenCalledWith({ themeName: "", startDate: "" });
  });

  it("abre o modal, edita um campo e aplica o filtro", async () => {
    const onChange = vi.fn();
    render(<AdvancedSearch fields={FIELDS} values={EMPTY} onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: /Busca Avançada/i }));

    const dialog = await screen.findByRole("dialog");
    const temaInput = within(dialog).getByLabelText("Tema");
    await userEvent.type(temaInput, "História");

    await userEvent.click(within(dialog).getByRole("button", { name: /Filtrar/i }));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ themeName: "História" })
    );
  });

  it("renderiza controles extras (left/right)", () => {
    render(
      <AdvancedSearch
        fields={FIELDS}
        values={EMPTY}
        onChange={vi.fn()}
        leftExtra={<span>ESQUERDA</span>}
        rightExtra={<span>DIREITA</span>}
      />
    );

    expect(screen.getByText("ESQUERDA")).toBeInTheDocument();
    expect(screen.getByText("DIREITA")).toBeInTheDocument();
  });
});
