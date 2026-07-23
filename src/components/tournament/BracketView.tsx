import { Box, Typography, Chip } from "@mui/material";
import { BsTrophyFill, BsController } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import type { MatchView, TournamentPlayerView } from "../../types/tournament";
import { TitleBadge, FramedAvatar, PlayerName } from "../cosmetics/Cosmetic";
import "./tournament.css";

interface BracketViewProps {
  rounds: MatchView[][];
  players: TournamentPlayerView[];
  myPlayerId: string;
  tournamentCode?: string;
  /**
   * Total de rodadas do chaveamento (log2 do nº de jogadores). Necessário para
   * rotular corretamente já na 1ª rodada — usar rounds.length rotularia a
   * primeira rodada de um bracket de 4 como "Final" em vez de "Semifinal".
   */
  totalRounds?: number;
  championId?: string | null;
}

function findPlayer(players: TournamentPlayerView[], id: string | null) {
  if (!id) return null;
  return players.find((p) => p.id === id) ?? null;
}

function chunkPairs<T>(items: T[]): T[][] {
  const pairs: T[][] = [];
  for (let i = 0; i < items.length; i += 2) pairs.push(items.slice(i, i + 2));
  return pairs;
}

/** Um lado do confronto: assento (seed), avatar, nome e destaque de vencedor/perdedor. */
function Slot({
  player,
  seed,
  isWinner,
  isLoser,
  isMe,
}: {
  player: TournamentPlayerView | null;
  seed: number;
  isWinner: boolean;
  isLoser: boolean;
  isMe: boolean;
}) {
  return (
    <Box className={`trn-slot ${isWinner ? "winner" : ""} ${isLoser ? "loser" : ""}`}>
      <span className="trn-seed">{seed}</span>
      {player?.frame && (
        <FramedAvatar code={player.frame} size={22}>
          <span style={{ fontSize: "0.7em" }}>·</span>
        </FramedAvatar>
      )}
      <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 0.5, flexGrow: 1, minWidth: 0 }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {player
            ? <PlayerName name={player.name} font={player.font} style={player.nameStyle} effect={player.nameEffect} />
            : "A definir"}
        </span>
        {player?.title && <TitleBadge code={player.title} />}
        {isMe && <span style={{ fontSize: "0.75em", opacity: 0.8 }}>(você)</span>}
      </Box>
      {isWinner && <BsTrophyFill color="#2e7d32" aria-label="vencedor" />}
    </Box>
  );
}

function roundLabel(index: number, total: number): string {
  const fromEnd = total - index;
  if (fromEnd === 1) return "Final";
  if (fromEnd === 2) return "Semifinal";
  if (fromEnd === 3) return "Quartas de final";
  if (fromEnd === 4) return "Oitavas de final";
  return `Rodada ${index + 1}`;
}

const STATUS_LABELS: Record<MatchView["status"], string> = {
  PENDING: "Aguardando",
  WAITING_PLAYERS: "Sala criada",
  IN_PROGRESS: "Em andamento",
  DONE: "Concluído",
  BYE: "Avanço direto",
};

const STATUS_COLORS: Record<MatchView["status"], "default" | "success" | "info" | "warning"> = {
  PENDING: "default",
  WAITING_PLAYERS: "info",
  IN_PROGRESS: "warning",
  DONE: "success",
  BYE: "success",
};

const BracketView = ({
  rounds,
  players,
  myPlayerId,
  tournamentCode,
  totalRounds,
  championId,
}: BracketViewProps) => {
  const navigate = useNavigate();
  const labelTotal = totalRounds && totalRounds > 0 ? totalRounds : rounds.length;
  const champion = championId ? findPlayer(players, championId) : null;

  function matchCard(match: MatchView) {
    const isMine =
      match.status !== "DONE" &&
      match.status !== "BYE" &&
      (match.player1Id === myPlayerId || match.player2Id === myPlayerId) &&
      Boolean(match.roomCode);
    const hasWinner = Boolean(match.winnerId);
    return (
      <Box
        key={match.id}
        className={`trn-match ${isMine ? "mine" : ""} ${match.status === "DONE" ? "done" : ""}`}
      >
        <Slot
          player={findPlayer(players, match.player1Id)}
          seed={1}
          isWinner={hasWinner && match.winnerId === match.player1Id}
          isLoser={hasWinner && match.winnerId !== match.player1Id && Boolean(match.player1Id)}
          isMe={match.player1Id === myPlayerId}
        />
        <div className="trn-vs">VS</div>
        <Slot
          player={findPlayer(players, match.player2Id)}
          seed={2}
          isWinner={hasWinner && match.winnerId === match.player2Id}
          isLoser={hasWinner && match.winnerId !== match.player2Id && Boolean(match.player2Id)}
          isMe={match.player2Id === myPlayerId}
        />
        <Box className="trn-match-action">
          {isMine ? (
            <Chip
              size="small"
              color="primary"
              icon={<BsController />}
              label="Entrar na sua partida"
              onClick={() =>
                navigate(`/room/${match.roomCode}${tournamentCode ? `?tournament=${tournamentCode}` : ""}`)
              }
              sx={{ cursor: "pointer", fontWeight: "bold" }}
            />
          ) : (
            <Chip
              size="small"
              label={STATUS_LABELS[match.status]}
              color={STATUS_COLORS[match.status]}
              variant={match.status === "DONE" || match.status === "BYE" ? "filled" : "outlined"}
            />
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box className="trn-bracket">
      {rounds.map((round, roundIndex) => {
        const isLast = roundIndex === rounds.length - 1;
        return (
          <Box key={roundIndex} className={`trn-round ${isLast ? "trn-round-last" : ""}`}>
            <div className="trn-round-title">{roundLabel(roundIndex, labelTotal)}</div>
            <div className="trn-round-matches">
              {isLast
                ? round.map((match) => (
                    <div className="trn-cell" key={match.id}>
                      {matchCard(match)}
                    </div>
                  ))
                : chunkPairs(round).map((pair, pairIndex) => (
                    <div className="trn-pair" key={pairIndex}>
                      {pair.map((match) => (
                        <div className="trn-cell" key={match.id}>
                          {matchCard(match)}
                        </div>
                      ))}
                    </div>
                  ))}
            </div>
          </Box>
        );
      })}
      <Box className="trn-champion-col">
        <div className="trn-champion-badge">
          <BsTrophyFill size={40} color="#7a4b00" />
        </div>
        <Typography variant="body2" align="center" sx={{ fontWeight: "bold", color: "text.secondary" }}>
          Campeão
        </Typography>
        {champion && (
          <Typography align="center" sx={{ fontWeight: "bold", color: "#f5b301" }}>
            {champion.name}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default BracketView;
