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
} from "@mui/material";
import FilterComponent, {
  type ResponseFilterData,
} from "../../../components/filterComponent/FilterComponent";
import Pagination from "../../../components/pagination/Pagination";
import Loading from "../../../components/loading/Loading";
import NotFoundComponent from "../../../components/notFound/NotFoundComponent";
import { BsCheckCircleFill, BsFillXCircleFill } from "react-icons/bs";
import { ResponseService } from "../../../service/ResponseService";
import type { ResponseItem } from "../../../types";

const MyResponse = () => {
  const responseService = new ResponseService();

  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [currentDate, setCurrentDate] = useState("");
  const [finalDate, setFinalDate] = useState("");
  const [username, setUsername] = useState("");
  const [themeName, setThemeName] = useState("");

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

      <TableContainer component={Paper} sx={{ mt: 3 }}>
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
                <TableRow key={response.id} hover>
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

      {loading && <Loading />}
    </Box>
  );
};

export default MyResponse;
