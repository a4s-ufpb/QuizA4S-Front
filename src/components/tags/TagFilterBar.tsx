import { Chip, Stack, Typography, Box } from "@mui/material";
import { useTagsByCreatorQuery } from "../../query/useTagQueries";

interface Props {
  creatorUuid?: string;
  selected: number[];
  onChange: (ids: number[]) => void;
}

/**
 * Barra de filtro de tags. Se `creatorUuid` for informado, carrega tags
 * desse criador; caso contrário exibe input vazio (o filtro seleciona
 * livremente).
 */
const TagFilterBar = ({ creatorUuid, selected, onChange }: Props) => {
  const { data } = useTagsByCreatorQuery(creatorUuid ?? "", !!creatorUuid);
  const tags = data?.data ?? [];

  if (!creatorUuid || tags.length === 0) return null;

  function toggle(id: number) {
    if (selected.includes(id)) onChange(selected.filter((x) => x !== id));
    else onChange([...selected, id]);
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary">
        Filtrar por tag:
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: "wrap" }}>
        {tags.map((t) => (
          <Chip
            key={t.id}
            label={t.name}
            color={selected.includes(t.id) ? "primary" : "default"}
            variant={selected.includes(t.id) ? "filled" : "outlined"}
            onClick={() => toggle(t.id)}
            clickable
          />
        ))}
      </Stack>
    </Box>
  );
};

export default TagFilterBar;
