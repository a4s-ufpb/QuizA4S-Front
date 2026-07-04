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
  useDistinctStudentNameByCreatorIdQuery,
  useDistinctThemeNameByCreatorIdQuery,
} from "../../query/useStatisticQueries";
import { getStoredUser } from "../../util/storage";
import "./FilterStatistic.css";

export interface StatisticFilterData {
  studentName: string;
  themeName: string;
  startDate: string;
  endDate: string;
}

interface FilterStatisticProps {
  onFilter: (data: StatisticFilterData) => void;
}

const FilterStatistic = ({ onFilter }: FilterStatisticProps) => {
  const [studentName, setStudentName] = useState("");
  const [themeName, setThemeName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showFilterPerDate, setFilterPerDate] = useState(false);

  const { uuid: creatorId } = getStoredUser();
  const studentNamesQuery = useDistinctStudentNameByCreatorIdQuery(creatorId);
  const themeNamesQuery = useDistinctThemeNameByCreatorIdQuery(creatorId);
  const studentNameList = studentNamesQuery.data?.success
    ? studentNamesQuery.data.data || []
    : [];
  const themeNameList = themeNamesQuery.data?.success
    ? themeNamesQuery.data.data || []
    : [];

  const handleFilter = () => {
    onFilter({
      studentName,
      themeName,
      startDate,
      endDate,
    });
  };

  const clearInputs = () => {
    setStudentName("");
    setThemeName("");
    setStartDate("");
    setEndDate("");
    onFilter({ studentName: "", themeName: "", startDate: "", endDate: "" });
  };

  return (
    <div className="filter-container">
      <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
        <Autocomplete
          freeSolo
          fullWidth
          sx={{ flex: 1 }}
          options={studentNameList.map((data) => data.studentName)}
          inputValue={studentName}
          onInputChange={(_e, newValue) => setStudentName(newValue)}
          onFocus={() => studentNamesQuery.refetch()}
          renderInput={(params) => (
            <TextField {...params} label="Usuário" placeholder="Nome do Usuário" />
          )}
        />

        <Autocomplete
          freeSolo
          fullWidth
          sx={{ flex: 2, minWidth: 280 }}
          options={themeNameList.map((data) => data.themeName)}
          inputValue={themeName}
          onInputChange={(_e, newValue) => setThemeName(newValue)}
          onFocus={() => themeNamesQuery.refetch()}
          renderInput={(params) => (
            <TextField {...params} label="Tema" placeholder="Tema" />
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
              label="Data Início"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              label="Data Fim"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
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

export default FilterStatistic;
