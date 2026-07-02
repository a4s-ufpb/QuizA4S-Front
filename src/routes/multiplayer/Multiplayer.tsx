import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Alert, Row, Col } from "react-bootstrap";
import { GameService } from "../../service/GameService";
import { getGuestId, getGuestName, setGuestName } from "../../util/guest";
import Loading from "../../components/loading/Loading";

const Multiplayer = () => {
  const gameService = new GameService();
  const navigate = useNavigate();

  const [name, setName] = useState(getGuestName());
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function persistName(): boolean {
    if (name.trim().length < 2) {
      setError("Digite um nome com pelo menos 2 caracteres.");
      return false;
    }
    setGuestName(name.trim());
    return true;
  }

  async function createRoom() {
    setError("");
    if (!persistName()) return;

    setLoading(true);
    const response = await gameService.createRoom({
      hostId: getGuestId(),
      hostName: name.trim(),
    });
    setLoading(false);

    if (!response.success) {
      setError(response.message || "Não foi possível criar a sala.");
      return;
    }
    navigate(`/room/${response.data.code}`);
  }

  async function joinRoom() {
    setError("");
    if (!persistName()) return;

    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      setError("Digite o código da sala.");
      return;
    }

    setLoading(true);
    const response = await gameService.findRoomByCode(normalized);
    setLoading(false);

    if (!response.success) {
      setError("Sala não encontrada.");
      return;
    }
    navigate(`/room/${normalized}`);
  }

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Card className="shadow-sm w-100" style={{ maxWidth: "460px" }}>
        <Card.Body className="p-4">
          <h1 className="text-center mb-4">Quiz Multiplayer</h1>

          {error && (
            <Alert variant="danger" onClose={() => setError("")} dismissible>
              {error}
            </Alert>
          )}

          <Form.Group className="mb-4">
            <Form.Label>Seu nome</Form.Label>
            <Form.Control
              type="text"
              placeholder="Como quer ser chamado?"
              value={name}
              maxLength={30}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>

          <div className="d-grid mb-4">
            <Button variant="primary" size="lg" onClick={createRoom}>
              Criar sala
            </Button>
          </div>

          <div className="text-center text-muted mb-3">ou entre em uma sala</div>

          <Row className="g-2">
            <Col xs={7}>
              <Form.Control
                type="text"
                placeholder="Código"
                value={code}
                maxLength={6}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                style={{ textTransform: "uppercase", letterSpacing: "2px" }}
              />
            </Col>
            <Col xs={5} className="d-grid">
              <Button variant="outline-primary" onClick={joinRoom}>
                Entrar
              </Button>
            </Col>
          </Row>

          {loading && <Loading />}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Multiplayer;
