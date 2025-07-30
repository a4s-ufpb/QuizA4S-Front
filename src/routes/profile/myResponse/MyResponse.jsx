import { useEffect, useState } from "react";
import { Container, Table, Row, Col } from "react-bootstrap";
import FilterComponent from "../../../components/filterComponent/FilterComponent";
import Pagination from "../../../components/pagination/Pagination";
import Loading from "../../../components/loading/Loading";
import NotFoundComponent from "../../../components/notFound/NotFoundComponent";
import { BsCheckCircleFill, BsFillXCircleFill } from "react-icons/bs";
import { ResponseService } from "../../../service/ResponseService";

const MyResponse = () => {
  const responseService = new ResponseService();

  const [responses, setResponses] = useState([]);
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

      const response = await responseService.findResponsesByQuestionCreatorAndUsernameAndDateAndThemeName(
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
  function changeData(propsData) {
    setCurrentPage(0); // volta para a página inicial
    setUsername(propsData.username);
    setCurrentDate(propsData.currentDate);
    setFinalDate(propsData.finalDate);
    setThemeName(propsData.themeName);
  }

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <FilterComponent onData={changeData} />
        </Col>
      </Row>
      <Row>
        <Col>
          <Table striped bordered hover responsive className="mt-3">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Tema</th>
                <th>Questão</th>
                <th>Respondeu</th>
                <th>Acertou</th>
              </tr>
            </thead>
            <tbody>
              {responses &&
                responses.map((response) => (
                  <tr key={response.id}>
                    <td>{response.user.name}</td>
                    <td>{response.question.theme.name}</td>
                    <td>{response.question.title}</td>
                    <td>{response.alternative.text}</td>
                    <td className="text-center">
                      {response.alternative.correct ? (
                        <BsCheckCircleFill className="text-success" />
                      ) : (
                        <BsFillXCircleFill className="text-danger" />
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </Col>
      </Row>
      {!loading && responses.length === 0 && (
        <Row>
          <Col>
            <NotFoundComponent title="Nenhuma resposta encontrada" />
          </Col>
        </Row>
      )}
      <Row>
        <Col>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            color={"dark"}
          />
        </Col>
      </Row>
      {loading && <Loading />}
    </Container>
  );
};

export default MyResponse;