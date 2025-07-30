import { useEffect, useState } from "react";
import { Container, Table, Row, Col } from "react-bootstrap";
import FilterStatistic from "../../../components/filterStatistic/FilterStatistic";
import Pagination from "../../../components/pagination/Pagination";
import Loading from "../../../components/loading/Loading";
import NotFoundComponent from "../../../components/notFound/NotFoundComponent";
import { StatisticService } from "../../../service/StatisticService";

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
      const statisticResponse = await statisticService.findAllStatisticByCreator(
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
    <Container fluid className="py-4">
      <Row className="mb-3">
        <Col>
          <FilterStatistic onFilter={handleFilter} />
        </Col>
      </Row>
      <Row>
        <Col>
          <Table striped bordered hover responsive>
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
          </Table>
        </Col>
      </Row>
      {!loading && statisticList.length === 0 && (
        <Row>
          <Col>
            <NotFoundComponent title="Nenhuma Estatística Encontrada" />
          </Col>
        </Row>
      )}
      <Row>
        <Col>
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            color={"dark"}
          />
        </Col>
      </Row>
      {loading && <Loading />}
    </Container>
  );
}

export default MyStatisticConclusion;