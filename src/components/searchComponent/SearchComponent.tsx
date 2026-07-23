import { useState, type ChangeEvent, type Dispatch, type SetStateAction } from "react";
import { Box, Button, TextField, InputAdornment, IconButton, Typography, Stack } from "@mui/material";
import { BsSearch, BsX } from "react-icons/bs";
import { ApiFetch } from "../../util/ApiFetch";
import Loading from "../loading/Loading";

interface SearchComponentProps {
  title?: string;
  url: string;
  placeholder: string;
  onSearch?: (name: string) => void;
  setData: Dispatch<SetStateAction<any[]>>;
  setTotalPages: Dispatch<SetStateAction<number>>;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  /** Quando true, a busca só dispara ao clicar no botão "Filtrar" */
  searchOnButton?: boolean;
  buttonLabel?: string;
}

const SearchComponent = ({
  title,
  url,
  placeholder,
  onSearch,
  setData,
  setTotalPages,
  setCurrentPage,
  searchOnButton = false,
  buttonLabel = "Filtrar",
}: SearchComponentProps) => {
  const apiFetch = new ApiFetch();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function doSearch(value: string) {
    if (onSearch) onSearch(value);

    setLoading(true);
    const response = await apiFetch.getPages(
      `${url}${value}`,
      "Nenhum tema encontrado!"
    );

    if (!response.success) {
      setLoading(false);
      setData([]);
      setTotalPages(0);
      setCurrentPage(0);
      return;
    }

    setLoading(false);
    setTotalPages(response.totalPages);
    setData(response.data);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setName(value);
    if (!searchOnButton) {
      doSearch(value);
    }
  }

  function handleClear() {
    setName("");
    doSearch("");
  }

  return (
    <Box sx={{ mb: 4 }}>
      {title && (
        <Typography variant="h5" align="center" sx={{ mb: 2, color: "#fff" }}>
          {title}
        </Typography>
      )}
      <Stack direction="row" spacing={1}>
        <TextField
          fullWidth
          placeholder={placeholder}
          value={name}
          onChange={handleChange}
          onKeyDown={(e) => {
            if (searchOnButton && e.key === "Enter") doSearch(name);
          }}
          sx={{ bgcolor: "background.paper", borderRadius: 1, boxShadow: 1 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <BsSearch />
                </InputAdornment>
              ),
              endAdornment: name ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClear} edge="end" aria-label="Limpar busca">
                    <BsX />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            },
          }}
        />
        {searchOnButton && (
          <Button variant="contained" onClick={() => doSearch(name)} sx={{ whiteSpace: "nowrap" }}>
            {buttonLabel}
          </Button>
        )}
      </Stack>
      {loading && <Loading />}
    </Box>
  );
};

export default SearchComponent;
