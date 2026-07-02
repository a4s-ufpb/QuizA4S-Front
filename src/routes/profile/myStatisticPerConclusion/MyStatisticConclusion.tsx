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
import FilterStatistic, {
  type StatisticFilterData,
} from "../../../components/filterStatistic/FilterStatistic";
import Pagination from "../../../components/pagination/Pagination";
import Loading from "../../../components/loading/Loading";
import NotFoundComponent from "../../../components/notFound/NotFoundComponent";
import { StatisticService } from "../../../service/StatisticService";
import { getStoredUser } from "../../../util/storage";
import type { Statistic } from "../../../types";

function MyStatisticConclusion() {
  const statisticService = new StatisticService();

  const [statisticList, setStatisticList] = useState<Statistic[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  const [studentName, setStudentName] = useState("");
  const [themeName, setThemeName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchData();
  }, [currentPage, studentName, themeName, startDate, endDate]);

  async function fetchData() {
    const { uuid: creatorId } = getStoredUser();
    try {
      setLoading(true);
      const statisticResponse =
        await statisticService.findAllStatisticByCreator(
          currentPage,
          creatorId,
          studentName,
          themeName,
          startDate,
          endDate
        );

      if (!statisticResponse.success) {
        alert("Tente novamente mais tarde!");
        setCurrentPage(0);
        setTotalPages(0);
        setStatisticList([]);
      } else {
        setStatisticList(statisticResponse.data.content);
        setTotalPages(statisticResponse.data.totalPages);
      }
    } catch (error) {
      setStatisticList([]);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

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

      <TableContainer component={Paper} sx={{ mt: 3 }}>
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

      {loading && <Loading />}
    </Box>
  );
}

export default MyStatisticConclusion;
