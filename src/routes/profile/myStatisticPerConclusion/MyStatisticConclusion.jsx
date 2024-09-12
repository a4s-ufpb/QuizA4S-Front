import "./MyStatisticConclusion.css";
import { StatisticService } from "./../../../service/StatisticService";
import { useEffect } from "react";
import { useState } from "react";
import Loading from "../../../components/loading/Loading";
import Pagination from "../../../components/pagination/Pagination";
import NotFoundComponent from "../../../components/notFound/NotFoundComponent";

function MyStatisticConclusion() {
  const statisticService = new StatisticService();

  const [statisticList, setStatisticList] = useState([]);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(false);

  const [studentName, setStudentName] = useState("");
  const [themeName, setThemeName] = useState("");

  useEffect(() => {
    fetchData();
  }, [currentPage, totalPages]);

  async function fetchData() {
    const { uuid: creatorId } = JSON.parse(localStorage.getItem("user"));
    try {
      setLoading(true);

      const statisticResponse =
        await statisticService.findAllStatisticByCreator(
          currentPage,
          creatorId,
          studentName,
          themeName
        );

      if (!statisticResponse.success) {
        alert("Deu erro");
        setCurrentPage(0);
        setTotalPages(0);
      }

      setStatisticList(statisticResponse.data.content);
      setTotalPages(statisticResponse.data.totalPages);
    } catch (error) {
      console.log(error);
      return;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-statistic">
      <div></div>

      <div className="container-table-statistics">
        <table className="table-statistics">
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

      <Pagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
      />

      {loading && <Loading />}

      {!loading && statisticList.length === 0 && (
        <NotFoundComponent title="Nenhuma Estatística Encontrada" />
      )}
    </div>
  );
}

export default MyStatisticConclusion;
