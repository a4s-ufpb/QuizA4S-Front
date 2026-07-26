import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmBox from "./ConfirmBox";

describe("ConfirmBox", () => {
  it("dispara onClickBtn1 no botão positivo", async () => {
    const yes = vi.fn();
    const no = vi.fn();
    render(<ConfirmBox title="?" textBtn1="Sim" textBtn2="Não" onClickBtn1={yes} onClickBtn2={no} />);
    await userEvent.click(screen.getByRole("button", { name: "Sim" }));
    expect(yes).toHaveBeenCalledTimes(1);
    expect(no).not.toHaveBeenCalled();
  });

  it("dispara onClickBtn2 no botão negativo", async () => {
    const yes = vi.fn();
    const no = vi.fn();
    render(<ConfirmBox title="?" textBtn1="Sim" textBtn2="Não" onClickBtn1={yes} onClickBtn2={no} />);
    await userEvent.click(screen.getByRole("button", { name: "Não" }));
    expect(no).toHaveBeenCalledTimes(1);
  });

  it("sem onDismiss: clicar fora chama onClickBtn2 (legacy)", async () => {
    const yes = vi.fn();
    const no = vi.fn();
    render(<ConfirmBox title="?" textBtn1="Sim" textBtn2="Não" onClickBtn1={yes} onClickBtn2={no} />);
    // Backdrop escondida via MUI — simula pressionar ESC.
    await userEvent.keyboard("{Escape}");
    expect(no).toHaveBeenCalled();
  });

  it("com onDismiss: clicar fora NÃO chama onClickBtn2", async () => {
    const yes = vi.fn();
    const no = vi.fn();
    const dismiss = vi.fn();
    render(
      <ConfirmBox
        title="?"
        textBtn1="Sim"
        textBtn2="Não, voltar"
        onClickBtn1={yes}
        onClickBtn2={no}
        onDismiss={dismiss}
      />
    );
    await userEvent.keyboard("{Escape}");
    expect(dismiss).toHaveBeenCalledTimes(1);
    expect(no).not.toHaveBeenCalled();
  });
});
