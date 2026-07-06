import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container, Alert, Button, Typography } from "@mui/material";
import { BsArrowsFullscreen, BsFullscreenExit, BsEaselFill } from "react-icons/bs";
import { useGameRoom } from "../../hooks/useGameRoom";
import Loading from "../loading/Loading";
import Lobby from "./Lobby";
import GamePlay from "./GamePlay";
import ResultsView from "./ResultsView";

interface RoomConnectedProps {
  code: string;
  avatar?: string;
}

const RoomConnected = ({ code, avatar }: RoomConnectedProps) => {
  const room = useGameRoom(code, avatar);
  const navigate = useNavigate();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, []);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  // Avisa antes de fechar/atualizar a aba: o jogador (ou equipe) perde a vaga e a pontuação.
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Entra em tela cheia automaticamente assim que a partida começa (igual ao quiz single-player).
  const gameStartedRef = useRef(false);
  useEffect(() => {
    const status = room.state?.status;
    if (!gameStartedRef.current && status && status !== "LOBBY") {
      gameStartedRef.current = true;
      containerRef.current?.requestFullscreen?.().catch(() => {});
    }
    if (status === "LOBBY") gameStartedRef.current = false;
  }, [room.state?.status]);

  // Sai da tela cheia ao mostrar o resultado final (igual ao quiz single-player).
  useEffect(() => {
    if (room.state?.status === "FINISHED" && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, [room.state?.status]);

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
    <div
      className={`mp-room ${presentationMode ? "mp-presentation-mode" : ""}`}
      ref={containerRef}
    >
      {(status === "IN_QUESTION" || status === "BETWEEN") && (
        <button
          type="button"
          className="mp-fullscreen-btn"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
          aria-label={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
        >
          {isFullscreen ? (
            <BsFullscreenExit size={18} />
          ) : (
            <BsArrowsFullscreen size={18} />
          )}
        </button>
      )}
      {(status === "IN_QUESTION" || status === "BETWEEN") && (
        <button
          type="button"
          className={`mp-fullscreen-btn mp-presentation-btn ${presentationMode ? "active" : ""}`}
          onClick={() => setPresentationMode((prev) => !prev)}
          title={presentationMode ? "Sair do modo apresentação" : "Modo apresentação (telão)"}
          aria-label={presentationMode ? "Sair do modo apresentação" : "Modo apresentação (telão)"}
        >
          <BsEaselFill size={18} />
        </button>
      )}

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
