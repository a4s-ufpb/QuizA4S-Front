import { useEffect, useRef, useState, type ReactNode } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  Chip,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Tooltip,
  TextField,
} from "@mui/material";
import {
  BsTrophyFill,
  BsPersonFill,
  BsDiagram3Fill,
  BsPeopleFill,
  BsPersonDashFill,
  BsBoxArrowRight,
  BsCheckCircleFill,
  BsPencilFill,
  BsEmojiDizzy,
  BsEyeFill,
  BsShareFill,
  BsHourglassSplit,
} from "react-icons/bs";
import Loading from "../../components/loading/Loading";
import BracketView from "../../components/tournament/BracketView";
import ThemeTemplate from "../../components/themeTemplate/ThemeTemplate";
import ConfirmBox from "../../components/confirmBox/ConfirmBox";
import { generateTournamentImage, downloadImage } from "../../util/shareImage";
import { getGuestId, getGuestName, setGuestName } from "../../util/guest";
import { getStoredUser } from "../../util/storage";
import {
  useStartTournamentMutation,
  useConfigureTournamentMutation,
  useReopenTournamentMutation,
  useSetRoundThemeMutation,
  useKickTournamentPlayerMutation,
  useLeaveTournamentMutation,
  useJoinTournamentMutation,
} from "../../query/useTournamentQueries";
import { useTournamentSocket } from "../../hooks/useTournamentSocket";
import { TitleBadge, FramedAvatar, bannerClassName, PlayerName } from "../../components/cosmetics/Cosmetic";
import "../../components/multiplayer/multiplayer.css";
import "../../components/tournament/tournament.css";

const VALID_BRACKET_SIZES = [4, 8, 16];

const TournamentRoom = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const myPlayerId = getGuestId();

  const loggedUser = getStoredUser();
  const isLoggedIn = Boolean(localStorage.getItem("token") && loggedUser?.name);

  const startMutation = useStartTournamentMutation();
  const configureMutation = useConfigureTournamentMutation();
  const reopenMutation = useReopenTournamentMutation();
  const setRoundThemeMutation = useSetRoundThemeMutation();
  const kickMutation = useKickTournamentPlayerMutation();
  const leaveMutation = useLeaveTournamentMutation();
  const joinMutation = useJoinTournamentMutation();

  const { state: tournament, loading, closed } = useTournamentSocket(code ?? "");

  const [roundPicker, setRoundPicker] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");
  // Item 1: confirmação antes de remover um jogador.
  const [kickTarget, setKickTarget] = useState<{ id: string; name: string } | null>(null);
  // Item 1: confirmação antes de encerrar o torneio (organizador).
  const [confirmClose, setConfirmClose] = useState(false);
  // Item 5: portão de entrada (nome / confirmação) para quem abre o link.
  const [joinName, setJoinName] = useState(isLoggedIn ? loggedUser.name : getGuestName());
  const [joinError, setJoinError] = useState("");
  // Item 2: detecção de remoção pelo organizador.
  const [kickedOut, setKickedOut] = useState(false);
  const wasInRef = useRef(false);
  // Item 4: contagem regressiva de encerramento da sala ao finalizar (60s).
  const [closeIn, setCloseIn] = useState(60);

  useEffect(() => {
    if (tournament?.status !== "FINISHED") {
      setCloseIn(60);
      return;
    }
    const id = setInterval(() => setCloseIn((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [tournament?.status]);

  const amIIn = tournament ? tournament.players.some((p) => p.id === myPlayerId) : false;

  // Avisa antes de fechar/atualizar a aba.
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Item 2: se eu estava no torneio e sumi da lista (organizador me removeu),
  // marco como removido para sair da tela do chaveamento/lobby.
  useEffect(() => {
    if (!tournament) return;
    if (amIIn) {
      wasInRef.current = true;
    } else if (wasInRef.current) {
      setKickedOut(true);
    }
  }, [amIIn, tournament]);

  /** Tela gamificada de fim/erro (encerrado, não encontrado, removido). */
  function endScreen(icon: ReactNode, title: string, message: string) {
    return (
      <Container>
        <Box className="trn-endscreen mp-fade-in">
          <div className="trn-endscreen-icon">{icon}</div>
          <Typography variant="h4" sx={{ fontWeight: "bold", mt: 1 }}>
            {title}
          </Typography>
          <Typography sx={{ mt: 1, opacity: 0.9 }}>{message}</Typography>
          <Box sx={{ mt: 3, display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap" }}>
            <Button variant="contained" sx={{ bgcolor: "#fff", color: "#2b1055", "&:hover": { bgcolor: "#f0f0f0" } }} onClick={() => navigate("/")}>
              Início
            </Button>
            <Button variant="outlined" sx={{ color: "#fff", borderColor: "#fff" }} onClick={() => navigate("/tournament")}>
              Torneios
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  if (loading && !tournament) {
    return (
      <Container sx={{ py: 5, textAlign: "center" }}>
        <Loading />
      </Container>
    );
  }

  // Item 2: removido pelo organizador.
  if (kickedOut) {
    return endScreen(
      <BsEmojiDizzy />,
      "Você saiu do torneio",
      "O organizador removeu você deste torneio."
    );
  }

  // Item 8: torneio encerrado (via WebSocket ao finalizar/encerrar) ou inexistente.
  if (closed || !tournament) {
    return endScreen(
      <BsTrophyFill color="#ffd54a" />,
      "Torneio encerrado ou não encontrado",
      "Este torneio foi finalizado ou não existe mais. Que tal começar um novo?"
    );
  }

  const isHost = tournament.hostId === myPlayerId;
  const champion = tournament.players.find((p) => p.id === tournament.championId);
  const myPlayer = tournament.players.find((p) => p.id === myPlayerId);
  const iAmEliminated = Boolean(myPlayer?.eliminated);
  const playerCount = tournament.players.length;
  const validCount = VALID_BRACKET_SIZES.includes(playerCount);
  const allThemesChosen =
    tournament.roundThemes.length > 0 && tournament.roundThemes.every((r) => r.themeId != null);

  // ---------- Item 5: portão de entrada para quem não está no torneio ----------
  async function joinTournament(nameToUse: string) {
    if (!code) return;
    const response = await joinMutation.mutateAsync({
      code,
      playerId: myPlayerId,
      name: nameToUse,
      userUuid: loggedUser?.uuid ?? "",
    });
    if (!response.success) {
      setJoinError(response.message || "Não foi possível entrar no torneio.");
      return;
    }
    setGuestName(nameToUse);
    // O estado chega via WebSocket (broadcast do backend após o join).
  }

  if (!amIIn) {
    // Torneio já travado/iniciado: não é possível entrar.
    if (tournament.status !== "LOBBY") {
      return endScreen(
        <BsDiagram3Fill color="#ffd54a" />,
        "Torneio já começou",
        "As chaves deste torneio já foram travadas — não é possível entrar agora."
      );
    }
    // Logado com nome: modal de confirmação (entra ou volta pra home).
    if (isLoggedIn) {
      return (
        <ConfirmBox
          title={`Entrar no torneio "${tournament.name}"?`}
          textBtn1="Entrar"
          textBtn2="Voltar ao início"
          onClickBtn1={() => joinTournament(loggedUser.name)}
          onClickBtn2={() => navigate("/")}
        />
      );
    }
    // Convidado: pede o nome antes de entrar.
    return (
      <Container sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Card elevation={3} sx={{ width: "100%", maxWidth: 460 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" align="center" sx={{ mb: 1, fontWeight: "bold" }}>
              Entrar no torneio
            </Typography>
            <Typography align="center" color="text.secondary" sx={{ mb: 3 }}>
              {tournament.name}
            </Typography>
            {joinError && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setJoinError("")}>
                {joinError}
              </Alert>
            )}
            <TextField
              label="Seu nome"
              value={joinName}
              slotProps={{ htmlInput: { maxLength: 30 } }}
              onChange={(e) => setJoinName(e.target.value)}
              fullWidth
              sx={{ mb: 3 }}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="outlined" color="error" sx={{ flex: 1 }} onClick={() => navigate("/")}>
                Voltar
              </Button>
              <Button
                variant="contained"
                sx={{ flex: 2 }}
                onClick={() => {
                  if (joinName.trim().length < 2) {
                    setJoinError("Digite um nome com pelo menos 2 caracteres.");
                    return;
                  }
                  joinTournament(joinName.trim());
                }}
              >
                Entrar no torneio
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // ---------- ações ----------
  async function run<T>(fn: () => Promise<{ success: boolean; message?: string } & T>) {
    setActionError("");
    const response = await fn();
    if (!response.success) {
      setActionError(response.message || "Não foi possível concluir a ação.");
      return null;
    }
    // A atualização de estado chega via WebSocket (broadcast do backend).
    return response;
  }

  async function handleConfigure() {
    if (!code) return;
    await run(() => configureMutation.mutateAsync({ code, hostId: myPlayerId }));
  }

  async function handleReopen() {
    if (!code) return;
    await run(() => reopenMutation.mutateAsync({ code, hostId: myPlayerId }));
  }

  async function handleStart() {
    if (!code) return;
    await run(() => startMutation.mutateAsync({ code, hostId: myPlayerId }));
  }

  async function handleKickConfirmed() {
    if (!code || !kickTarget) return;
    const target = kickTarget.id;
    setKickTarget(null);
    await run(() => kickMutation.mutateAsync({ code, hostId: myPlayerId, targetId: target }));
  }

  async function handleLeave() {
    if (!code) return;
    await leaveMutation.mutateAsync({ code, playerId: myPlayerId });
    navigate("/tournament");
  }

  async function pickRoundTheme(themeId: number) {
    if (!code || roundPicker == null) return;
    await run(() =>
      setRoundThemeMutation.mutateAsync({ code, hostId: myPlayerId, roundIndex: roundPicker, themeId })
    );
    setRoundPicker(null);
  }

  const totalRounds = tournament.roundThemes.length || tournament.rounds.length;

  function bracketRoundLabel(index: number): string {
    const fromEnd = totalRounds - index;
    if (fromEnd === 1) return "Final";
    if (fromEnd === 2) return "Semifinal";
    if (fromEnd === 3) return "Quartas de final";
    if (fromEnd === 4) return "Oitavas de final";
    return `Rodada ${index + 1}`;
  }

  // Item 3: baixa a imagem do chaveamento completo (com o nome do torneio).
  function handleShareBracket(t: NonNullable<typeof tournament>) {
    const nameOf = (id: string | null) => t.players.find((p) => p.id === id)?.name ?? null;
    const rounds = t.rounds.map((round) =>
      round.map((m) => ({
        player1: nameOf(m.player1Id),
        player2: nameOf(m.player2Id),
        winnerId: m.winnerId,
        player1Id: m.player1Id,
        player2Id: m.player2Id,
      }))
    );
    const dataUrl = generateTournamentImage({
      name: t.name,
      rounds,
      roundLabels: t.rounds.map((_, i) => bracketRoundLabel(i)),
      championName: t.players.find((p) => p.id === t.championId)?.name ?? null,
    });
    downloadImage(dataUrl, `torneio-${t.code}.png`);
  }

  const statusLabel =
    tournament.status === "LOBBY"
      ? "Aguardando jogadores"
      : tournament.status === "CONFIGURING"
        ? "Configurando chaves"
        : tournament.status === "FINISHED"
          ? "Finalizado"
          : "Em andamento";

  return (
    <Container sx={{ py: 4 }}>
      <Card elevation={3} className="mp-fade-in" sx={{ mb: 3, overflow: "hidden" }}>
        {/* -------- Header (itens 4 e 6) -------- */}
        <Box sx={{ p: 3, color: "#fff", background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)" }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
            <Typography variant="h4" sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: "bold" }}>
              <BsDiagram3Fill /> {tournament.name}
            </Typography>
            {/* Item 4: código com label + botão encerrar/sair abaixo. */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontWeight: "bold" }}>Código:</Typography>
                <span className="mp-code-chip">{tournament.code}</span>
              </Box>
              <Button
                size="small"
                variant="contained"
                color="error"
                startIcon={<BsBoxArrowRight />}
                onClick={() => (isHost ? setConfirmClose(true) : handleLeave())}
              >
                {isHost ? "Encerrar torneio" : "Sair do torneio"}
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
            <Chip label={statusLabel} sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#fff" }} size="small" />
            {tournament.bracketSize > 0 && (
              <Chip label={`Chave de ${tournament.bracketSize}`} sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#fff" }} size="small" />
            )}
          </Box>

          {/* Item 6: card informativo da quantidade de jogadores. */}
          <Box
            sx={{
              mt: 2,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              bgcolor: "rgba(255,255,255,0.15)",
              borderRadius: 2,
              px: 2,
              py: 1.25,
            }}
          >
            <BsPeopleFill size={22} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: "bold", lineHeight: 1 }}>
                {playerCount} / {tournament.maxPlayers}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                jogadores no torneio
              </Typography>
            </Box>
          </Box>
        </Box>

        <CardContent>
          {actionError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError("")}>
              {actionError}
            </Alert>
          )}

          {tournament.status === "FINISHED" && champion && (
            <Alert icon={<BsTrophyFill color="gold" />} severity="success" sx={{ mb: 2, fontWeight: "bold" }}>
              Campeão: {champion.name}!
            </Alert>
          )}

          {/* -------- LOBBY (item 6: botão acima da lista, sem label "Jogadores") -------- */}
          {tournament.status === "LOBBY" && (
            <>
              {isHost ? (
                <Box sx={{ mb: 2 }}>
                  {!validCount && (
                    <Alert severity="info" sx={{ mb: 1 }}>
                      O torneio precisa ter exatamente 4, 8 ou 16 jogadores para travar as chaves.
                      Atualmente há {playerCount}.
                    </Alert>
                  )}
                  <Button variant="contained" fullWidth disabled={!validCount} onClick={handleConfigure}>
                    Travar chaves e escolher quizzes ({playerCount} jogador
                    {playerCount === 1 ? "" : "es"})
                  </Button>
                </Box>
              ) : (
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Aguardando o organizador travar as chaves...
                </Typography>
              )}

              <List dense>
                {tournament.players.map((p) => (
                  <ListItem
                    key={p.id}
                    className={bannerClassName(p.banner)}
                    sx={{ display: "flex", alignItems: "center", gap: 1, borderRadius: 1 }}
                    secondaryAction={
                      isHost && p.id !== tournament.hostId ? (
                        <Tooltip title="Remover jogador">
                          <IconButton
                            edge="end"
                            color="error"
                            aria-label={`Remover ${p.name}`}
                            onClick={() => setKickTarget({ id: p.id, name: p.name })}
                          >
                            <BsPersonDashFill />
                          </IconButton>
                        </Tooltip>
                      ) : undefined
                    }
                  >
                    <FramedAvatar code={p.frame} size={30}>
                      <BsPersonFill color="gray" />
                    </FramedAvatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <PlayerName name={p.name} font={p.font} style={p.nameStyle} effect={p.nameEffect} />
                      <TitleBadge code={p.title} />
                      {p.id === myPlayerId && " (você)"}
                    </Box>
                    {p.host && <Chip size="small" label="Organizador" color="primary" />}
                  </ListItem>
                ))}
              </List>
            </>
          )}

          {/* -------- CONFIGURING -------- */}
          {tournament.status === "CONFIGURING" && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold" }}>
                Escolha o quiz de cada rodada
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Chaveamento de {tournament.bracketSize} jogadores. Cada rodada usa o quiz definido abaixo.
              </Typography>

              {!isHost && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  O organizador está escolhendo os quizzes de cada rodada. A partida começa em breve.
                </Alert>
              )}

              <List>
                {tournament.roundThemes.map((r) => (
                  <ListItem
                    key={r.roundIndex}
                    sx={{ display: "flex", gap: 1, borderRadius: 1, border: "1px solid", borderColor: "divider", mb: 1 }}
                    secondaryAction={
                      isHost ? (
                        <Button
                          size="small"
                          variant={r.themeId != null ? "outlined" : "contained"}
                          startIcon={<BsPencilFill />}
                          onClick={() => setRoundPicker(r.roundIndex)}
                        >
                          {r.themeId != null ? "Trocar" : "Escolher"}
                        </Button>
                      ) : undefined
                    }
                  >
                    {r.themeId != null && <BsCheckCircleFill color="#2e7d32" />}
                    <Box>
                      <Typography sx={{ fontWeight: "bold" }}>{r.label}</Typography>
                      <Typography variant="body2" color={r.themeName ? "text.primary" : "text.secondary"}>
                        {r.themeName ?? "Quiz não escolhido"}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
              </List>

              {isHost && (
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
                  <Button variant="outlined" onClick={handleReopen}>
                    Reabrir lobby
                  </Button>
                  <Button variant="contained" color="success" disabled={!allThemesChosen} onClick={handleStart} sx={{ flexGrow: 1 }}>
                    Iniciar torneio
                  </Button>
                </Box>
              )}
            </>
          )}

          {/* -------- EM ANDAMENTO / FINALIZADO -------- */}
          {(tournament.status === "IN_PROGRESS" || tournament.status === "FINISHED") && (
            <Box sx={{ mt: 1 }}>
              {/* Item 7: eliminado acompanha como espectador e pode sair. */}
              {iAmEliminated && tournament.status === "IN_PROGRESS" && (
                <Alert
                  icon={<BsEyeFill />}
                  severity="warning"
                  sx={{ mb: 2, alignItems: "center" }}
                  action={
                    <Button color="inherit" size="small" startIcon={<BsBoxArrowRight />} onClick={handleLeave}>
                      Sair do torneio
                    </Button>
                  }
                >
                  Você foi eliminado. Acompanhe o restante do torneio como espectador.
                </Alert>
              )}

              <BracketView
                rounds={tournament.rounds}
                players={tournament.players}
                myPlayerId={myPlayerId}
                tournamentCode={code}
                totalRounds={totalRounds}
                championId={tournament.championId}
              />

              {/* Itens 3 e 4: compartilhar chaveamento + aviso de encerramento. */}
              {tournament.status === "FINISHED" && (
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                    <Button variant="contained" startIcon={<BsShareFill />} onClick={() => handleShareBracket(tournament)}>
                      Compartilhar resultado
                    </Button>
                  </Box>
                  <Alert icon={<BsHourglassSplit />} severity="info" sx={{ alignItems: "center" }}>
                    Esta sala será encerrada automaticamente em <strong>{closeIn}s</strong>. Você pode sair a qualquer momento.
                  </Alert>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Item 1: confirmação de remoção de jogador. */}
      {kickTarget && (
        <ConfirmBox
          title={`Remover ${kickTarget.name} do torneio?`}
          textBtn1="Remover"
          textBtn2="Cancelar"
          onClickBtn1={handleKickConfirmed}
          onClickBtn2={() => setKickTarget(null)}
        />
      )}

      {/* Item 1: confirmação de encerramento do torneio. */}
      {confirmClose && (
        <ConfirmBox
          title="Encerrar o torneio para todos os jogadores?"
          textBtn1="Encerrar"
          textBtn2="Cancelar"
          onClickBtn1={() => {
            setConfirmClose(false);
            handleLeave();
          }}
          onClickBtn2={() => setConfirmClose(false)}
        />
      )}

      {/* Diálogo de escolha de quiz da rodada */}
      <Dialog
        open={roundPicker != null}
        onClose={() => setRoundPicker(null)}
        fullWidth
        maxWidth="lg"
        slotProps={{ paper: { sx: { bgcolor: "#1a1a2e" } } }}
      >
        <DialogTitle sx={{ color: "#fff" }}>
          {roundPicker != null && tournament.roundThemes[roundPicker]
            ? `Quiz — ${tournament.roundThemes[roundPicker].label}`
            : "Escolher quiz"}
        </DialogTitle>
        <DialogContent>
          <ThemeTemplate
            path="/theme"
            title="Escolha o quiz da rodada"
            searchOnButton
            onClickFunction={(theme) => pickRoundTheme(theme.id)}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default TournamentRoom;
