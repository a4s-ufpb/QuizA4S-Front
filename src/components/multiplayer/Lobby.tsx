import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Card,
  CardHeader,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
} from "@mui/material";
import {
  BsPersonFill,
  BsStarFill,
  BsXCircle,
  BsBoxArrowRight,
} from "react-icons/bs";
import type { UseGameRoom } from "../../hooks/useGameRoom";
import type { PlayerView } from "../../types/game";
import ThemeTemplate from "../themeTemplate/ThemeTemplate";
import ConfirmBox from "../confirmBox/ConfirmBox";
import RoomChat from "./RoomChat";
import RoomConfigForm from "./RoomConfigForm";
import "./multiplayer.css";

interface LobbyProps {
  room: UseGameRoom;
}

const Lobby = ({ room }: LobbyProps) => {
  const navigate = useNavigate();
  const [showThemes, setShowThemes] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [kickTarget, setKickTarget] = useState<PlayerView | null>(null);

  const state = room.state!;
  const me = state.players.find((p) => p.id === room.playerId);
  const isTeamMode = state.config.roomMode === "TEAM";
  const allReady = state.players.filter((p) => !p.host).every((p) => p.ready);
  const canStart = room.isHost && state.themeId != null && allReady;

  function leaveRoom() {
    room.leave();
    navigate("/multiplayer");
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ mb: 1, color: "#fff" }}>
            Sala <span className="mp-code-chip">{state.code}</span>
          </Typography>
          <Box sx={{ color: "rgba(255,255,255,0.7)" }}>
            Quiz: <strong>{state.themeName || "nenhum selecionado"}</strong> ·{" "}
            {isTeamMode ? "Equipes" : "Individual"} ·{" "}
            {state.config.questionCount} questões ·{" "}
            {state.config.questionTimeSeconds}s
          </Box>
        </Box>
        <Button
          variant="outlined"
          size="small"
          sx={{ color: "#fff", borderColor: "#fff" }}
          onClick={() => setConfirmLeave(true)}
        >
          <BsBoxArrowRight style={{ marginRight: 4 }} /> Sair da sala
        </Button>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "7fr 5fr" },
          gap: 3,
        }}
      >
        <Box>
          <Card elevation={2} className="mp-fade-in" sx={{ mb: 3 }}>
            <CardHeader title={`Jogadores (${state.players.length})`} />
            <List disablePadding>
              {state.players.map((p) => (
                <ListItem
                  key={p.id}
                  className="mp-player-item"
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  {p.host ? (
                    <BsStarFill color="orange" title="Líder" />
                  ) : (
                    <BsPersonFill color="gray" />
                  )}
                  <Box sx={{ flexGrow: 1 }}>
                    {p.name}
                    {p.id === room.playerId && " (você)"}
                    {isTeamMode && p.teamId && (
                      <Chip
                        label={state.teams.find((t) => t.id === p.teamId)?.name}
                        color="info"
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Box>
                  {!p.host &&
                    (p.ready ? (
                      <Chip label="Pronto" color="success" size="small" />
                    ) : (
                      <Chip label="Aguardando" size="small" />
                    ))}
                  {room.isHost && !p.host && (
                    <IconButton
                      size="small"
                      color="error"
                      title="Remover"
                      onClick={() => setKickTarget(p)}
                    >
                      <BsXCircle />
                    </IconButton>
                  )}
                </ListItem>
              ))}
            </List>
          </Card>

          {isTeamMode && me && !me.host && (
            <Card elevation={2} className="mp-fade-in" sx={{ mb: 3 }}>
              <CardHeader title="Escolha sua equipe" />
              <CardContent sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {state.teams.map((t) => (
                  <Button
                    key={t.id}
                    variant={me.teamId === t.id ? "contained" : "outlined"}
                    color="info"
                    onClick={() => room.pickTeam(t.id)}
                  >
                    {t.name}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {me && !me.host && (
              <Button
                variant={me.ready ? "outlined" : "contained"}
                color="success"
                onClick={() => room.setReady(!me.ready)}
              >
                {me.ready ? "Cancelar pronto" : "Estou pronto"}
              </Button>
            )}
            {room.isHost && (
              <>
                <Button variant="outlined" onClick={() => setShowThemes(true)}>
                  {state.themeId ? "Trocar quiz" : "Selecionar quiz"}
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setShowConfig(true)}
                >
                  Regras
                </Button>
                <Button
                  variant="contained"
                  disabled={!canStart}
                  onClick={room.start}
                >
                  Iniciar partida
                </Button>
              </>
            )}
          </Box>
          {room.isHost && !canStart && (
            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.7)", mt: 1 }}
            >
              {state.themeId == null
                ? "Selecione um quiz para poder iniciar."
                : "Aguardando todos os jogadores ficarem prontos."}
            </Typography>
          )}
        </Box>

        <Box>
          <RoomChat room={room} />
        </Box>
      </Box>

      <Dialog
        open={showThemes}
        onClose={() => setShowThemes(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Selecionar quiz</DialogTitle>
        <DialogContent>
          <ThemeTemplate
            path="/theme"
            title="Escolha o tema do quiz"
            onClickFunction={(theme) => {
              room.changeQuiz(theme.id);
              setShowThemes(false);
            }}
          />
        </DialogContent>
      </Dialog>

      {showConfig && (
        <RoomConfigForm
          config={state.config}
          onSave={(config) => {
            room.updateConfig(config);
            setShowConfig(false);
          }}
          onClose={() => setShowConfig(false)}
        />
      )}

      {confirmLeave && (
        <ConfirmBox
          title="Deseja sair da sala?"
          textBtn1="Sim, sair"
          textBtn2="Cancelar"
          onClickBtn1={leaveRoom}
          onClickBtn2={() => setConfirmLeave(false)}
        />
      )}

      {kickTarget && (
        <ConfirmBox
          title={`Remover ${kickTarget.name} da sala?`}
          textBtn1="Remover"
          textBtn2="Cancelar"
          onClickBtn1={() => {
            room.kick(kickTarget.id);
            setKickTarget(null);
          }}
          onClickBtn2={() => setKickTarget(null)}
        />
      )}
    </Container>
  );
};

export default Lobby;
