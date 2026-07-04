import { useEffect, useState } from "react";
import {
  Alert,
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
  ToggleButtonGroup,
  ToggleButton,
  type SelectChangeEvent,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BsTable, BsBarChartFill } from "react-icons/bs";
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
  const [view, setView] = useState<"table" | "chart">("table");
  const [fetchError, setFetchError] = useState(false);

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
    setFetchError(false);
    const response = await responseService.findResponsesStatistics(
      nameOfTheme,
      userId
    );
    setLoading(false);

    if (!response.success) {
      setFetchError(true);
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

      {fetchError && (
        <Alert severity="error" onClose={() => setFetchError(false)} sx={{ mb: 2 }}>
          Não foi possível carregar as estatísticas. Tente novamente mais tarde.
        </Alert>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={view}
          onChange={(_e, newView) => newView && setView(newView)}
        >
          <ToggleButton value="table">
            <BsTable style={{ marginRight: 6 }} /> Tabela
          </ToggleButton>
          <ToggleButton value="chart">
            <BsBarChartFill style={{ marginRight: 6 }} /> Gráfico
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {view === "table" ? (
        <TableContainer component={Paper} sx={{ width: "100%" }}>
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
      ) : (
        <Paper sx={{ width: "100%", p: 2 }}>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={statistics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="questionTitle" hide />
              <YAxis allowDecimals={false} />
              <RechartsTooltip />
              <Legend />
              <Bar
                dataKey="totalOfCorrectAnswers"
                name="Respostas Certas"
                fill="#5bcebf"
              />
              <Bar
                dataKey="totalOfIncorrectAnswers"
                name="Respostas Erradas"
                fill="#d9434f"
              />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {!loading && themeNamesList.length === 0 && (
        <NotFoundComponent title="Nenhuma estatística encontrada" />
      )}

      {loading && <Loading />}
    </Box>
  );
}

export default MyStatistics;
