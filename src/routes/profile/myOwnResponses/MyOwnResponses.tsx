import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  MenuItem,
} from "@mui/material";
import {
  BsTrophyFill,
  BsCheckCircleFill,
  BsFillXCircleFill,
} from "react-icons/bs";
import Pagination from "../../../components/pagination/Pagination";
import Loading from "../../../components/loading/Loading";
import NotFoundComponent from "../../../components/notFound/NotFoundComponent";
import AdvancedSearch, {
  type AdvancedField,
  type AdvancedFilterValues,
} from "../../../components/advancedSearch/AdvancedSearch";
import {
  useMyResponsesQuery,
  useMySummaryQuery,
} from "../../../query/useResponseQueries";
import type { GameMode } from "../../../types";

const FILTER_FIELDS: AdvancedField[] = [
  { name: "themeName", label: "Tema", type: "text", placeholder: "Filtrar por tema" },
  { name: "startDate", label: "Data Inicial", type: "date" },
  { name: "endDate", label: "Data Final", type: "date" },
];

const MyOwnResponses = () => {
  const [currentPage, setCurrentPage] = useState(0);

  const [filters, setFilters] = useState<AdvancedFilterValues>({
    themeName: "",
    startDate: "",
    endDate: "",
  });
  const [gameMode, setGameMode] = useState<GameMode>("SINGLE_PLAYER");

  const themeName = filters.themeName ?? "";
  const startDate = filters.startDate ?? "";
  const endDate = filters.endDate ?? "";

  function applyFilters(values: AdvancedFilterValues) {
    setFilters(values);
    setCurrentPage(0);
  }

  const responsesQuery = useMyResponsesQuery(
    currentPage,
    themeName,
    startDate,
    endDate,
    gameMode
  );
  const summaryQuery = useMySummaryQuery(themeName, startDate, endDate, gameMode);

  const loading = responsesQuery.isLoading || summaryQuery.isLoading;
  const responses = responsesQuery.data?.success
    ? responsesQuery.data.data.content
    : [];
  const totalPages = responsesQuery.data?.success
    ? responsesQuery.data.data.totalPages
    : 0;
  const summary = summaryQuery.data?.success
    ? summaryQuery.data.data
    : {
        totalQuizzesFinished: 0,
        totalCorrectAnswers: 0,
        totalWrongAnswers: 0,
      };

  return (
    <Box sx={{ py: 4 }}>
      <AdvancedSearch
        fields={FILTER_FIELDS}
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
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
          gap: 2,
          mb: 3,
        }}
      >
        <Card elevation={2}>
          <CardContent sx={{ textAlign: "center" }}>
            <BsTrophyFill color="#3f7fd6" size={28} />
            <Typography variant="h5" sx={{ mt: 1 }}>
              {summary.totalQuizzesFinished}
            </Typography>
            <Typography color="text.secondary">Quizzes Finalizados</Typography>
          </CardContent>
        </Card>
        <Card elevation={2}>
          <CardContent sx={{ textAlign: "center" }}>
            <BsCheckCircleFill color="green" size={28} />
            <Typography variant="h5" sx={{ mt: 1 }}>
              {summary.totalCorrectAnswers}
            </Typography>
            <Typography color="text.secondary">Respostas Certas</Typography>
          </CardContent>
        </Card>
        <Card elevation={2}>
          <CardContent sx={{ textAlign: "center" }}>
            <BsFillXCircleFill color="red" size={28} />
            <Typography variant="h5" sx={{ mt: 1 }}>
              {summary.totalWrongAnswers}
            </Typography>
            <Typography color="text.secondary">Respostas Erradas</Typography>
          </CardContent>
        </Card>
      </Box>

      <TableContainer component={Paper} sx={{ width: "100%" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tema</TableCell>
              <TableCell>Questão</TableCell>
              <TableCell>Respondeu</TableCell>
              <TableCell>Data</TableCell>
              <TableCell align="center">Acertou</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {responses.map((response) => (
              <TableRow key={response.id} hover>
                <TableCell>{response.question.theme.name}</TableCell>
                <TableCell>{response.question.title}</TableCell>
                <TableCell>{response.alternative.text}</TableCell>
                <TableCell>{response.dateTime}</TableCell>
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

      {loading && <Loading />}
    </Box>
  );
};

export default MyOwnResponses;
