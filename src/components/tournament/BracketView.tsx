import { Box, Paper, Typography, Chip } from "@mui/material";
import { BsTrophyFill } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import type { MatchView, TournamentPlayerView } from "../../types/tournament";
import { TitleBadge, FramedAvatar } from "../cosmetics/Cosmetic";

interface BracketViewProps {
  rounds: MatchView[][];
  players: TournamentPlayerView[];
  myPlayerId: string;
  tournamentCode?: string;
}

function findPlayer(players: TournamentPlayerView[], id: string | null) {
  if (!id) return null;
  return players.find((p) => p.id === id) ?? null;
}

/** Nome do jogador com moldura e título equipados (se houver). */
function PlayerLabel({
  player,
  highlight,
}: {
  player: TournamentPlayerView | null;
  highlight: boolean;
}) {
  return (
    <Typography
      component="span"
      variant="body2"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        fontWeight: highlight ? "bold" : "normal",
        color: highlight ? "success.main" : "text.primary",
      }}
    >
      {player?.frame && (
        <FramedAvatar code={player.frame} size={20}>
          <span style={{ fontSize: "0.7em" }}>·</span>
        </FramedAvatar>
      )}
      {player?.name ?? "—"}
      {player?.title && <TitleBadge code={player.title} />}
    </Typography>
  );
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

const BracketView = ({ rounds, players, myPlayerId, tournamentCode }: BracketViewProps) => {
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
                <PlayerLabel
                  player={findPlayer(players, match.player1Id)}
                  highlight={Boolean(match.winnerId) && match.winnerId === match.player1Id}
                />
                <PlayerLabel
                  player={findPlayer(players, match.player2Id)}
                  highlight={Boolean(match.winnerId) && match.winnerId === match.player2Id}
                />
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
                      onClick={() => navigate(
                        `/room/${match.roomCode}${tournamentCode ? `?tournament=${tournamentCode}` : ""}`
                      )}
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
