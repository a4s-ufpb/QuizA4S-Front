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
import {
  BsGraphUp,
  BsGraphUpArrow,
  BsRocketTakeoffFill,
  BsEyeSlashFill,
  BsTypeBold,
  BsLightbulbFill,
  BsArrowsMove,
  BsCashCoin,
} from "react-icons/bs";
import type { IconType } from "react-icons";
import type { UseGameRoom } from "../../hooks/useGameRoom";
import type { AlternativeView, QuestionPower } from "../../types/game";
import { QUESTION_POWER_LABELS } from "../../types/game";

const POWER_STYLE: Record<
  QuestionPower,
  { icon: IconType; color: "primary" | "secondary" | "error" | "info" | "success" | "warning" }
> = {
  SCORE_1_5X: { icon: BsGraphUp, color: "success" },
  SCORE_2_0X: { icon: BsGraphUpArrow, color: "info" },
  SCORE_2_5X: { icon: BsRocketTakeoffFill, color: "secondary" },
  HIDE_WRONG_ALTERNATIVE: { icon: BsEyeSlashFill, color: "warning" },
  HIDE_ALTERNATIVE_TEXTS: { icon: BsTypeBold, color: "primary" },
  BLINK_SCREEN: { icon: BsLightbulbFill, color: "warning" },
  SHAKE_SCREEN: { icon: BsArrowsMove, color: "error" },
  STEAL_POINTS: { icon: BsCashCoin, color: "error" },
};
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

const ALTERNATIVE_LETTERS = ["A", "B", "C", "D", "E", "F"];

interface AlternativesGridProps {
  alternatives: AlternativeView[];
  selectedId: number | null;
  revealing: boolean;
  correctAlternativeId?: number | null;
  inQuestion: boolean;
  isSpectator: boolean;
  hideTexts: boolean;
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
  hideTexts,
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
              // Os botões ficam `disabled` durante o reveal (resposta já
              // enviada) — sem o override de "&.Mui-disabled" o tema aplica
              // a opacidade/cor cinza padrão por cima e o verde/vermelho não
              // aparece.
              ...(revealing &&
                (isCorrect
                  ? {
                      bgcolor: "#5bcebf",
                      color: "#fff",
                      "&.Mui-disabled": { bgcolor: "#5bcebf", color: "#fff" },
                    }
                  : {
                      bgcolor: "#d9434f",
                      color: "#fff",
                      "&.Mui-disabled": { bgcolor: "#d9434f", color: "#fff" },
                    })),
            }}
            disabled={selectedId != null || !inQuestion || isSpectator}
            onClick={() => onPick(alt.id)}
          >
            {hideTexts ? ALTERNATIVE_LETTERS[i] : alt.text}
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

  // Imagens já vêm como URLs do MinIO direto no broadcast STOMP (leves, sem
  // precisar de fetch sob demanda).
  const questionImages = useMemo(() => {
    if (!question) return [];
    return getOrderedQuestionImages({
      imageUrl: question.imageUrl,
      imageOneUrl: question.imageOneUrl,
      imageTwoUrl: question.imageTwoUrl,
      imagesOrder: question.imagesOrder,
    } as QuestionModel);
  }, [question]);

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

  const isFunMode = state!.config.gameStyle === "FUN";
  const activePower = inQuestion ? question.activePower : null;
  const powerClass =
    activePower === "BLINK_SCREEN"
      ? "mp-power-blink"
      : activePower === "SHAKE_SCREEN"
        ? "mp-power-shake"
        : "";

  return (
    <div className={`mp-quiz-external ${powerClass}`}>
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

      {activePower && (
        <Box
          className="mp-pop"
          sx={{
            mb: 2,
            flex: "0 0 auto",
            textAlign: "center",
            bgcolor: "warning.main",
            color: "#000",
            borderRadius: 2,
            py: 0.75,
            fontWeight: "bold",
          }}
        >
          ⚡ Poder ativo: {QUESTION_POWER_LABELS[activePower]}
        </Box>
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
            hideTexts={activePower === "HIDE_ALTERNATIVE_TEXTS"}
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
            {room.isHost && isFunMode && !result!.lastQuestion && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Ativar poder pra próxima questão:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {(Object.keys(QUESTION_POWER_LABELS) as QuestionPower[]).map((power) => {
                    const { icon: PowerIcon, color } = POWER_STYLE[power];
                    return (
                      <Button
                        key={power}
                        size="small"
                        startIcon={<PowerIcon />}
                        variant={state!.pendingPowerUp === power ? "contained" : "outlined"}
                        color={color}
                        onClick={() =>
                          room.setPower(state!.pendingPowerUp === power ? null : power)
                        }
                      >
                        {QUESTION_POWER_LABELS[power]}
                      </Button>
                    );
                  })}
                </Box>
              </Box>
            )}
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
