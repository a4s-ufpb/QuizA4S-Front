import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardContent,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  MenuItem,
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
import AdvancedSearch, {
  type AdvancedField,
  type AdvancedFilterValues,
} from "../../../components/advancedSearch/AdvancedSearch";
import Pagination from "../../../components/pagination/Pagination";
import Loading from "../../../components/loading/Loading";
import NotFoundComponent from "../../../components/notFound/NotFoundComponent";
import {
  BsCheckCircleFill,
  BsFillXCircleFill,
  BsTable,
  BsBarChartFill,
} from "react-icons/bs";
import {
  useResponsesQueryChartQuery,
  useResponsesQueryFilterQuery,
  useUsernamesByCreatorQuery,
  useThemeNamesByCreatorQuery,
} from "../../../query/useResponseQueries";
import QuestionImageGallery from "../../../components/questionImageGallery/QuestionImageGallery";
import { getOrderedQuestionImages } from "../../../util/questionImages";
import { getStoredUser } from "../../../util/storage";
import type { GameMode, Question, ResponseItem } from "../../../types";

const ALTERNATIVE_LABELS = ["A", "B", "C", "D", "E", "F"];

const MyResponse = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedResponse, setSelectedResponse] = useState<ResponseItem | null>(
    null
  );

  const [filters, setFilters] = useState<AdvancedFilterValues>({
    username: "",
    themeName: "",
    currentDate: "",
    finalDate: "",
  });
  const [view, setView] = useState<"table" | "chart">("table");
  const [gameMode, setGameMode] = useState<GameMode>("SINGLE_PLAYER");
  const isMultiplayer = gameMode === "MULTIPLAYER";

  const username = filters.username ?? "";
  const themeName = filters.themeName ?? "";
  const currentDate = filters.currentDate ?? "";
  const finalDate = filters.finalDate ?? "";

  const { uuid: creatorId } = getStoredUser();
  const usernamesQuery = useUsernamesByCreatorQuery(creatorId);
  const themeNamesQuery = useThemeNamesByCreatorQuery(creatorId);
  const usernameOptions = usernamesQuery.data?.success
    ? usernamesQuery.data.data.map((u) => u.username)
    : [];
  const themeOptions = themeNamesQuery.data?.success
    ? themeNamesQuery.data.data.map((t) => t.themeName)
    : [];

  const filterFields: AdvancedField[] = [
    {
      name: "username",
      label: "Usuário",
      type: "autocomplete",
      placeholder: "Nome do usuário",
      options: usernameOptions,
      onFocus: () => usernamesQuery.refetch(),
    },
    {
      name: "themeName",
      label: "Tema",
      type: "autocomplete",
      placeholder: "Nome do tema",
      options: themeOptions,
      onFocus: () => themeNamesQuery.refetch(),
    },
    { name: "currentDate", label: "Data Inicial", type: "date" },
    { name: "finalDate", label: "Data Final", type: "date" },
  ];

  const responsesQuery = useResponsesQueryFilterQuery(
    currentPage,
    username,
    themeName,
    currentDate,
    finalDate,
    gameMode
  );
  // O gráfico só busca com um tema selecionado — sem esse filtro a query
  // varria todas as respostas do banco (lenta com muitos dados).
  const hasThemeFilter = themeName.trim() !== "";
  const chartQuery = useResponsesQueryChartQuery(
    username,
    themeName,
    currentDate,
    finalDate,
    gameMode,
    view === "chart" && hasThemeFilter
  );

  const loading = responsesQuery.isLoading || chartQuery.isLoading;
  const responses = responsesQuery.data?.success
    ? responsesQuery.data.data.content
    : [];
  const totalPages = responsesQuery.data?.success
    ? responsesQuery.data.data.totalPages
    : 0;

  const chartData = useMemo(() => {
    if (!chartQuery.data?.success) return [];

    const totals = new Map<string, { correct: number; wrong: number }>();
    chartQuery.data.data.forEach((item) => {
      const entry = totals.get(item.question.title) ?? {
        correct: 0,
        wrong: 0,
      };
      if (item.alternative.correct) entry.correct += 1;
      else entry.wrong += 1;
      totals.set(item.question.title, entry);
    });

    return Array.from(totals.entries()).map(([questionTitle, { correct, wrong }]) => ({
      questionTitle,
      totalCorrect: correct,
      totalWrong: wrong,
    }));
  }, [chartQuery.data]);

  function applyFilters(values: AdvancedFilterValues) {
    setFilters(values);
    setCurrentPage(0);
  }

  return (
    <Box sx={{ py: 4 }}>
      <AdvancedSearch
        fields={filterFields}
        values={filters}
        onChange={applyFilters}
        leftExtra={
          <TextField
            select
            size="small"
            label="Modo de jogo"
            value={gameMode}
            onChange={(e) => setGameMode(e.target.value as GameMode)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="SINGLE_PLAYER">Um jogador</MenuItem>
            <MenuItem value="MULTIPLAYER">Multiplayer</MenuItem>
          </TextField>
        }
        rightExtra={
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
        }
      />

      {view === "table" ? (
        <>
          <TableContainer component={Paper} sx={{ width: "100%" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Usuário</TableCell>
                  <TableCell>Tema</TableCell>
                  {/* No multiplayer não faz sentido o título da questão (o
                      jogador responde no ritmo do Kahoot) — mostra só a
                      alternativa marcada. */}
                  {!isMultiplayer && <TableCell>Questão</TableCell>}
                  <TableCell>Respondeu</TableCell>
                  <TableCell align="center">Acertou</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {responses &&
                  responses.map((response) => (
                    <TableRow
                      key={response.id}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => setSelectedResponse(response)}
                    >
                      <TableCell>{response.user.name}</TableCell>
                      <TableCell>{response.question.theme.name}</TableCell>
                      {!isMultiplayer && (
                        <TableCell>{response.question.title}</TableCell>
                      )}
                      <TableCell>{response.alternative.text}</TableCell>
                      <TableCell align="center">
                        {response.alternative.correct ? (
                          <BsCheckCircleFill color="green" />
                        ) : (
                          <BsFillXCircleFill color="red" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          {!loading && responses.length === 0 && (
            <NotFoundComponent title="Nenhuma resposta encontrada" />
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            color={"dark"}
          />
        </>
      ) : !hasThemeFilter ? (
        <Alert severity="info" sx={{ mt: 1 }}>
          Selecione um tema no filtro acima (e clique em Filtrar) para exibir o
          gráfico.
        </Alert>
      ) : (
        <Paper sx={{ width: "100%", p: 2 }}>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="questionTitle" hide />
              <YAxis allowDecimals={false} />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="totalCorrect" name="Respostas Certas" fill="#5bcebf" />
              <Bar dataKey="totalWrong" name="Respostas Erradas" fill="#d9434f" />
            </BarChart>
          </ResponsiveContainer>

          {!loading && chartData.length === 0 && (
            <NotFoundComponent title="Nenhuma resposta encontrada" />
          )}
        </Paper>
      )}

      {loading && <Loading />}

      <Dialog
        open={Boolean(selectedResponse)}
        onClose={() => setSelectedResponse(null)}
        fullWidth
        maxWidth="sm"
      >
        {selectedResponse && (
          <>
            <DialogTitle>Detalhes da resposta</DialogTitle>
            <DialogContent>
              <Typography>
                <strong>Usuário:</strong> {selectedResponse.user.name}
              </Typography>
              <Typography>
                <strong>Tema:</strong> {selectedResponse.question.theme.name}
              </Typography>
              <Typography>
                <strong>Data:</strong> {selectedResponse.dateTime}
              </Typography>
              <Typography sx={{ mt: 2, mb: 1 }}>
                <strong>Questão:</strong> {selectedResponse.question.title}
              </Typography>

              {(() => {
                const images = getOrderedQuestionImages(
                  selectedResponse.question as Partial<Question>
                );
                return (
                  images.length > 0 && (
                    <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                      <QuestionImageGallery images={images} />
                    </Box>
                  )
                );
              })()}

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {selectedResponse.questionAlternatives.map((alt, index) => {
                  const wasChosen =
                    alt.text === selectedResponse.alternative.text;
                  return (
                    <Card
                      key={alt.id ?? index}
                      sx={{
                        bgcolor: alt.correct
                          ? "rgba(46, 125, 50, 0.5)"
                          : wasChosen
                            ? "rgba(211, 47, 47, 0.3)"
                            : undefined,
                      }}
                    >
                      <CardContent
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography sx={{ fontWeight: "bold" }}>
                          {ALTERNATIVE_LABELS[index]}
                        </Typography>
                        <Typography sx={{ flexGrow: 1 }}>{alt.text}</Typography>
                        {wasChosen && (
                          <Typography variant="body2" color="text.secondary">
                            Escolhida
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button variant="contained" onClick={() => setSelectedResponse(null)}>
                Fechar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default MyResponse;
