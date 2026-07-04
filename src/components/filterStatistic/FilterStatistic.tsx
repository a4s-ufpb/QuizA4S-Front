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
import { StatisticService } from "../../service/StatisticService";
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
  const [studentNameList, setStudentNameList] = useState<
    { studentName: string }[]
  >([]);
  const [themeNameList, setThemeNameList] = useState<{ themeName: string }[]>(
    []
  );
  const [showFilterPerDate, setFilterPerDate] = useState(false);

  const statisticService = new StatisticService();

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

  const fetchDistinctStudentNames = async () => {
    const { uuid: creatorId } = getStoredUser();

    const response =
      await statisticService.findDistinctStudentNameByCreatorId(creatorId);
    if (response.success) {
      setStudentNameList(response.data || []);
    } else {
      console.error(response.message);
    }
  };

  const fetchDistinctThemeNames = async () => {
    const { uuid: creatorId } = getStoredUser();

    const response =
      await statisticService.findDistinctThemeNameByCreatorId(creatorId);
    if (response.success) {
      setThemeNameList(response.data || []);
    } else {
      console.error(response.message);
    }
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
          onFocus={fetchDistinctStudentNames}
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
          onFocus={fetchDistinctThemeNames}
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
