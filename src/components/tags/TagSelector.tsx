import { Autocomplete, Chip, TextField } from "@mui/material";
import { useMyTagsQuery } from "../../query/useTagQueries";
import type { Tag } from "../../types";

interface Props {
  value: Tag[];
  onChange: (tags: Tag[]) => void;
  label?: string;
}

const TagSelector = ({ value, onChange, label = "Tags" }: Props) => {
  const { data } = useMyTagsQuery();
  const options = data?.data ?? [];

  return (
    <Autocomplete<Tag, true>
      multiple
      options={options}
      value={value}
      onChange={(_, val) => onChange(val)}
      getOptionLabel={(opt) => opt.name}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      renderValue={(val, getItemProps) =>
        val.map((option, index) => {
          const { key, ...rest } = getItemProps({ index });
          return (
            <Chip
              variant="outlined"
              label={option.name}
              {...rest}
              key={key ?? option.id}
            />
          );
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder="Selecione ou crie tags no perfil"
        />
      )}
    />
  );
};

export default TagSelector;
