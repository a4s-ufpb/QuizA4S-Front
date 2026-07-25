import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Chip,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { useAllTagsQuery } from "../../query/useTagQueries";

interface Props {
  selected: number[];
  onChange: (ids: number[]) => void;
}

/**
 * Filtro de tags: select dropdown com todas as tags do sistema; ao selecionar
 * uma tag ela vira badge abaixo. Clicar no X do badge remove.
 */
const ThemeTagFilterBar = ({ selected, onChange }: Props) => {
  const { data } = useAllTagsQuery();
  const tags = data?.data ?? [];

  const available = tags.filter((t) => !selected.includes(t.id));
  const selectedTags = tags.filter((t) => selected.includes(t.id));

  function handleAdd(e: SelectChangeEvent<number | "">) {
    const value = e.target.value;
    if (value === "" || value === 0) return;
    const id = Number(value);
    if (!selected.includes(id)) onChange([...selected, id]);
  }

  function remove(id: number) {
    onChange(selected.filter((x) => x !== id));
  }

  if (tags.length === 0) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <FormControl size="small" sx={{ minWidth: 240 }}>
        <InputLabel>Filtrar por tag</InputLabel>
        <Select<number | "">
          value={""}
          label="Filtrar por tag"
          onChange={handleAdd}
          displayEmpty
        >
          <MenuItem value="">
            <em></em>
          </MenuItem>
          {available.map((t) => (
            <MenuItem key={t.id} value={t.id}>
              {t.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedTags.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Tags aplicadas:
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: "wrap" }}>
            {selectedTags.map((t) => (
              <Chip
                key={t.id}
                label={t.name}
                color="primary"
                onDelete={() => remove(t.id)}
              />
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default ThemeTagFilterBar;
