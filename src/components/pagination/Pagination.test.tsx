import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Pagination from "./Pagination";

describe("Pagination", () => {
  it("exibe a página atual e o total", () => {
    render(<Pagination currentPage={0} totalPages={3} setCurrentPage={vi.fn()} />);
    expect(screen.getByText("Página 1 de 3")).toBeInTheDocument();
  });

  it("desabilita primeira/anterior na primeira página", () => {
    render(<Pagination currentPage={0} totalPages={3} setCurrentPage={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Primeira página" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Página anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Próxima página" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Última página" })).toBeEnabled();
  });

  it("desabilita próxima/última na última página", () => {
    render(<Pagination currentPage={2} totalPages={3} setCurrentPage={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Próxima página" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Última página" })).toBeDisabled();
  });

  it("ir para a última página chama setCurrentPage com totalPages-1", async () => {
    const setCurrentPage = vi.fn();
    render(<Pagination currentPage={0} totalPages={5} setCurrentPage={setCurrentPage} />);

    await userEvent.click(screen.getByRole("button", { name: "Última página" }));

    expect(setCurrentPage).toHaveBeenCalledWith(4);
  });

  it("próxima página avança uma posição", async () => {
    const setCurrentPage = vi.fn();
    render(<Pagination currentPage={1} totalPages={5} setCurrentPage={setCurrentPage} />);

    await userEvent.click(screen.getByRole("button", { name: "Próxima página" }));

    expect(setCurrentPage).toHaveBeenCalledWith(2);
  });

  it("primeira página volta para 0", async () => {
    const setCurrentPage = vi.fn();
    render(<Pagination currentPage={3} totalPages={5} setCurrentPage={setCurrentPage} />);

    await userEvent.click(screen.getByRole("button", { name: "Primeira página" }));

    expect(setCurrentPage).toHaveBeenCalledWith(0);
  });
});
