import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import { getGuestName, setGuestName } from "../../util/guest";
import RoomConnected from "../../components/multiplayer/RoomConnected";

/**
 * Portão de nome + código. Só monta a conexão da sala depois que há um nome,
 * garantindo que jogadores convidados se identifiquem antes de entrar.
 */
const Room = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState(getGuestName());
  const [ready, setReady] = useState(getGuestName().trim().length >= 2);

  if (!code) {
    navigate("/multiplayer");
    return null;
  }

  function confirmName() {
    if (name.trim().length < 2) return;
    setGuestName(name.trim());
    setReady(true);
  }

  if (!ready) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Card className="shadow-sm w-100" style={{ maxWidth: "420px" }}>
          <Card.Body className="p-4">
            <h2 className="text-center mb-4">Entrar na sala {code}</h2>
            <Alert variant="info">Escolha um nome para participar.</Alert>
            <Form.Group className="mb-3">
              <Form.Label>Seu nome</Form.Label>
              <Form.Control
                type="text"
                value={name}
                maxLength={30}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>
            <div className="d-grid">
              <Button onClick={confirmName}>Entrar</Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return <RoomConnected code={code} />;
};

export default Room;
