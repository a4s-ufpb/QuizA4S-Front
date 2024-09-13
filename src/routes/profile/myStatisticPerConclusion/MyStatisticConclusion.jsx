import "./MyStatisticConclusion.css";
import { StatisticService } from "./../../../service/StatisticService";
import { useEffect, useState } from "react";
import Loading from "../../../components/loading/Loading";
import Pagination from "../../../components/pagination/Pagination";
import NotFoundComponent from "../../../components/notFound/NotFoundComponent";
import FilterStatistic from "../../../components/filterStatistic/FilterStatistic"

function MyStatisticConclusion() {
  const statisticService = new StatisticService();

  const [statisticList, setStatisticList] = useState([]);
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
    const { uuid: creatorId } = JSON.parse(localStorage.getItem("user"));
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
  const handleFilter = ({ studentName, themeName, startDate, endDate }) => {
    setStudentName(studentName);
    setThemeName(themeName);
    setStartDate(startDate);
    setEndDate(endDate);
    setCurrentPage(0); // Reseta a página ao aplicar novos filtros
  };

  return (
    <div className="container-statistic-conclusion">
      <FilterStatistic onFilter={handleFilter} />

      <div className="container-table-statistics">
        <table className="table">
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Tema</th>
              <th>Data</th>
              <th>Porcentagem de Acertos</th>
            </tr>
          </thead>
          <tbody>
            {statisticList &&
              statisticList.map((statistic) => (
                <tr key={statistic.id}>
                  <td>{statistic.studentName}</td>
                  <td>{statistic.themeName}</td>
                  <td>{statistic.date}</td>
                  <td>{statistic.percentagemOfHits.toFixed(1)}%</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {!loading && statisticList.length === 0 && (
        <NotFoundComponent title="Nenhuma Estatística Encontrada" />
      )}

      <Pagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
      />

      {loading && <Loading />}
    </div>
  );
}

export default MyStatisticConclusion;
