import { useNavigate } from "react-router-dom";
import { Box, Container, Alert, Button, Typography } from "@mui/material";
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
      <Container sx={{ py: 5, textAlign: "center" }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Você foi removido da sala pelo líder.
        </Alert>
        <Button variant="contained" onClick={() => navigate("/multiplayer")}>
          Voltar
        </Button>
      </Container>
    );
  }

  if (room.closed) {
    return (
      <Container sx={{ py: 5, textAlign: "center" }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          A sala foi encerrada.
        </Alert>
        <Button variant="contained" onClick={() => navigate("/multiplayer")}>
          Voltar
        </Button>
      </Container>
    );
  }

  if (!room.state) {
    return (
      <Container sx={{ py: 5, textAlign: "center" }}>
        <Typography color="text.secondary">
          Conectando à sala {code}...
        </Typography>
        <Loading />
      </Container>
    );
  }

  const { status } = room.state;

  return (
    <div className="mp-room">
      {room.error && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            mt: 3,
            zIndex: 1080,
          }}
        >
          <Alert severity="error" onClose={room.clearError}>
            {room.error}
          </Alert>
        </Box>
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
