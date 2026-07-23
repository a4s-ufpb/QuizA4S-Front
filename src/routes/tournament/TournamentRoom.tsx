import { useEffect } from "react";
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
} from "@mui/material";
import {
  BsTrophyFill,
  BsPersonFill,
  BsDiagram3Fill,
  BsQuestionCircleFill,
  BsPeopleFill,
} from "react-icons/bs";
import Loading from "../../components/loading/Loading";
import BracketView from "../../components/tournament/BracketView";
import { getGuestId } from "../../util/guest";
import { useStartTournamentMutation, useTournamentStateQuery } from "../../query/useTournamentQueries";
import { TitleBadge, FramedAvatar, bannerClassName } from "../../components/cosmetics/Cosmetic";
import "../../components/multiplayer/multiplayer.css";

const TournamentRoom = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const myPlayerId = getGuestId();
  const startMutation = useStartTournamentMutation();

  const stateQuery = useTournamentStateQuery(code ?? "", Boolean(code));
  const tournament = stateQuery.data?.success ? stateQuery.data.data : null;

  // Avisa antes de fechar/atualizar a aba: o jogador perde a vaga no torneio
  // (mesmo comportamento da sala multiplayer).
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  if (stateQuery.isLoading && !tournament) {
    return (
      <Container sx={{ py: 5, textAlign: "center" }}>
        <Loading />
      </Container>
    );
  }

  if (!tournament) {
    return (
      <Container sx={{ py: 5, textAlign: "center" }}>
        <Alert severity="error">Torneio não encontrado.</Alert>
        <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate("/tournament")}>
          Voltar
        </Button>
      </Container>
    );
  }

  const isHost = tournament.hostId === myPlayerId;
  const champion = tournament.players.find((p) => p.id === tournament.championId);

  async function handleStart() {
    if (!code) return;
    const response = await startMutation.mutateAsync({ code, hostId: myPlayerId });
    if (!response.success) {
      window.alert(response.message || "Não foi possível iniciar o torneio.");
    }
  }

  return (
    <Container sx={{ py: 4 }}>
      {/* Header estilizado (inspirado na sala multiplayer) */}
      <Card elevation={3} className="mp-fade-in" sx={{ mb: 3, overflow: "hidden" }}>
        <Box
          sx={{
            p: 3,
            color: "#fff",
            background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Typography variant="h4" sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: "bold" }}>
              <BsDiagram3Fill /> {tournament.name}
            </Typography>
            <span className="mp-code-chip">{tournament.code}</span>
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
            <Chip
              icon={<BsQuestionCircleFill />}
              label={`Quiz: ${tournament.themeName ?? "—"}`}
              sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#fff" }}
              size="small"
            />
            <Chip
              icon={<BsPeopleFill />}
              label={`${tournament.players.length} jogador${tournament.players.length === 1 ? "" : "es"}`}
              sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#fff" }}
              size="small"
            />
            <Chip
              label={
                tournament.status === "LOBBY"
                  ? "Aguardando início"
                  : tournament.status === "FINISHED"
                    ? "Finalizado"
                    : "Em andamento"
              }
              sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "#fff" }}
              size="small"
            />
          </Box>
        </Box>

        <CardContent>
          {tournament.status === "FINISHED" && champion && (
            <Alert
              icon={<BsTrophyFill color="gold" />}
              severity="success"
              sx={{ mb: 2, fontWeight: "bold" }}
            >
              Campeão: {champion.name}!
            </Alert>
          )}

          {tournament.status === "LOBBY" && (
            <>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold" }}>
                Jogadores ({tournament.players.length})
              </Typography>
              <List dense>
                {tournament.players.map((p) => (
                  <ListItem
                    key={p.id}
                    className={bannerClassName(p.banner)}
                    sx={{ display: "flex", alignItems: "center", gap: 1, borderRadius: 1 }}
                  >
                    <FramedAvatar code={p.frame} size={30}>
                      <BsPersonFill color="gray" />
                    </FramedAvatar>
                    <Box sx={{ flexGrow: 1 }}>
                      {p.name}
                      <TitleBadge code={p.title} />
                      {p.id === myPlayerId && " (você)"}
                    </Box>
                    {p.host && <Chip size="small" label="Organizador" color="primary" />}
                  </ListItem>
                ))}
              </List>

              {isHost ? (
                <Button
                  variant="contained"
                  fullWidth
                  disabled={tournament.players.length < 2}
                  onClick={handleStart}
                  sx={{ mt: 2 }}
                >
                  Iniciar torneio ({tournament.players.length} jogador
                  {tournament.players.length === 1 ? "" : "es"})
                </Button>
              ) : (
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                  Aguardando o organizador iniciar o torneio...
                </Typography>
              )}
            </>
          )}

          {tournament.status !== "LOBBY" && (
            <Box sx={{ mt: 2 }}>
              <BracketView
                rounds={tournament.rounds}
                players={tournament.players}
                myPlayerId={myPlayerId}
                tournamentCode={code}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default TournamentRoom;
