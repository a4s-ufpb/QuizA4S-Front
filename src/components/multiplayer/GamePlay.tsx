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
import QuestionImageGallery from "../questionImageGallery/QuestionImageGallery";
import FeedbackBox from "../feedbackBox/FeedbackBox";
import { getOrderedQuestionImages } from "../../util/questionImages";
import type { Question as QuestionModel } from "../../types";
import correctSoundFile from "../../assets/sounds/alternative-success.mp3";
import errorSoundFile from "../../assets/sounds/alternative-error.mp3";
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

const REVEAL_DURATION_MS = 2000;

const GamePlay = ({ room }: GamePlayProps) => {
  const { question, result, state } = room;
  const inQuestion = state!.status === "IN_QUESTION";

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(() => question?.timeSeconds ?? 0);
  const [revealing, setRevealing] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; color: string } | null>(
    null
  );

  // Reinicia a seleção e o cronômetro (com o tempo cheio) a cada nova questão,
  // evitando o frame inicial em "0s" antes do primeiro tick assíncrono.
  useEffect(() => {
    setSelectedId(null);
    if (question) setRemaining(question.timeSeconds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question?.index]);

  // Ao receber o resultado da questão: toca som, mostra feedback e a animação
  // de acerto/erro nos botões por um instante (igual ao quiz single-player),
  // antes de esconder a questão e deixar só o placar visível.
  useEffect(() => {
    if (!result) return;

    if (selectedId != null) {
      const isCorrect = result.correctAlternativeId === selectedId;
      const sound = new Audio(isCorrect ? correctSoundFile : errorSoundFile);
      sound.play().catch(() => {});
      setFeedback({
        message: isCorrect ? "Parabéns, você acertou!" : "Que pena, você errou!",
        color: isCorrect ? "green" : "red",
      });
    }

    setRevealing(true);
    const timeout = setTimeout(() => {
      setRevealing(false);
      setFeedback(null);
    }, REVEAL_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [result, selectedId]);

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

  const questionImages = useMemo(() => {
    if (!question) return [];
    return getOrderedQuestionImages({
      imageUrl: question.imageUrl,
      imageBase64One: question.imageBase64One,
      imageBase64Two: question.imageBase64Two,
      imagesOrder: question.imagesOrder,
    } as QuestionModel);
  }, [question]);

  if (!question) {
    return (
      <div className="mp-quiz-external">
        <Container sx={{ py: 5, textAlign: "center", color: "text.secondary" }}>
          Preparando questão...
        </Container>
      </div>
    );
  }

  const me = state!.players.find((p) => p.id === room.playerId);
  const isTeamMode = state!.config.roomMode === "TEAM";
  const isSpectator = isTeamMode && Boolean(me?.teamId) && !me?.captain;

  function pick(alternativeId: number) {
    if (selectedId != null || !inQuestion || isSpectator) return;
    setSelectedId(alternativeId);
    room.answer(alternativeId);
  }

  const showResult = state!.status === "BETWEEN" && result != null;
  const showQuestion = !showResult || revealing;
  const showScoreboardOnly = showResult && !revealing;

  return (
    <div className="mp-quiz-external">
      {feedback && <FeedbackBox title={feedback.message} color={feedback.color} />}
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

      {showQuestion && (
        <>
          <Card
            key={question.index}
            elevation={2}
            className="mp-fade-in mp-question-card"
            sx={{ mb: 4 }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <Typography variant="h5">{question.title}</Typography>
              {questionImages.length > 0 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <QuestionImageGallery
                    images={questionImages}
                    className="question-image"
                  />
                </Box>
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
              const isSelected = selectedId === alt.id;
              const isCorrect = result?.correctAlternativeId === alt.id;
              const color: (typeof ANSWER_COLORS)[number] | "inherit" = isSelected
                ? "inherit"
                : ANSWER_COLORS[i % ANSWER_COLORS.length];
              // Só a alternativa clicada recebe a animação (scale/shake),
              // igual ao quiz single-player — as demais só mudam de cor.
              const revealClass = revealing && isSelected
                ? isCorrect
                  ? "correct-answer"
                  : "wrong-answer"
                : "";
              return (
                <Button
                  key={alt.id}
                  variant="contained"
                  color={color === "inherit" ? undefined : color}
                  size="large"
                  className={`mp-answer-btn ${revealClass}`}
                  sx={{
                    justifyContent: "flex-start",
                    textAlign: "left",
                    py: 2,
                    ...(revealing &&
                      (isCorrect
                        ? { bgcolor: "#5bcebf", color: "#fff" }
                        : { bgcolor: "#d9434f", color: "#fff" })),
                  }}
                  disabled={selectedId != null || !inQuestion || isSpectator}
                  onClick={() => pick(alt.id)}
                >
                  {alt.text}
                </Button>
              );
            })}
          </Box>

          {inQuestion && isSpectator && (
            <Typography align="center" color="text.secondary" sx={{ mt: 3 }}>
              Seu capitão está respondendo...
            </Typography>
          )}
          {inQuestion && !isSpectator && selectedId != null && (
            <Typography align="center" color="text.secondary" sx={{ mt: 3 }}>
              Resposta enviada. Aguardando os demais...
            </Typography>
          )}
        </>
      )}

      {showScoreboardOnly && (
        <Card elevation={2} className="mp-pop" sx={{ mt: 4 }}>
          <CardHeader title="Placar" sx={{ fontWeight: "bold" }} />
          <CardContent>
            {state!.config.roomMode === "TEAM" && (
              <Box sx={{ mb: 3 }}>
                {result!.teamScoreboard.map((t) => (
                  <Box
                    key={t.id}
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <span>
                      {t.avatar && <span style={{ marginRight: 6 }}>{t.avatar}</span>}
                      {t.name}
                    </span>
                    <strong>{t.score}</strong>
                  </Box>
                ))}
                <hr />
              </Box>
            )}
            {scoreboard.slice(0, 5).map((p, i) => (
              <Box
                key={p.id}
                sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
              >
                <span style={{ display: "flex", alignItems: "center" }}>
                  {i < 3 ? (
                    <span className={`mp-rank-icon mp-rank-${i + 1}`}>
                      {i + 1}
                    </span>
                  ) : (
                    <span style={{ marginRight: 10 }}>{i + 1}.</span>
                  )}
                  {p.avatar && <span style={{ marginRight: 6 }}>{p.avatar}</span>}
                  {p.name}
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
    </div>
  );
};

export default GamePlay;
