import { Chip, Stack, Typography, Box } from "@mui/material";
import { useMyTagsQuery } from "../../query/useTagQueries";

interface Props {
  selected: number[];
  onChange: (ids: number[]) => void;
}

const MyTagFilterBar = ({ selected, onChange }: Props) => {
  const isAuth = Boolean(localStorage.getItem("token"));
  const { data } = useMyTagsQuery(isAuth);
  const tags = data?.data ?? [];
  if (!isAuth || tags.length === 0) return null;

  function toggle(id: number) {
    if (selected.includes(id)) onChange(selected.filter((x) => x !== id));
    else onChange([...selected, id]);
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary">
        Filtrar por minhas tags:
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

export default MyTagFilterBar;
