import { useMemo, useState } from "react";
import {
  Box,
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
import FilterStatistic, {
  type StatisticFilterData,
} from "../../../components/filterStatistic/FilterStatistic";
import Pagination from "../../../components/pagination/Pagination";
import Loading from "../../../components/loading/Loading";
import NotFoundComponent from "../../../components/notFound/NotFoundComponent";
import {
  useAllStatisticByCreatorForChartQuery,
  useAllStatisticByCreatorQuery,
} from "../../../query/useStatisticQueries";
import { getStoredUser } from "../../../util/storage";

interface ThemeAverage {
  themeName: string;
  averageOfHits: number;
}

function MyStatisticConclusion() {
  const [currentPage, setCurrentPage] = useState(0);
  const [view, setView] = useState<"table" | "chart">("table");

  const [studentName, setStudentName] = useState("");
  const [themeName, setThemeName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { uuid: creatorId } = getStoredUser();

  const statisticQuery = useAllStatisticByCreatorQuery(
    currentPage,
    creatorId,
    studentName,
    themeName,
    startDate,
    endDate
  );
  const chartQuery = useAllStatisticByCreatorForChartQuery(
    creatorId,
    studentName,
    themeName,
    startDate,
    endDate,
    view === "chart"
  );

  const loading = statisticQuery.isLoading || chartQuery.isLoading;
  const statisticList = statisticQuery.data?.success
    ? statisticQuery.data.data.content
    : [];
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

  // Função chamada pelo FilterStatistic para atualizar os filtros
  const handleFilter = ({
    studentName,
    themeName,
    startDate,
    endDate,
  }: StatisticFilterData) => {
    setStudentName(studentName);
    setThemeName(themeName);
    setStartDate(startDate);
    setEndDate(endDate);
    setCurrentPage(0); // Reseta a página ao aplicar novos filtros
  };

  return (
    <Box sx={{ py: 4 }}>
      <FilterStatistic onFilter={handleFilter} />

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, mb: 1 }}>
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
        <>
          <TableContainer component={Paper} sx={{ width: "100%" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Usuário</TableCell>
                  <TableCell>Tema</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Porcentagem de Acertos</TableCell>
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
    </Box>
  );
}

export default MyStatisticConclusion;
