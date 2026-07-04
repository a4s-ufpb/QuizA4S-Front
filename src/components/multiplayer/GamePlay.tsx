import { memo, useCallback, useEffect, useMemo, useState } from "react";
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
import type { AlternativeView } from "../../types/game";
import QuestionImageGallery from "../questionImageGallery/QuestionImageGallery";
import FeedbackBox from "../feedbackBox/FeedbackBox";
import { useQuestionImagesQuery } from "../../query/useQuestionQueries";
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

interface AlternativesGridProps {
  alternatives: AlternativeView[];
  selectedId: number | null;
  revealing: boolean;
  correctAlternativeId?: number | null;
  inQuestion: boolean;
  isSpectator: boolean;
  onPick: (alternativeId: number) => void;
}

// Isolado + memoizado: broadcasts de estado que não mexem na questão atual
// (chat, jogador ficando pronto, etc.) não devem re-renderizar os botões de
// resposta — só o placar/lista de jogadores muda nesses casos.
const AlternativesGrid = memo(function AlternativesGrid({
  alternatives,
  selectedId,
  revealing,
  correctAlternativeId,
  inQuestion,
  isSpectator,
  onPick,
}: AlternativesGridProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        gap: 2,
        flex: "0 0 auto",
      }}
    >
      {alternatives.map((alt, i) => {
        const isSelected = selectedId === alt.id;
        const isCorrect = correctAlternativeId === alt.id;
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
            onClick={() => onPick(alt.id)}
          >
            {alt.text}
          </Button>
        );
      })}
    </Box>
  );
});

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

  // O broadcast STOMP não traz mais base64 (só imageUrl/imagesOrder); quando
  // imagesOrder indica upload (IMAGE_1/IMAGE_2), busca as imagens à parte
  // (cacheado por questão — outra rodada/sala não baixa de novo).
  const needsImageFetch = Boolean(
    question?.imagesOrder?.includes("IMAGE_1") ||
      question?.imagesOrder?.includes("IMAGE_2")
  );
  const imagesQuery = useQuestionImagesQuery(question?.id ?? 0, needsImageFetch);

  const questionImages = useMemo(() => {
    if (!question) return [];
    const fetchedImages = imagesQuery.data?.success ? imagesQuery.data.data : null;
    return getOrderedQuestionImages({
      imageUrl: question.imageUrl,
      imageBase64One: fetchedImages?.imageBase64One,
      imageBase64Two: fetchedImages?.imageBase64Two,
      imagesOrder: question.imagesOrder,
    } as QuestionModel);
  }, [question, imagesQuery.data]);

  const me = state!.players.find((p) => p.id === room.playerId);
  const isTeamMode = state!.config.roomMode === "TEAM";
  const isSpectator = isTeamMode && Boolean(me?.teamId) && !me?.captain;

  // Identidade estável: broadcasts de estado não relacionados à questão
  // (chat, outro jogador ficando pronto) não devem invalidar o memo do
  // AlternativesGrid só porque essa função foi recriada.
  const pick = useCallback(
    (alternativeId: number) => {
      if (selectedId != null || !inQuestion || isSpectator) return;
      setSelectedId(alternativeId);
      room.answer(alternativeId);
    },
    [selectedId, inQuestion, isSpectator, room]
  );

  if (!question) {
    return (
      <div className="mp-quiz-external">
        <Container sx={{ py: 5, textAlign: "center", color: "text.secondary" }}>
          Preparando questão...
        </Container>
      </div>
    );
  }

  const showResult = state!.status === "BETWEEN" && result != null;
  const showQuestion = !showResult || revealing;
  const showScoreboardOnly = showResult && !revealing;

  return (
    <div className="mp-quiz-external">
      {feedback && <FeedbackBox title={feedback.message} color={feedback.color} />}
      <Container
        sx={{ py: 4, display: "flex", flexDirection: "column", minHeight: "100dvh" }}
      >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flex: "0 0 auto",
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
          sx={{ mb: 3, flex: "0 0 auto" }}
        />
      )}

      {showQuestion && (
        <>
          <Card
            key={question.index}
            elevation={2}
            className="mp-fade-in mp-question-card"
            sx={{
              mb: 3,
              flex: questionImages.length > 0 ? 1 : "0 0 auto",
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardContent
              sx={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                flex: 1,
                minHeight: 0,
                width: "100%",
              }}
            >
              <Typography variant="h5" sx={{ flex: "0 0 auto" }}>
                {question.title}
              </Typography>
              {questionImages.length > 0 && (
                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    display: "flex",
                    justifyContent: "center",
                    mt: 2,
                  }}
                >
                  <QuestionImageGallery
                    images={questionImages}
                    className="question-image"
                  />
                </Box>
              )}
            </CardContent>
          </Card>

          <AlternativesGrid
            alternatives={question.alternatives}
            selectedId={selectedId}
            revealing={revealing}
            correctAlternativeId={result?.correctAlternativeId}
            inQuestion={inQuestion}
            isSpectator={isSpectator}
            onPick={pick}
          />

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
