import { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  type SelectChangeEvent,
} from "@mui/material";
import Loading from "../../../components/loading/Loading";
import NotFoundComponent from "../../../components/notFound/NotFoundComponent";
import { ThemeService } from "../../../service/ThemeService";
import { ResponseService } from "../../../service/ResponseService";
import { UserService } from "../../../service/UserService";
import { getStoredUser } from "../../../util/storage";
import type { ResponseStatistic, Theme } from "../../../types";

function MyStatistics() {
  const themeService = new ThemeService();
  const responseService = new ResponseService();
  const userService = new UserService();

  const [loading, setLoading] = useState(false);
  const [themeNamesList, setThemeNamesList] = useState<Theme[]>([]);
  const [statistics, setStatistics] = useState<ResponseStatistic[]>([]);
  const [selectedTheme, setSelectedTheme] = useState("");

  const { uuid: userId } = getStoredUser();

  async function fetchData() {
    setLoading(true);

    try {
      const validateUser = await userService.validateIfUserIsAdmin(userId);
      const isAdmin = validateUser.data.isAdmin;

      const fetchThemes = isAdmin
        ? themeService.findAllThemes("", 0)
        : themeService.findThemesByCreator("", 0);

      const response = await fetchThemes;

      const themes = response.data.content || [];
      setThemeNamesList(themes);

      if (themes.length > 0) {
        const firstThemeName = themes[0].name;
        setSelectedTheme(firstThemeName);
        searchStatistics(firstThemeName);
      }
    } catch (error) {
      setThemeNamesList([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function searchStatistics(nameOfTheme: string) {
    if (nameOfTheme === "") {
      setStatistics([]);
      return;
    }

    setLoading(true);
    const response = await responseService.findResponsesStatistics(
      nameOfTheme,
      userId
    );
    setLoading(false);

    if (!response.success) {
      alert("Tente novamente mais tarde!");
      return;
    }

    setStatistics(response.data);
    setSelectedTheme(nameOfTheme);
  }

  return (
    <Box sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
        <FormControl sx={{ minWidth: 260 }}>
          <InputLabel id="theme-select-label">Selecione um tema</InputLabel>
          <Select
            labelId="theme-select-label"
            label="Selecione um tema"
            value={selectedTheme}
            onChange={(e: SelectChangeEvent) =>
              searchStatistics(e.target.value)
            }
          >
            {themeNamesList &&
              themeNamesList.map((theme) => (
                <MenuItem value={theme.name} key={theme.name}>
                  {theme.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Título da Questão</TableCell>
              <TableCell>Total de Respostas</TableCell>
              <TableCell>Respostas Certas</TableCell>
              <TableCell>Respostas Erradas</TableCell>
              <TableCell>Porcentagem de Certas</TableCell>
              <TableCell>Porcentagem de Erradas</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {statistics &&
              statistics.map((statistic) => (
                <TableRow key={statistic.questionId} hover>
                  <TableCell>{statistic.questionTitle}</TableCell>
                  <TableCell>{statistic.totalOfAnswers}</TableCell>
                  <TableCell>{statistic.totalOfCorrectAnswers}</TableCell>
                  <TableCell>{statistic.totalOfIncorrectAnswers}</TableCell>
                  <TableCell>
                    {statistic.percentageOfAnswersCorrect.toFixed(1)}%
                  </TableCell>
                  <TableCell>
                    {statistic.percentageOfAnswersIncorrect.toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {!loading && themeNamesList.length === 0 && (
        <NotFoundComponent title="Nenhuma estatística encontrada" />
      )}

      {loading && <Loading />}
    </Box>
  );
}

export default MyStatistics;
