import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container, Alert, Typography, Tooltip } from "@mui/material";
import {
  BsArrowsFullscreen,
  BsFullscreenExit,
  BsEaselFill,
  BsDoorClosedFill,
  BsPersonDashFill,
} from "react-icons/bs";
import { useGameRoom } from "../../hooks/useGameRoom";
import Loading from "../loading/Loading";
import Lobby from "./Lobby";
import GamePlay from "./GamePlay";
import ResultsView from "./ResultsView";
import RoomExitScreen from "./RoomExitScreen";

interface RoomConnectedProps {
  code: string;
  avatar?: string;
  tournamentCode?: string;
}

const RoomConnected = ({ code, avatar, tournamentCode }: RoomConnectedProps) => {
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
      <RoomExitScreen
        icon={<BsPersonDashFill size={64} />}
        title="Você saiu da sala"
        message="O líder removeu você desta partida."
        accent="#f0a92b"
        onBack={() => navigate("/multiplayer")}
      />
    );
  }

  if (room.closed) {
    return (
      <RoomExitScreen
        icon={<BsDoorClosedFill size={64} />}
        title="Sala encerrada"
        message="Esta partida foi encerrada. Crie ou entre em uma nova sala para jogar de novo!"
        onBack={() => navigate("/multiplayer")}
      />
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
        <Tooltip
          title={
            isFullscreen
              ? "Sair da tela cheia"
              : "Tela cheia: expande o quiz para ocupar a tela inteira"
          }
          placement="right"
          // Renderiza o popper dentro do container: em tela cheia, elementos
          // anexados ao <body> (fora do elemento fullscreen) não aparecem.
          slotProps={{ popper: { container: containerRef.current } }}
        >
          <button
            type="button"
            className="mp-fullscreen-btn"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
          >
            {isFullscreen ? (
              <BsFullscreenExit size={18} />
            ) : (
              <BsArrowsFullscreen size={18} />
            )}
          </button>
        </Tooltip>
      )}
      {(status === "IN_QUESTION" || status === "BETWEEN") && (
        <Tooltip
          title={
            presentationMode
              ? "Sair do modo TV"
              : "Modo TV: aumenta fontes e botões para projeção em telão"
          }
          placement="right"
          slotProps={{ popper: { container: containerRef.current } }}
        >
          <button
            type="button"
            className={`mp-fullscreen-btn mp-presentation-btn ${presentationMode ? "active" : ""}`}
            onClick={() => setPresentationMode((prev) => !prev)}
            aria-label={presentationMode ? "Sair do modo TV" : "Modo TV (telão)"}
          >
            <BsEaselFill size={18} />
          </button>
        </Tooltip>
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
      {status === "FINISHED" && <ResultsView room={room} tournamentCode={tournamentCode} />}
    </div>
  );
};

export default RoomConnected;
