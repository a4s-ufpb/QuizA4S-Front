import { useEffect, useState } from "react";
import FilterComponent from "../../../components/filterComponent/FilterComponent";
import Pagination from "../../../components/pagination/Pagination";
import Loading from "../../../components/loading/Loading";
import NotFoundComponent from "../../../components/notFound/NotFoundComponent";
import { BsCheckCircleFill, BsFillXCircleFill } from "react-icons/bs";
import { ResponseService } from "../../../service/ResponseService";

import "./MyResponse.css";

const MyResponse = () => {
  const responseService = new ResponseService();

  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [currentDate, setCurrentDate] = useState("");
  const [finalDate, setFinalDate] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const response =
        await responseService.findResponsesByQuestionCreatorAndUsernameAndDate(
          currentPage,
          username,
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
  }, [currentPage, currentDate, finalDate, username]);

  // Altera o estados dos parâmetros para realizar a pesquisa
  function changeData(propsData) {
    setCurrentPage(0); // volta para a página inicial
    setUsername(propsData.username);
    setCurrentDate(propsData.currentDate);
    setFinalDate(propsData.finalDate);
  }

  return (
    <div className="container-my-response">
      <FilterComponent onData={changeData} />
      <div className="container-table">
        <table className="table table-response">
          <thead>
            <tr>
              <th>Usuário</th>
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
                  <td>{response.question.title}</td>
                  <td>{response.alternative.text}</td>
                  <td>
                    {response.alternative.correct ? (
                      <BsCheckCircleFill className="correct-response" />
                    ) : (
                      <BsFillXCircleFill className="fail-response" />
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {!loading && responses.length === 0 && (
        <NotFoundComponent title="Nenhuma resposta encontrada" />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
      />

      {loading && <Loading />}
    </div>
  );
};

export default MyResponse;
