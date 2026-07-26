import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RichTextEditor from "./RichTextEditor";

describe("RichTextEditor", () => {
  it("renderiza toolbar com botões de formatação", () => {
    render(<RichTextEditor value="" onChange={vi.fn()} />);
    expect(screen.getByLabelText(/Negrito/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Itálico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sublinhado/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Lista$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Lista numerada/i)).toBeInTheDocument();
  });

  it("propaga texto digitado via onChange", async () => {
    const onChange = vi.fn();
    const { container } = render(<RichTextEditor value="" onChange={onChange} />);
    const editable = container.querySelector("[contenteditable]") as HTMLElement;
    editable.focus();
    await userEvent.type(editable, "hello");
    expect(onChange).toHaveBeenCalled();
  });

  it("mostra helperText", () => {
    render(<RichTextEditor value="" onChange={vi.fn()} helperText="mínimo 5 chars" />);
    expect(screen.getByText(/mínimo 5 chars/i)).toBeInTheDocument();
  });
});
