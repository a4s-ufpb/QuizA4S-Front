import { useNavigate } from "react-router-dom";
import { Modal, Table, Button, Container } from "react-bootstrap";
import Loading from "../loading/Loading";
import { useEffect, useState } from "react";
import { ScoreService } from "./../../service/ScoreService";
import NotFoundComponent from "../notFound/NotFoundComponent";
import "./Ranking.css";

const Ranking = ({ navigatePath, setShowRanking }) => {
  const scoreService = new ScoreService();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { name: themeName } = JSON.parse(localStorage.getItem("theme"));

  const [ranking, setRanking] = useState([]);
  const [isNotFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { id: themeId } = JSON.parse(localStorage.getItem("theme"));

      setLoading(true);
      const response = await scoreService.findRankingByTheme(themeId);
      setLoading(false);

      if (!response.success) {
        setNotFound(true);
        return;
      }

      setRanking(response.data);
    }
    fetchData();
  }, []);

  function closeRanking() {
    setShowRanking(false); // muda o estado do ranking
    navigate(navigatePath);
  }

  return (
    <Modal
      show={true}
      onHide={closeRanking}
      centered
      dialogClassName="custom-modal"
      size="lg"
    >
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>Ranking</Modal.Title>
      </Modal.Header>
      <Modal.Body className="overflow-y-scroll" style={{ maxHeight: "60vh" }}>
        <Container>
          <p className="text-center bg-primary text-white rounded-pill px-3 py-1 mb-3">
            Tema: {themeName}
          </p>
          {ranking && ranking.length > 0 ? (
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th style={{ width: "80%" }}>Usuário</th>
                  <th style={{ width: "20%", textAlign: "center" }}>Pontuação</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((score, index) => (
                  <tr key={score.id}>
                    <td>
                      <span className={`rank-icon rank-${index + 1}`}>
                        {index + 1}
                      </span>
                      {score.user.name}
                    </td>
                    <td className="text-center">{score.result}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : null}
          {isNotFound && (
            <NotFoundComponent title="Nenhuma pontuação cadastrada" />
          )}
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={closeRanking}>
          Voltar
        </Button>
      </Modal.Footer>
      {loading && <Loading />}
    </Modal>
  );
};

export default Ranking;