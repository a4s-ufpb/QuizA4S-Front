import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import type { ResponseItem, Question } from "../../../types";
import QuestionImageGallery from "../../../components/questionImageGallery/QuestionImageGallery";
import { getOrderedQuestionImages } from "../../../util/questionImages";
import { usePersistedState } from "../../../hooks/usePersistedState";
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

const ALTERNATIVE_LABELS = ["A", "B", "C", "D", "E", "F"];

const MyOwnResponses = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = usePersistedState<number>("myOwnResponses:size", 20);
  const [selectedResponse, setSelectedResponse] = useState<ResponseItem | null>(null);

  const [filters, setFilters] = usePersistedState<AdvancedFilterValues>(
    "myOwnResponses:filters",
    { themeName: "", startDate: "", endDate: "" }
  );
  const [gameMode, setGameMode] = usePersistedState<GameMode | "">(
    "myOwnResponses:gameMode",
    ""
  );

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
    gameMode,
    true,
    pageSize
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
      <Alert severity="info" sx={{ mb: 2 }}>
        Aqui você encontra todas as suas respostas nos quizzes que jogou. Filtre por tema, data ou modo de jogo para acompanhar sua evolução!
      </Alert>
      <AdvancedSearch
        fields={FILTER_FIELDS}
        values={filters}
        onChange={applyFilters}
        modalExtra={
          <TextField
            select
            size="small"
            label="Modo de jogo"
            value={gameMode}
            onChange={(e) => setGameMode(e.target.value as GameMode | "")}
            fullWidth
          >
            <MenuItem value="">Todos</MenuItem>
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
              <TableRow
                key={response.id}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() => setSelectedResponse(response)}
              >
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
        pageItemsCount={responses.length}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
      />

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
              <Typography><strong>Tema:</strong> {selectedResponse.question.theme.name}</Typography>
              <Typography><strong>Data:</strong> {selectedResponse.dateTime}</Typography>
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
                  const wasChosen = alt.text === selectedResponse.alternative.text;
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
                      <CardContent sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography sx={{ fontWeight: "bold" }}>
                          {ALTERNATIVE_LABELS[index]}
                        </Typography>
                        <Typography sx={{ flexGrow: 1 }}>{alt.text}</Typography>
                        {wasChosen && (
                          <Typography variant="body2" color="text.secondary">Escolhida</Typography>
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

export default MyOwnResponses;
