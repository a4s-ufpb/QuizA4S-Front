import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import TagManageModal from "./TagManageModal";

vi.mock("../../query/useTagQueries", () => ({
  useMyTagsQuery: () => ({ data: { data: [] } }),
  useCreateTagMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateTagMutation: () => ({ mutateAsync: vi.fn() }),
  useDeleteTagMutation: () => ({ mutate: vi.fn() }),
}));

function wrap(node: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{node}</QueryClientProvider>);
}

describe("TagManageModal", () => {
  beforeEach(() => vi.clearAllMocks());

  it("mostra erro ao tentar criar tag com menos de 3 caracteres", async () => {
    wrap(<TagManageModal open onClose={vi.fn()} />);
    const input = screen.getByLabelText(/Nova tag/i);
    await userEvent.type(input, "ab");
    await userEvent.click(screen.getByRole("button", { name: /Criar/i }));

    expect(screen.getByText(/Mínimo de 3 caracteres/i)).toBeInTheDocument();
  });

  it("aceita nomes com 3 ou mais caracteres", async () => {
    wrap(<TagManageModal open onClose={vi.fn()} />);
    const input = screen.getByLabelText(/Nova tag/i);
    await userEvent.type(input, "java");
    await userEvent.click(screen.getByRole("button", { name: /Criar/i }));

    expect(screen.queryByText(/Mínimo de 3 caracteres/i)).not.toBeInTheDocument();
  });
});
