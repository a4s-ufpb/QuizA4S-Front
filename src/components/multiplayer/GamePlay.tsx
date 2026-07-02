import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  LinearProgress,
  Typography,
} from "@mui/material";
import type { UseGameRoom } from "../../hooks/useGameRoom";
import { DEFAULT_IMG } from "../../vite-env";
import "./multiplayer.css";

interface GamePlayProps {
  room: UseGameRoom;
}

const ANSWER_COLORS = [
  "error",
  "primary",
  "warning",
  "success",
] as const;

const GamePlay = ({ room }: GamePlayProps) => {
  const { question, result, state } = room;
  const inQuestion = state!.status === "IN_QUESTION";

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);

  // Reinicia a seleção a cada nova questão.
  useEffect(() => {
    setSelectedId(null);
  }, [question?.index]);

  // Cronômetro derivado de startAt (relógio do servidor).
  useEffect(() => {
    if (!question || !inQuestion) return;
    function tick() {
      const endAt = question!.startAt + question!.timeSeconds * 1000;
      setRemaining(Math.max(0, Math.ceil((endAt - Date.now()) / 1000)));
    }
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [question, inQuestion]);

  const scoreboard = useMemo(
    () => result?.scoreboard ?? [],
    [result]
  );

  if (!question) {
    return (
      <Container sx={{ py: 5, textAlign: "center", color: "text.secondary" }}>
        Preparando questão...
      </Container>
    );
  }

  function pick(alternativeId: number) {
    if (selectedId != null || !inQuestion) return;
    setSelectedId(alternativeId);
    room.answer(alternativeId);
  }

  const showResult = state!.status === "BETWEEN" && result != null;

  return (
    <Container sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography color="text.secondary">
          Questão {question.index + 1} de {question.total}
        </Typography>
        {inQuestion && (
          <span className={`fw-bold fs-5 mp-timer ${remaining <= 5 ? "low" : ""}`}>
            {remaining}s
          </span>
        )}
      </Box>
      {inQuestion && (
        <LinearProgress
          variant="determinate"
          value={(remaining / question.timeSeconds) * 100}
          sx={{ mb: 3 }}
        />
      )}

      <Card key={question.index} elevation={2} className="mp-fade-in" sx={{ mb: 4 }}>
        <CardContent sx={{ textAlign: "center" }}>
          <Typography variant="h5">{question.title}</Typography>
          {question.imageUrl && (
            <Box
              component="img"
              src={question.imageUrl || DEFAULT_IMG}
              alt="questão"
              sx={{ maxHeight: "220px", objectFit: "contain", my: 3 }}
            />
          )}
        </CardContent>
      </Card>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
        }}
      >
        {question.alternatives.map((alt, i) => {
          const isCorrect = result?.correctAlternativeId === alt.id;
          const isSelected = selectedId === alt.id;
          let color: (typeof ANSWER_COLORS)[number] | "inherit" =
            ANSWER_COLORS[i % ANSWER_COLORS.length];
          let variant: "contained" | "outlined" = "contained";
          if (showResult) {
            if (isCorrect) {
              color = "success";
            } else if (isSelected) {
              color = "error";
            } else {
              color = "inherit";
              variant = "outlined";
            }
          } else if (isSelected) {
            color = "inherit";
          }
          return (
            <Button
              key={alt.id}
              variant={variant}
              color={color === "inherit" ? undefined : color}
              size="large"
              className="mp-answer-btn"
              sx={{ justifyContent: "flex-start", textAlign: "left", py: 2 }}
              disabled={selectedId != null || !inQuestion}
              onClick={() => pick(alt.id)}
            >
              {alt.text}
              {showResult && isCorrect && " ✓"}
            </Button>
          );
        })}
      </Box>

      {inQuestion && selectedId != null && (
        <Typography align="center" color="text.secondary" sx={{ mt: 3 }}>
          Resposta enviada. Aguardando os demais...
        </Typography>
      )}

      {showResult && (
        <Card elevation={2} sx={{ mt: 4 }}>
          <CardHeader title="Placar" sx={{ fontWeight: "bold" }} />
          <CardContent>
            {state!.config.roomMode === "TEAM" && (
              <Box sx={{ mb: 3 }}>
                {result!.teamScoreboard.map((t) => (
                  <Box
                    key={t.id}
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>{t.name}</span>
                    <strong>{t.score}</strong>
                  </Box>
                ))}
                <hr />
              </Box>
            )}
            {scoreboard.slice(0, 5).map((p, i) => (
              <Box
                key={p.id}
                sx={{ display: "flex", justifyContent: "space-between" }}
              >
                <span>
                  {i + 1}. {p.name}
                  {p.id === room.playerId && " (você)"}
                </span>
                <strong>{p.score}</strong>
              </Box>
            ))}
            {room.isHost && state!.config.advanceMode === "HOST" && (
              <Box sx={{ display: "grid", mt: 3 }}>
                <Button variant="contained" onClick={room.next}>
                  {result!.lastQuestion ? "Ver resultado final" : "Próxima questão"}
                </Button>
              </Box>
            )}
            {state!.config.advanceMode === "AUTO" && (
              <Typography color="text.secondary" align="center" sx={{ mt: 3, mb: 0 }}>
                {result!.lastQuestion
                  ? "Finalizando..."
                  : "Próxima questão em instantes..."}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default GamePlay;
