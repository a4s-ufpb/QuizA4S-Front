import { Box, Paper, Typography, Chip } from "@mui/material";
import { BsTrophyFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import type { MatchView, TournamentPlayerView } from "../../types/tournament";

interface BracketViewProps {
  rounds: MatchView[][];
  players: TournamentPlayerView[];
  myPlayerId: string;
}

function playerName(players: TournamentPlayerView[], id: string | null): string {
  if (!id) return "—";
  return players.find((p) => p.id === id)?.name ?? "?";
}

function roundLabel(index: number, total: number): string {
  const fromEnd = total - index;
  if (fromEnd === 1) return "Final";
  if (fromEnd === 2) return "Semifinal";
  if (fromEnd === 3) return "Quartas de final";
  return `Rodada ${index + 1}`;
}

const STATUS_LABELS: Record<MatchView["status"], string> = {
  PENDING: "Aguardando",
  WAITING_PLAYERS: "Sala criada",
  IN_PROGRESS: "Em andamento",
  DONE: "Concluído",
  BYE: "Bye (avanço direto)",
};

const BracketView = ({ rounds, players, myPlayerId }: BracketViewProps) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: "flex", gap: 3, overflowX: "auto", py: 2 }}>
      {rounds.map((round, roundIndex) => (
        <Box key={roundIndex} sx={{ minWidth: 220, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="subtitle1" align="center" sx={{ fontWeight: "bold" }}>
            {roundLabel(roundIndex, rounds.length)}
          </Typography>
          {round.map((match) => {
            const isMine =
              match.status !== "DONE" &&
              match.status !== "BYE" &&
              (match.player1Id === myPlayerId || match.player2Id === myPlayerId) &&
              Boolean(match.roomCode);
            return (
              <Paper
                key={match.id}
                elevation={2}
                sx={{
                  p: 1.5,
                  border: match.winnerId ? "2px solid" : "1px solid",
                  borderColor: match.winnerId ? "success.main" : "divider",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: match.winnerId === match.player1Id ? "bold" : "normal",
                    color: match.winnerId === match.player1Id ? "success.main" : "text.primary",
                  }}
                >
                  {playerName(players, match.player1Id)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: match.winnerId === match.player2Id ? "bold" : "normal",
                    color: match.winnerId === match.player2Id ? "success.main" : "text.primary",
                  }}
                >
                  {playerName(players, match.player2Id)}
                </Typography>
                <Chip
                  size="small"
                  label={STATUS_LABELS[match.status]}
                  sx={{ mt: 1 }}
                  color={match.status === "DONE" || match.status === "BYE" ? "success" : "default"}
                />
                {isMine && (
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      size="small"
                      color="primary"
                      label="Entrar na sua partida"
                      onClick={() => navigate(`/room/${match.roomCode}`)}
                      sx={{ cursor: "pointer" }}
                    />
                  </Box>
                )}
              </Paper>
            );
          })}
        </Box>
      ))}
      <Box sx={{ minWidth: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <BsTrophyFill size={40} color="gold" />
        <Typography variant="body2" align="center" sx={{ mt: 1 }}>
          Campeão
        </Typography>
      </Box>
    </Box>
  );
};

export default BracketView;
