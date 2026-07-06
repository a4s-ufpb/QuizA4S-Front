import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
} from "@mui/material";
import { BsTrophyFill, BsPersonFill } from "react-icons/bs";
import Loading from "../../components/loading/Loading";
import BracketView from "../../components/tournament/BracketView";
import { getGuestId } from "../../util/guest";
import { useStartTournamentMutation, useTournamentStateQuery } from "../../query/useTournamentQueries";

const TournamentRoom = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const myPlayerId = getGuestId();
  const startMutation = useStartTournamentMutation();

  const stateQuery = useTournamentStateQuery(code ?? "", Boolean(code));
  const tournament = stateQuery.data?.success ? stateQuery.data.data : null;

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
      // erro simples via alert nativo (fluxo secundário, sem InformationBox aqui)
      window.alert(response.message || "Não foi possível iniciar o torneio.");
    }
  }

  return (
    <Container sx={{ py: 4 }}>
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardHeader
          title={`Torneio: ${tournament.name}`}
          subheader={`Código: ${tournament.code} · Quiz: ${tournament.themeName ?? "—"}`}
        />
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
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Jogadores ({tournament.players.length})
              </Typography>
              <List dense>
                {tournament.players.map((p) => (
                  <ListItem key={p.id}>
                    <BsPersonFill style={{ marginRight: 8 }} />
                    <ListItemText primary={p.name} />
                    {p.host && <Chip size="small" label="Organizador" />}
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
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default TournamentRoom;
