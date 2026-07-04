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
import { useResponsesStatisticsQuery } from "../../../query/useResponseQueries";
import { useIsAdminQuery } from "../../../query/useUserQueries";
import {
  useAllThemesQuery,
  useThemesByCreatorQuery,
} from "../../../query/useThemeQueries";
import { getStoredUser } from "../../../util/storage";
import type { GameMode } from "../../../types";

function MyStatistics() {
  const [selectedTheme, setSelectedTheme] = useState("");
  const [view, setView] = useState<"table" | "chart">("table");
  const [gameMode, setGameMode] = useState<GameMode>("SINGLE_PLAYER");

  const { uuid: userId } = getStoredUser();

  const isAdminQuery = useIsAdminQuery(userId);
  const isAdmin = isAdminQuery.data?.data.isAdmin ?? false;
  const isAdminKnown = isAdminQuery.isSuccess;

  const allThemesQuery = useAllThemesQuery("", 0, isAdminKnown && isAdmin);
  const creatorThemesQuery = useThemesByCreatorQuery(
    "",
    0,
    isAdminKnown && !isAdmin
  );
  const themesQuery = isAdmin ? allThemesQuery : creatorThemesQuery;
  const themeNamesList = themesQuery.data?.success
    ? themesQuery.data.data.content || []
    : [];

  useEffect(() => {
    if (themeNamesList.length > 0 && !selectedTheme) {
      setSelectedTheme(themeNamesList[0].name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeNamesList]);

  const statisticsQuery = useResponsesStatisticsQuery(
    selectedTheme,
    userId,
    gameMode
  );
  const loading = statisticsQuery.isLoading;
  const fetchError = statisticsQuery.isSuccess && !statisticsQuery.data.success;
  const statistics = statisticsQuery.data?.success ? statisticsQuery.data.data : [];

  return (
    <Box sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 2,
          flexWrap: "wrap",
          mb: 3,
        }}
      >
        <FormControl sx={{ minWidth: 260 }}>
          <InputLabel id="theme-select-label">Selecione um tema</InputLabel>
          <Select
            labelId="theme-select-label"
            label="Selecione um tema"
            value={selectedTheme}
            onChange={(e: SelectChangeEvent) => setSelectedTheme(e.target.value)}
          >
            {themeNamesList &&
              themeNamesList.map((theme) => (
                <MenuItem value={theme.name} key={theme.name}>
                  {theme.name}
                </MenuItem>
              ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel id="game-mode-select-label">Modo de jogo</InputLabel>
          <Select
            labelId="game-mode-select-label"
            label="Modo de jogo"
            value={gameMode}
            onChange={(e: SelectChangeEvent) =>
              setGameMode(e.target.value as GameMode)
            }
          >
            <MenuItem value="SINGLE_PLAYER">Um jogador</MenuItem>
            <MenuItem value="MULTIPLAYER">Multiplayer</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {fetchError && (
        <Alert severity="error" sx={{ mb: 2 }}>
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

      {!loading && !themesQuery.isLoading && themeNamesList.length === 0 && (
        <NotFoundComponent title="Nenhuma estatística encontrada" />
      )}

      {(loading || themesQuery.isLoading || isAdminQuery.isLoading) && <Loading />}
    </Box>
  );
}

export default MyStatistics;
