import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { useCreateStatisticFeedbackMutation, useStatisticFeedbackByStatQuery } from "../../../query/useStatisticFeedbackQueries";
import RichTextEditor from "../../../components/richText/RichTextEditor";
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
import AdvancedSearch, {
  type AdvancedField,
  type AdvancedFilterValues,
} from "../../../components/advancedSearch/AdvancedSearch";
import Pagination from "../../../components/pagination/Pagination";
import Loading from "../../../components/loading/Loading";
import NotFoundComponent from "../../../components/notFound/NotFoundComponent";
import {
  useAllStatisticByCreatorForChartQuery,
  useAllStatisticByCreatorQuery,
  useDistinctStudentNameByCreatorIdQuery,
  useDistinctThemeNameByCreatorIdQuery,
} from "../../../query/useStatisticQueries";
import { getStoredUser } from "../../../util/storage";

interface ThemeAverage {
  themeName: string;
  averageOfHits: number;
}

function MyStatisticConclusion() {
  const [currentPage, setCurrentPage] = useState(0);
  const [view, setView] = useState<"table" | "chart">("table");
  const [feedbackStat, setFeedbackStat] = useState<{ id: number; studentName: string; themeName: string } | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const createFeedbackMut = useCreateStatisticFeedbackMutation();
  const feedbackListQuery = useStatisticFeedbackByStatQuery(feedbackStat?.id ?? 0, !!feedbackStat);

  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  async function sendFeedback() {
    if (!feedbackStat) return;
    const stripped = feedbackText.replace(/<[^>]*>/g, "").trim();
    if (stripped.length < 5) {
      setFeedbackError("O feedback deve ter no mínimo 5 caracteres");
      return;
    }
    setFeedbackError(null);
    const res = await createFeedbackMut.mutateAsync({ statisticId: feedbackStat.id, text: feedbackText });
    if (res.success) setFeedbackText("");
  }

  const [filters, setFilters] = useState<AdvancedFilterValues>({
    studentName: "",
    themeName: "",
    startDate: "",
    endDate: "",
  });

  const studentName = filters.studentName ?? "";
  const themeName = filters.themeName ?? "";
  const startDate = filters.startDate ?? "";
  const endDate = filters.endDate ?? "";

  const { uuid: creatorId } = getStoredUser();

  const studentNamesQuery = useDistinctStudentNameByCreatorIdQuery(creatorId);
  const themeNamesQuery = useDistinctThemeNameByCreatorIdQuery(creatorId);
  const studentOptions = studentNamesQuery.data?.success
    ? studentNamesQuery.data.data.map((s) => s.studentName)
    : [];
  const themeOptions = themeNamesQuery.data?.success
    ? themeNamesQuery.data.data.map((t) => t.themeName)
    : [];

  const filterFields: AdvancedField[] = [
    {
      name: "studentName",
      label: "Usuário",
      type: "autocomplete",
      placeholder: "Nome do usuário",
      options: studentOptions,
      onFocus: () => studentNamesQuery.refetch(),
    },
    {
      name: "themeName",
      label: "Tema",
      type: "autocomplete",
      placeholder: "Nome do tema",
      options: themeOptions,
      onFocus: () => themeNamesQuery.refetch(),
    },
    { name: "startDate", label: "Data Início", type: "date" },
    { name: "endDate", label: "Data Fim", type: "date" },
  ];

  const statisticQuery = useAllStatisticByCreatorQuery(
    currentPage,
    creatorId,
    studentName,
    themeName,
    startDate,
    endDate
  );
  // O gráfico só busca com um tema selecionado — sem esse filtro a query
  // varria todas as estatísticas do banco (lenta com muitos dados).
  const hasThemeFilter = themeName.trim() !== "";
  const chartQuery = useAllStatisticByCreatorForChartQuery(
    creatorId,
    studentName,
    themeName,
    startDate,
    endDate,
    view === "chart" && hasThemeFilter
  );

  const loading = statisticQuery.isLoading || chartQuery.isLoading;
  const rawStatisticList = statisticQuery.data?.success
    ? statisticQuery.data.data.content
    : [];
  // Item 6: mais recente primeiro
  const statisticList = useMemo(
    () =>
      [...rawStatisticList].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [rawStatisticList]
  );
  const totalPages = statisticQuery.data?.success
    ? statisticQuery.data.data.totalPages
    : 0;

  const chartData = useMemo<ThemeAverage[]>(() => {
    if (!chartQuery.data?.success) return [];

    const totals = new Map<string, { sum: number; count: number }>();
    chartQuery.data.data.forEach((stat) => {
      const entry = totals.get(stat.themeName) ?? { sum: 0, count: 0 };
      entry.sum += stat.percentagemOfHits;
      entry.count += 1;
      totals.set(stat.themeName, entry);
    });

    return Array.from(totals.entries()).map(([name, { sum, count }]) => ({
      themeName: name,
      averageOfHits: Number((sum / count).toFixed(1)),
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
                  <TableCell>Data</TableCell>
                  <TableCell>Porcentagem de Acertos</TableCell>
                  <TableCell align="center">Feedback</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {statisticList &&
                  statisticList.map((statistic) => (
                    <TableRow key={statistic.id} hover>
                      <TableCell>{statistic.studentName}</TableCell>
                      <TableCell>{statistic.themeName}</TableCell>
                      <TableCell>{statistic.date}</TableCell>
                      <TableCell>
                        {statistic.percentagemOfHits.toFixed(1)}%
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setFeedbackStat({
                              id: statistic.id,
                              studentName: statistic.studentName,
                              themeName: statistic.themeName,
                            });
                            setFeedbackText("");
                          }}
                        >
                          Feedback
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          {!loading && statisticList.length === 0 && (
            <NotFoundComponent title="Nenhuma Estatística Encontrada" />
          )}

          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
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
              <XAxis dataKey="themeName" />
              <YAxis allowDecimals={false} unit="%" />
              <RechartsTooltip />
              <Legend />
              <Bar
                dataKey="averageOfHits"
                name="Média de Acertos (%)"
                fill="#3f7fd6"
              />
            </BarChart>
          </ResponsiveContainer>

          {!loading && chartData.length === 0 && (
            <NotFoundComponent title="Nenhuma Estatística Encontrada" />
          )}
        </Paper>
      )}

      {loading && <Loading />}

      <Dialog open={!!feedbackStat} onClose={() => setFeedbackStat(null)} fullWidth maxWidth="sm">
        <DialogTitle>
          Feedback para {feedbackStat?.studentName} — {feedbackStat?.themeName}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <RichTextEditor
              value={feedbackText}
              onChange={setFeedbackText}
              placeholder="Escreva seu feedback (mín. 5 caracteres)"
              minRows={3}
              error={!!feedbackError}
              helperText={feedbackError ?? "Mínimo 5 caracteres. Use as estilizações acima."}
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <strong>Feedbacks anteriores:</strong>
            {(feedbackListQuery.data?.data ?? []).length === 0 ? (
              <p style={{ opacity: 0.6 }}>Nenhum feedback ainda.</p>
            ) : (
              (feedbackListQuery.data?.data ?? []).map((f) => (
                <Paper key={f.id} sx={{ p: 1, my: 1 }}>
                  <div dangerouslySetInnerHTML={{ __html: f.text }} />
                  <small style={{ opacity: 0.6 }}>{f.createdAt}</small>
                </Paper>
              ))
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackStat(null)}>Fechar</Button>
          <Button variant="contained" onClick={sendFeedback} disabled={createFeedbackMut.isPending}>
            Enviar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MyStatisticConclusion;
