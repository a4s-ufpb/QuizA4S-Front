import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Autocomplete,
  Collapse,
  Stack,
} from "@mui/material";
import { BsCalendar } from "react-icons/bs";
import {
  useThemeNamesByCreatorQuery,
  useUsernamesByCreatorQuery,
} from "../../query/useResponseQueries";
import { getStoredUser } from "../../util/storage";
import "./FilterComponent.css";

export interface ResponseFilterData {
  currentDate: string;
  finalDate: string;
  username: string;
  themeName: string;
}

interface FilterComponentProps {
  onData: (data: ResponseFilterData) => void;
}

const FilterComponent = ({ onData }: FilterComponentProps) => {
  const [currentDate, setCurrentDate] = useState("");
  const [finalDate, setFinalDate] = useState("");
  const [username, setUsername] = useState("");
  const [themeName, setThemeName] = useState("");
  const [showFilterPerDate, setFilterPerDate] = useState(false);

  const { uuid: creatorId } = getStoredUser();
  // Cacheados pelo React Query: buscados uma vez (ao ganhar foco) e
  // reaproveitados nas próximas aberturas do autocomplete.
  const usernamesQuery = useUsernamesByCreatorQuery(creatorId);
  const themeNamesQuery = useThemeNamesByCreatorQuery(creatorId);
  const usernamesList = usernamesQuery.data?.success
    ? usernamesQuery.data.data || []
    : [];
  const themesList = themeNamesQuery.data?.success
    ? themeNamesQuery.data.data || []
    : [];

  const handleFilter = () => {
    onData({
      currentDate,
      finalDate,
      username,
      themeName,
    });
  };

  const clearInputs = () => {
    setCurrentDate("");
    setFinalDate("");
    setUsername("");
    setThemeName("");
    onData({ currentDate: "", finalDate: "", username: "", themeName: "" });
  };

  return (
    <div className="filter-container">
      <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
        <Autocomplete
          freeSolo
          fullWidth
          sx={{ flex: 1 }}
          options={usernamesList.map((data) => data.username)}
          inputValue={username}
          onInputChange={(_e, newValue) => setUsername(newValue)}
          onFocus={() => usernamesQuery.refetch()}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Usuário"
              placeholder="Digite o nome do usuário"
            />
          )}
        />

        <Autocomplete
          freeSolo
          fullWidth
          sx={{ flex: 2, minWidth: 280 }}
          options={themesList.map((data) => data.themeName)}
          inputValue={themeName}
          onInputChange={(_e, newValue) => setThemeName(newValue)}
          onFocus={() => themeNamesQuery.refetch()}
          renderInput={(params) => (
            <TextField {...params} label="Tema" placeholder="Digite o nome do tema" />
          )}
        />
      </Stack>

      <Box sx={{ mt: 3 }}>
        <Button
          variant="text"
          onClick={() => setFilterPerDate(!showFilterPerDate)}
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <BsCalendar /> Filtrar por período
        </Button>
        <Collapse in={showFilterPerDate}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Data Inicial"
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              label="Data Final"
              type="date"
              value={finalDate}
              onChange={(e) => setFinalDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          </Stack>
        </Collapse>
      </Box>

      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button variant="contained" onClick={handleFilter}>
          Filtrar
        </Button>
        <Button variant="contained" color="error" onClick={clearInputs}>
          Limpar
        </Button>
      </Stack>
    </div>
  );
};

export default FilterComponent;
