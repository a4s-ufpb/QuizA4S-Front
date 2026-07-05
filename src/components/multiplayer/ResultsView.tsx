import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  CardHeader,
  Button,
  List,
  ListItem,
  Box,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  BsTrophyFill,
  BsPersonFill,
  BsHandThumbsUp,
  BsHandThumbsUpFill,
  BsShareFill,
} from "react-icons/bs";
import confetti from "canvas-confetti";
import type { UseGameRoom } from "../../hooks/useGameRoom";
import { useLikeUserMutation } from "../../query/useUserQueries";
import { getStoredUser } from "../../util/storage";
import { addMatchHistoryEntry } from "../../util/matchHistory";
import { useRecordMatchMutation } from "../../query/useMatchHistoryQueries";
import { generateResultImage, downloadImage } from "../../util/shareImage";
import "./multiplayer.css";

interface ResultsViewProps {
  room: UseGameRoom;
}

interface PodiumEntry {
  id: string;
  name: string;
  avatar?: string | null;
  score: number;
  isMe?: boolean;
  userUuid?: string | null;
}

/** Botão de curtida: só pra jogadores logados, curtindo outra conta real (não convidado). */
function LikeButton({
  targetUserUuid,
  canLike,
}: {
  targetUserUuid: string | null | undefined;
  canLike: boolean;
}) {
  const likeUserMutation = useLikeUserMutation();
  const [liked, setLiked] = useState(false);

  if (!canLike || !targetUserUuid) return null;

  return (
    <Tooltip title={liked ? "Curtido!" : "Dar like"}>
      <span>
        <IconButton
          size="small"
          color="primary"
          disabled={liked}
          onClick={() => {
            setLiked(true);
            likeUserMutation.mutate(targetUserUuid);
          }}
        >
          {liked ? <BsHandThumbsUpFill /> : <BsHandThumbsUp />}
        </IconButton>
      </span>
    </Tooltip>
  );
}

const PODIUM_ORDER = [1, 0, 2]; // 2º à esquerda, 1º ao centro, 3º à direita
const PODIUM_HEIGHT: Record<number, number> = { 0: 190, 1: 145, 2: 115 };

function Podium({ entries, canLike }: { entries: PodiumEntry[]; canLike: boolean }) {
  const top3 = entries.slice(0, 3);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: 2,
        mb: 4,
      }}
    >
      {PODIUM_ORDER.filter((i) => top3[i]).map((i) => {
        const entry = top3[i];
        return (
          <Box
            key={entry.id}
            className="mp-pop"
            style={{ animationDelay: `${i * 120}ms` }}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: 140,
            }}
          >
            <Box sx={{ fontSize: "2.6em", mb: 0.5 }}>
              {entry.avatar || <BsPersonFill />}
            </Box>
            <Typography
              sx={{
                color: "#fff",
                fontWeight: "bold",
                textAlign: "center",
                maxWidth: 130,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {entry.name}
              {entry.isMe && " (você)"}
            </Typography>
            <Typography sx={{ color: "#fff", mb: 1 }}>{entry.score} pts</Typography>
            {!entry.isMe && (
              <LikeButton targetUserUuid={entry.userUuid} canLike={canLike} />
            )}
            <Box
              className={`mp-podium-step mp-podium-${i + 1}`}
              sx={{ height: PODIUM_HEIGHT[i], width: "100%" }}
            >
              <span className="mp-podium-rank">{i + 1}º</span>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

function rankBadge(index: number) {
  if (index >= 3) return <strong style={{ marginRight: 8 }}>{index + 1}º</strong>;
  return (
    <span className={`mp-rank-icon mp-rank-${index + 1}`}>{index + 1}</span>
  );
}

/** Tela final: pódio (top 3) + ranking dos demais, com confete ao entrar. */
const ResultsView = ({ room }: ResultsViewProps) => {
  const navigate = useNavigate();
  const recordMatchMutation = useRecordMatchMutation();
  const state = room.state!;
  const isTeam = state.config.roomMode === "TEAM";
  // Curtir é uma ação de conta (não de equipe) — só faz sentido no modo
  // individual, e só quem está logado pode curtir.
  const canLike = !isTeam && Boolean(getStoredUser().uuid);

  const players = [...state.players]
    .filter((p) => !p.host || state.players.length === 1)
    .sort((a, b) => b.score - a.score);
  const teams = [...state.teams].sort((a, b) => b.score - a.score);

  const podiumEntries: PodiumEntry[] = isTeam
    ? teams.map((t) => ({ id: t.id, name: t.name, avatar: t.avatar, score: t.score }))
    : players.map((p) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        score: p.score,
        isMe: p.id === room.playerId,
        userUuid: p.userUuid,
      }));

  const myRank = isTeam
    ? teams.findIndex(
        (t) => t.id === state.players.find((p) => p.id === room.playerId)?.teamId
      )
    : podiumEntries.findIndex((p) => p.isMe);

  useEffect(() => {
    // Cores/intensidade do confete variam conforme a posição de quem está vendo a tela.
    const RANK_COLORS: Record<number, string[]> = {
      0: ["#ffd700", "#fff2a8", "#ffffff"], // ouro
      1: ["#c0c0c0", "#e8e8e8", "#ffffff"], // prata
      2: ["#cd7f32", "#e6a86b", "#ffffff"], // bronze
    };
    const colors = RANK_COLORS[myRank];
    const particleCount = myRank === 0 ? 160 : myRank === 1 ? 120 : myRank === 2 ? 100 : 70;

    confetti({ particleCount, spread: 90, origin: { y: 0.3 }, colors });
    const timeout = setTimeout(() => {
      confetti({ particleCount: particleCount * 0.65, angle: 60, spread: 70, origin: { x: 0 }, colors });
      confetti({ particleCount: particleCount * 0.65, angle: 120, spread: 70, origin: { x: 1 }, colors });
    }, 250);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const myScore = isTeam
    ? (teams.find(
        (t) => t.id === state.players.find((p) => p.id === room.playerId)?.teamId
      )?.score ?? 0)
    : (players.find((p) => p.id === room.playerId)?.score ?? 0);
  const myName = isTeam
    ? (teams.find(
        (t) => t.id === state.players.find((p) => p.id === room.playerId)?.teamId
      )?.name ?? "Equipe")
    : (players.find((p) => p.id === room.playerId)?.name ?? "Jogador");

  useEffect(() => {
    const matchThemeName = state.themeName || "Multiplayer";
    addMatchHistoryEntry({
      mode: "MULTIPLAYER",
      themeName: matchThemeName,
      score: myScore,
      total: state.totalQuestions,
    });
    if (getStoredUser().uuid) {
      recordMatchMutation.mutate({
        mode: "MULTIPLAYER",
        themeName: matchThemeName,
        score: myScore,
        total: state.totalQuestions,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleShare() {
    const dataUrl = generateResultImage({
      themeName: state.themeName || "Multiplayer",
      playerName: myName,
      rank: myRank,
      score: myScore,
      total: state.totalQuestions,
    });
    downloadImage(dataUrl, "quiz-a4s-resultado.png");
  }

  return (
    <Container sx={{ py: 5 }}>
      <Box className="mp-pop mp-final-scoreboard" sx={{ textAlign: "center", mb: 3 }}>
        <BsTrophyFill color="gold" size={56} />
        <Typography variant="h4" sx={{ mt: 2, color: "#fff" }}>
          Fim de jogo!
        </Typography>
        <Button
          variant="outlined"
          startIcon={<BsShareFill />}
          onClick={handleShare}
          sx={{ mt: 2, color: "#fff", borderColor: "#fff" }}
        >
          Compartilhar resultado
        </Button>
      </Box>

      <Podium entries={podiumEntries} canLike={canLike} />

      {isTeam && teams.length > 0 && (
        <Card elevation={2} className="mp-final-scoreboard" sx={{ mb: 4 }}>
          <CardHeader title="Equipes" />
          <List disablePadding>
            {teams.map((t, i) => (
              <ListItem
                key={t.id}
                className="mp-rank-item"
                style={{ animationDelay: `${i * 80}ms` }}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ display: "flex", alignItems: "center" }}>
                  {rankBadge(i)}
                  {t.avatar && <span style={{ marginRight: 6 }}>{t.avatar}</span>}
                  {t.name}
                </span>
                <strong>{t.score}</strong>
              </ListItem>
            ))}
          </List>
        </Card>
      )}

      <Card elevation={2} className="mp-final-scoreboard" sx={{ mb: 4 }}>
        <CardHeader title="Jogadores" />
        <List disablePadding>
          {players.slice(isTeam ? 0 : 3).map((p, i) => {
            const rank = isTeam ? i : i + 3;
            return (
              <ListItem
                key={p.id}
                className="mp-rank-item"
                style={{ animationDelay: `${i * 80}ms` }}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ display: "flex", alignItems: "center" }}>
                  {rankBadge(rank)}
                  {p.avatar && <span style={{ marginRight: 6 }}>{p.avatar}</span>}
                  {p.name}
                  {p.id === room.playerId && " (você)"}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {p.id !== room.playerId && (
                    <LikeButton targetUserUuid={p.userUuid} canLike={canLike} />
                  )}
                  <strong>{p.score}</strong>
                </span>
              </ListItem>
            );
          })}
        </List>
      </Card>

      <Box
        className="mp-final-scoreboard"
        sx={{ display: "flex", gap: 1, justifyContent: "center", flexWrap: "wrap" }}
      >
        <Button variant="outlined" color="secondary" onClick={() => navigate("/multiplayer")}>
          Sair
        </Button>
      </Box>
    </Container>
  );
};

export default ResultsView;
