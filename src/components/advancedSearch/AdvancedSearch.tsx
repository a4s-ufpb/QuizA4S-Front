import { useEffect, useState, type ReactNode } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  Stack,
} from "@mui/material";
import { BsSearch, BsXLg, BsFunnelFill } from "react-icons/bs";

export type AdvancedFieldType = "text" | "date" | "autocomplete";

export interface AdvancedField {
  /** Chave no objeto de valores. */
  name: string;
  label: string;
  type: AdvancedFieldType;
  placeholder?: string;
  /** Opções para o tipo autocomplete. */
  options?: string[];
  /** Chamado ao focar (ex.: refetch de opções do autocomplete). */
  onFocus?: () => void;
  /** Formata o valor exibido no badge (default: o próprio valor). */
  formatBadge?: (value: string) => string;
}

export type AdvancedFilterValues = Record<string, string>;

interface AdvancedSearchProps {
  fields: AdvancedField[];
  /** Filtros aplicados (fonte da verdade — pertence ao componente pai). */
  values: AdvancedFilterValues;
  /** Aplica um novo conjunto de filtros (badge/limpar/modal). */
  onChange: (values: AdvancedFilterValues) => void;
  /** Controles extras à esquerda (ex.: seletor de modo de jogo). */
  leftExtra?: ReactNode;
  /** Controles extras à direita (ex.: alternância tabela/gráfico). */
  rightExtra?: ReactNode;
}

/**
 * Filtros em "Busca Avançada": um botão abre um modal com os inputs; os filtros
 * ativos aparecem como badges removíveis abaixo, e há um botão para limpar
 * tudo. Substitui os filtros soltos acima das tabelas.
 */
const AdvancedSearch = ({
  fields,
  values,
  onChange,
  leftExtra,
  rightExtra,
}: AdvancedSearchProps) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<AdvancedFilterValues>(values);

  // Sincroniza o rascunho com os valores aplicados sempre que o modal abre.
  useEffect(() => {
    if (open) setDraft(values);
  }, [open, values]);

  const activeFields = fields.filter((f) => (values[f.name] ?? "").trim() !== "");
  const hasActiveFilters = activeFields.length > 0;

  function applyDraft() {
    onChange(draft);
    setOpen(false);
  }

  function removeFilter(name: string) {
    onChange({ ...values, [name]: "" });
  }

  function clearAll() {
    const cleared: AdvancedFilterValues = {};
    fields.forEach((f) => (cleared[f.name] = ""));
    onChange(cleared);
  }

  function badgeLabel(field: AdvancedField): string {
    const raw = values[field.name] ?? "";
    const shown = field.formatBadge ? field.formatBadge(raw) : raw;
    return `${field.label}: ${shown}`;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        {leftExtra}
        <Button
          variant="contained"
          startIcon={<BsSearch />}
          onClick={() => setOpen(true)}
        >
          Busca Avançada
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<BsXLg />}
          onClick={clearAll}
          disabled={!hasActiveFilters}
        >
          Limpar filtros
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        {rightExtra}
      </Box>

      {hasActiveFilters && (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1.5 }}>
          {activeFields.map((field) => (
            <Chip
              key={field.name}
              color="primary"
              variant="outlined"
              label={badgeLabel(field)}
              onDelete={() => removeFilter(field.name)}
            />
          ))}
        </Box>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <BsFunnelFill /> Busca Avançada
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {fields.map((field) => {
              const value = draft[field.name] ?? "";
              const setValue = (v: string) =>
                setDraft((prev) => ({ ...prev, [field.name]: v }));

              if (field.type === "autocomplete") {
                return (
                  <Autocomplete
                    key={field.name}
                    freeSolo
                    options={field.options ?? []}
                    inputValue={value}
                    onInputChange={(_e, v) => setValue(v)}
                    onFocus={field.onFocus}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={field.label}
                        placeholder={field.placeholder}
                      />
                    )}
                  />
                );
              }

              return (
                <TextField
                  key={field.name}
                  label={field.label}
                  type={field.type === "date" ? "date" : "text"}
                  placeholder={field.placeholder}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  slotProps={
                    field.type === "date"
                      ? { inputLabel: { shrink: true } }
                      : undefined
                  }
                  fullWidth
                />
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            color="error"
            onClick={() => {
              const cleared: AdvancedFilterValues = {};
              fields.forEach((f) => (cleared[f.name] = ""));
              setDraft(cleared);
            }}
          >
            Limpar
          </Button>
          <Button variant="outlined" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button variant="contained" startIcon={<BsSearch />} onClick={applyDraft}>
            Filtrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdvancedSearch;
