import { useState, type ChangeEvent, type Dispatch, type SetStateAction } from "react";
import { Box, TextField, InputAdornment, Typography } from "@mui/material";
import { BsSearch } from "react-icons/bs";
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
}

const SearchComponent = ({
  title,
  url,
  placeholder,
  onSearch,
  setData,
  setTotalPages,
  setCurrentPage,
}: SearchComponentProps) => {
  const apiFetch = new ApiFetch();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function searchDataName(value: string) {
    const inputName = value;

    if (onSearch) {
      onSearch(inputName);
    }

    setName(inputName);

    setLoading(true);
    const response = await apiFetch.getPages(
      `${url}${inputName}`,
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

  return (
    <Box sx={{ mb: 4 }}>
      {title && (
        <Typography variant="h5" align="center" sx={{ mb: 2, color: "#fff" }}>
          {title}
        </Typography>
      )}
      <TextField
        fullWidth
        placeholder={placeholder}
        value={name}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          searchDataName(e.target.value)
        }
        sx={{ bgcolor: "background.paper", borderRadius: 1, boxShadow: 1 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <BsSearch />
              </InputAdornment>
            ),
          },
        }}
      />
      {loading && <Loading />}
    </Box>
  );
};

export default SearchComponent;
