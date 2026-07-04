import { useEffect, useState } from "react";
import {
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
import FilterComponent, {
  type ResponseFilterData,
} from "../../../components/filterComponent/FilterComponent";
import Pagination from "../../../components/pagination/Pagination";
import Loading from "../../../components/loading/Loading";
import NotFoundComponent from "../../../components/notFound/NotFoundComponent";
import {
  BsCheckCircleFill,
  BsFillXCircleFill,
  BsTable,
  BsBarChartFill,
} from "react-icons/bs";
import { ResponseService } from "../../../service/ResponseService";
import QuestionImageGallery from "../../../components/questionImageGallery/QuestionImageGallery";
import { getOrderedQuestionImages } from "../../../util/questionImages";
import type { Question, ResponseItem } from "../../../types";

const ALTERNATIVE_LABELS = ["A", "B", "C", "D", "E", "F"];

const MyResponse = () => {
  const responseService = new ResponseService();

  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedResponse, setSelectedResponse] = useState<ResponseItem | null>(
    null
  );

  const [currentDate, setCurrentDate] = useState("");
  const [finalDate, setFinalDate] = useState("");
  const [username, setUsername] = useState("");
  const [themeName, setThemeName] = useState("");
  const [view, setView] = useState<"table" | "chart">("table");
  const [chartData, setChartData] = useState<
    { questionTitle: string; totalCorrect: number; totalWrong: number }[]
  >([]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const response =
        await responseService.findResponsesByQuestionCreatorAndUsernameAndDateAndThemeName(
          currentPage,
          username,
          themeName,
          currentDate,
          finalDate
        );
      setLoading(false);
      if (!response.success) {
        setResponses([]);
        setTotalPages(0);
        setCurrentPage(0);
        return;
      }

      setResponses(response.data.content);
      setTotalPages(response.data.totalPages);
    }

    fetchData();
  }, [currentPage, currentDate, finalDate, username, themeName]);

  useEffect(() => {
    if (view !== "chart") return;

    async function fetchChartData() {
      setLoading(true);
      const response =
        await responseService.findResponsesByQuestionCreatorAndUsernameAndDateAndThemeNameForChart(
          username,
          themeName,
          currentDate,
          finalDate
        );
      setLoading(false);

      if (!response.success) {
        setChartData([]);
        return;
      }

      const totals = new Map<string, { correct: number; wrong: number }>();
      response.data.forEach((item) => {
        const entry = totals.get(item.question.title) ?? {
          correct: 0,
          wrong: 0,
        };
        if (item.alternative.correct) entry.correct += 1;
        else entry.wrong += 1;
        totals.set(item.question.title, entry);
      });

      setChartData(
        Array.from(totals.entries()).map(([questionTitle, { correct, wrong }]) => ({
          questionTitle,
          totalCorrect: correct,
          totalWrong: wrong,
        }))
      );
    }

    fetchChartData();
  }, [view, username, themeName, currentDate, finalDate]);

  // Altera o estados dos parâmetros para realizar a pesquisa
  function changeData(propsData: ResponseFilterData) {
    setCurrentPage(0); // volta para a página inicial
    setUsername(propsData.username);
    setCurrentDate(propsData.currentDate);
    setFinalDate(propsData.finalDate);
    setThemeName(propsData.themeName);
  }

  return (
    <Box sx={{ py: 4 }}>
      <FilterComponent onData={changeData} />

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
                  <TableCell>Questão</TableCell>
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
                      <TableCell>{response.question.title}</TableCell>
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
