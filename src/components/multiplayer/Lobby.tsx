import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Card,
  CardHeader,
  CardContent,
  CardMedia,
  Button,
  Chip,
  List,
  ListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  TextField,
  Popover,
} from "@mui/material";
import {
  BsPersonFill,
  BsStarFill,
  BsXCircle,
  BsBoxArrowRight,
  BsPeopleFill,
  BsQuestionCircleFill,
  BsClockFill,
  BsPencilFill,
} from "react-icons/bs";
import type { UseGameRoom } from "../../hooks/useGameRoom";
import type { PlayerView } from "../../types/game";
import { DEFAULT_IMG } from "../../vite-env";
import ThemeTemplate from "../themeTemplate/ThemeTemplate";
import ConfirmBox from "../confirmBox/ConfirmBox";
import AvatarSelector from "./AvatarSelector";
import RoomChat from "./RoomChat";
import RoomConfigForm from "./RoomConfigForm";
import { TitleBadge, FramedAvatar, bannerClassName } from "../cosmetics/Cosmetic";
import "./multiplayer.css";

interface LobbyProps {
  room: UseGameRoom;
}

interface AvatarTarget {
  anchorEl: HTMLElement;
  onPick: (avatar: string) => void;
}

/** Popover com o seletor de avatar pra jogador/equipe. */
function AvatarPicker({
  target,
  onClose,
}: {
  target: AvatarTarget | null;
  onClose: () => void;
}) {
  return (
    <Popover
      open={Boolean(target)}
      anchorEl={target?.anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
    >
      <Box sx={{ p: 1, maxWidth: 340 }}>
        <AvatarSelector
          value=""
          onChange={(avatar) => {
            target?.onPick(avatar);
            onClose();
          }}
        />
      </Box>
    </Popover>
  );
}

const Lobby = ({ room }: LobbyProps) => {
  const navigate = useNavigate();
  const [showThemes, setShowThemes] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [confirmStart, setConfirmStart] = useState(false);
  const [kickTarget, setKickTarget] = useState<PlayerView | null>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [avatarTarget, setAvatarTarget] = useState<AvatarTarget | null>(null);

  const state = room.state!;
  const me = state.players.find((p) => p.id === room.playerId);
  const isTeamMode = state.config.roomMode === "TEAM";
  const maxPerTeam = state.config.maxPlayersPerTeam ?? null;

  function teamPlayerCount(teamId: string) {
    return state.players.filter((p) => p.teamId === teamId).length;
  }

  function submitNewTeam() {
    const name = newTeamName.trim();
    if (!name) return;
    room.createTeam(name);
    setNewTeamName("");
  }
  const allReady = state.players.filter((p) => !p.host).every((p) => p.ready);
  // O líder pode iniciar mesmo sem todos prontos — com confirmação antes.
  const canStart = room.isHost && state.themeId != null;

  function leaveRoom() {
    room.leave();
    navigate("/multiplayer");
  }

  return (
    <Container sx={{ py: 4 }}>
      {room.countdown != null && (
        <div className="mp-countdown-overlay">
          <span key={room.countdown} className="mp-countdown-number mp-pop">
            {room.countdown}
          </span>
        </div>
      )}
      <Card
        elevation={3}
        className="mp-fade-in mp-room-info-card"
        sx={{ mb: 3, overflow: "hidden" }}
      >
        <Box sx={{ display: "flex", flexWrap: "wrap" }}>
          {state.themeId != null && (
            <CardMedia
              component="img"
              image={state.themeImageUrl || DEFAULT_IMG}
              alt="tema do quiz"
              sx={{
                width: { xs: 150, lg: 150 },
                display: "block",
                flexShrink: 0,
                m: 0,
              }}
            />
          )}
          <Box sx={{ flexGrow: 1, p: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography variant="h5" sx={{ color: "#030303" }}>
                Sala <span className="mp-code-chip">{state.code}</span>
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => setConfirmLeave(true)}
                >
                  <BsBoxArrowRight style={{ marginRight: 4 }} /> Sair da sala
                </Button>
              </Box>
            </Box>

            <Typography sx={{ color: "#000", fontWeight: "bold", mt: 1, mb: 1.5 }}>
              {state.themeName || "Nenhum quiz selecionado"}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Chip
                icon={<BsPeopleFill />}
                label={isTeamMode ? "Equipes" : "Individual"}
                color="info"
                size="small"
              />
              <Chip
                icon={<BsQuestionCircleFill />}
                label={`${state.config.questionCount} questões`}
                color="secondary"
                size="small"
              />
              <Chip
                icon={<BsClockFill />}
                label={`${state.config.questionTimeSeconds}s por questão`}
                color="warning"
                size="small"
              />
            </Box>
          </Box>
        </Box>
      </Card>

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
            <List disablePadding sx={{ maxHeight: 320, overflowY: "auto" }}>
              {state.players.map((p) => (
                <ListItem
                  key={p.id}
                  className={`mp-player-item ${bannerClassName(p.banner)}`}
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <FramedAvatar code={p.frame} size={30}>
                    {p.avatar ? (
                      <span style={{ fontSize: "1.1em" }}>{p.avatar}</span>
                    ) : p.host ? (
                      <BsStarFill color="orange" title="Líder" />
                    ) : (
                      <BsPersonFill color="gray" />
                    )}
                  </FramedAvatar>
                  <Box sx={{ flexGrow: 1 }}>
                    {p.name}
                    <TitleBadge code={p.title} />
                    {p.id === room.playerId && " (você)"}
                    {isTeamMode && p.teamId && (
                      <Chip
                        label={state.teams.find((t) => t.id === p.teamId)?.name}
                        color="info"
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    )}
                    {isTeamMode && p.captain && (
                      <Chip label="Capitão" color="warning" size="small" sx={{ ml: 1 }} />
                    )}
                    {isTeamMode && p.teamId && !p.captain && !p.host && (
                      <Chip label="Espectador" size="small" sx={{ ml: 1 }} />
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
              <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {state.teams.map((t) => {
                    const count = teamPlayerCount(t.id);
                    const isFull =
                      maxPerTeam != null &&
                      count >= maxPerTeam &&
                      me.teamId !== t.id;
                    return (
                      <Box key={t.id} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Button
                          variant={me.teamId === t.id ? "contained" : "outlined"}
                          color="info"
                          disabled={isFull}
                          onClick={() => room.pickTeam(t.id)}
                        >
                          {t.avatar && <span style={{ marginRight: 6 }}>{t.avatar}</span>}
                          {t.name}
                          {maxPerTeam != null && ` (${count}/${maxPerTeam})`}
                        </Button>
                        {me.teamId === t.id && me.captain && (
                          <IconButton
                            size="small"
                            title="Escolher avatar da equipe"
                            onClick={(e) =>
                              setAvatarTarget({
                                anchorEl: e.currentTarget,
                                onPick: (avatar) => room.setTeamAvatar(t.id, avatar),
                              })
                            }
                          >
                            <BsPencilFill size={14} />
                          </IconButton>
                        )}
                      </Box>
                    );
                  })}
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Nome da nova equipe"
                    value={newTeamName}
                    slotProps={{ htmlInput: { maxLength: 30 } }}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    sx={{ flexGrow: 1 }}
                  />
                  <Button variant="contained" color="secondary" onClick={submitNewTeam}>
                    Criar equipe
                  </Button>
                </Box>

                {me.captain && me.teamId && (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Você é o capitão — só você responde pela equipe. Pode passar o
                      cargo pra outro membro:
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {state.players
                        .filter((p) => p.teamId === me.teamId && p.id !== me.id)
                        .map((p) => (
                          <Button
                            key={p.id}
                            size="small"
                            variant="outlined"
                            onClick={() => room.transferCaptain(me.teamId!, p.id)}
                          >
                            Tornar {p.name} capitão
                          </Button>
                        ))}
                    </Box>
                  </Box>
                )}
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
                <Button variant="contained" color="primary" onClick={() => setShowThemes(true)}>
                  {state.themeId ? "Trocar quiz" : "Selecionar quiz"}
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setShowConfig(true)}
                >
                  Regras
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  disabled={!canStart}
                  onClick={() => {
                    // Com jogadores ainda não prontos, pede confirmação antes.
                    if (allReady) room.start();
                    else setConfirmStart(true);
                  }}
                >
                  Iniciar partida
                </Button>
              </>
            )}
          </Box>
          {room.isHost && state.themeId == null && (
            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.7)", mt: 1 }}
            >
              Selecione um quiz para poder iniciar.
            </Typography>
          )}
          {room.isHost && state.themeId != null && !allReady && (
            <Typography
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.7)", mt: 1 }}
            >
              Ainda há jogadores que não deram pronto.
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

      {confirmStart && (
        <ConfirmBox
          title="Ainda há jogadores que não estão prontos. Deseja iniciar a partida mesmo assim?"
          textBtn1="Sim, iniciar"
          textBtn2="Cancelar"
          onClickBtn1={() => {
            setConfirmStart(false);
            room.start();
          }}
          onClickBtn2={() => setConfirmStart(false)}
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

      <AvatarPicker target={avatarTarget} onClose={() => setAvatarTarget(null)} />
    </Container>
  );
};

export default Lobby;
