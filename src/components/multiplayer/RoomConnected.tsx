import { useNavigate } from "react-router-dom";
import { Container, Alert, Button } from "react-bootstrap";
import { useGameRoom } from "../../hooks/useGameRoom";
import Loading from "../loading/Loading";
import Lobby from "./Lobby";
import GamePlay from "./GamePlay";
import ResultsView from "./ResultsView";

interface RoomConnectedProps {
  code: string;
}

const RoomConnected = ({ code }: RoomConnectedProps) => {
  const room = useGameRoom(code);
  const navigate = useNavigate();

  if (room.kicked) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">Você foi removido da sala pelo líder.</Alert>
        <Button onClick={() => navigate("/multiplayer")}>Voltar</Button>
      </Container>
    );
  }

  if (room.closed) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="secondary">A sala foi encerrada.</Alert>
        <Button onClick={() => navigate("/multiplayer")}>Voltar</Button>
      </Container>
    );
  }

  if (!room.state) {
    return (
      <Container className="py-5 text-center">
        <p className="text-muted">Conectando à sala {code}...</p>
        <Loading />
      </Container>
    );
  }

  const { status } = room.state;

  return (
    <div className="mp-room">
      {room.error && (
        <div className="position-fixed top-0 start-50 translate-middle-x mt-3" style={{ zIndex: 1080 }}>
          <Alert variant="danger" onClose={room.clearError} dismissible>
            {room.error}
          </Alert>
        </div>
      )}

      {status === "LOBBY" && <Lobby room={room} />}
      {(status === "IN_QUESTION" || status === "BETWEEN") && (
        <GamePlay room={room} />
      )}
      {status === "FINISHED" && <ResultsView room={room} />}
    </div>
  );
};

export default RoomConnected;
