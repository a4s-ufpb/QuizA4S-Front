import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Tooltip,
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
  BsCheckLg,
  BsStarFill,
  BsBarChartFill,
  BsSkipForwardFill,
  BsEyeFill,
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
import { playSound } from "../../util/sound";
import { TitleBadge, FramedAvatar, bannerClassName } from "../cosmetics/Cosmetic";
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

// Tempo com a questão ainda visível após o resultado, pro jogador ver se
// acertou ou errou antes da tela mudar (era 2s — curto demais em sala de aula).
const REVEAL_DURATION_MS = 4000;

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
        const color = ANSWER_COLORS[i % ANSWER_COLORS.length];
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
            color={color}
            size="large"
            className={`mp-answer-btn ${revealClass}`}
            sx={{
              justifyContent: "flex-start",
              textAlign: "left",
              py: 2,
              // Borda demarcando a alternativa que o jogador selecionou —
              // permanece visível também durante o reveal verde/vermelho.
              ...(isSelected && {
                border: "3px solid #fff",
                boxShadow: "0 0 0 3px rgba(0,0,0,0.35)",
                "&.Mui-disabled": {
                  border: "3px solid #fff",
                  boxShadow: "0 0 0 3px rgba(0,0,0,0.35)",
                },
              }),
              // Os botões ficam `disabled` durante o reveal (resposta já
              // enviada) — sem o override de "&.Mui-disabled" o tema aplica
              // a opacidade/cor cinza padrão por cima e o verde/vermelho não
              // aparece.
              ...(revealing &&
                (isCorrect
                  ? {
                      bgcolor: "#5bcebf",
                      color: "#fff",
                      "&.Mui-disabled": {
                        bgcolor: "#5bcebf",
                        color: "#fff",
                        ...(isSelected && {
                          border: "3px solid #fff",
                          boxShadow: "0 0 0 3px rgba(0,0,0,0.35)",
                        }),
                      },
                    }
                  : {
                      bgcolor: "#d9434f",
                      color: "#fff",
                      "&.Mui-disabled": {
                        bgcolor: "#d9434f",
                        color: "#fff",
                        ...(isSelected && {
                          border: "3px solid #fff",
                          boxShadow: "0 0 0 3px rgba(0,0,0,0.35)",
                        }),
                      },
                    })),
            }}
            disabled={selectedId != null || !inQuestion || isSpectator}
            onClick={() => onPick(alt.id)}
          >
            <Box
              component="span"
              className="mp-answer-letter"
              sx={{
                flex: "0 0 auto",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 30,
                height: 30,
                mr: 1.5,
                borderRadius: "50%",
                bgcolor: "rgba(255,255,255,0.85)",
                color: "#01416a",
                fontWeight: "bold",
              }}
            >
              {ALTERNATIVE_LETTERS[i]}
            </Box>
            {!hideTexts && <span>{alt.text}</span>}
          </Button>
        );
      })}
    </Box>
  );
});

interface AnswerDistributionChartProps {
  result: NonNullable<UseGameRoom["result"]>;
  /** Alternativas do QuestionView (define a cor de cada barra, igual aos botões). */
  questionAlternatives: AlternativeView[];
}

/**
 * Gráfico de barras estilo Kahoot exibido após cada questão: uma coluna por
 * alternativa, com a mesma cor do botão correspondente, a contagem de
 * jogadores que a marcaram e um check na correta.
 */
function AnswerDistributionChart({
  result,
  questionAlternatives,
}: AnswerDistributionChartProps) {
  const counts = result.alternatives ?? [];
  if (counts.length === 0) return null;
  const maxCount = Math.max(1, ...counts.map((a) => a.count));

  return (
    <Card elevation={2} className="mp-pop" sx={{ mb: 3 }}>
      <CardHeader title="Como a turma respondeu" sx={{ fontWeight: "bold" }} />
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: { xs: 1.5, sm: 3 },
            minHeight: 180,
          }}
        >
          {counts.map((alt, i) => {
            // Mesma cor do botão da alternativa na questão (posição no QuestionView).
            const questionIndex = questionAlternatives.findIndex(
              (a) => a.id === alt.id
            );
            const colorIndex = questionIndex >= 0 ? questionIndex : i;
            const color = ANSWER_COLORS[colorIndex % ANSWER_COLORS.length];
            const barHeight = 24 + (alt.count / maxCount) * 120;
            return (
              <Box
                key={alt.id}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.5,
                  flex: "1 1 0",
                  maxWidth: 120,
                }}
              >
                <Typography sx={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 0.5 }}>
                  {alt.count}
                  {alt.correct && <BsCheckLg color="#2e7d32" aria-label="alternativa correta" />}
                </Typography>
                <Box
                  sx={{
                    width: "100%",
                    height: barHeight,
                    borderRadius: "6px 6px 0 0",
                    bgcolor: `${color}.main`,
                    transition: "height 0.4s ease",
                    ...(alt.correct && { outline: "3px solid #2e7d32" }),
                  }}
                />
                <Box
                  sx={{
                    width: "100%",
                    px: 0.75,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: `${color}.main`,
                    color: "#fff",
                    fontSize: "1em",
                    fontWeight: "bold",
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.5,
                  }}
                >
                  {/* Só a letra da alternativa (A, B, C...) para leitura rápida. */}
                  <span>{ALTERNATIVE_LETTERS[colorIndex] ?? ""}</span>
                  {alt.correct && <BsCheckLg aria-hidden />}
                </Box>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}

const GamePlay = ({ room }: GamePlayProps) => {
  const { question, result, state } = room;
  const inQuestion = state!.status === "IN_QUESTION";

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(() => question?.timeSeconds ?? 0);
  const [revealing, setRevealing] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; color: string } | null>(
    null
  );
  // Entre questões (estilo Kahoot): primeiro o gráfico de respostas, depois o
  // placar — a troca é local em cada tela (o líder tem os botões de avanço).
  const [betweenView, setBetweenView] = useState<"chart" | "scoreboard">("chart");
  // Modal de prévia da próxima questão (só o líder, ao clicar no olho).
  const [showNextPreview, setShowNextPreview] = useState(false);

  // Reinicia a seleção e o cronômetro (com o tempo cheio) a cada nova questão,
  // evitando o frame inicial em "0s" antes do primeiro tick assíncrono.
  useEffect(() => {
    setSelectedId(null);
    setBetweenView("chart");
    setShowNextPreview(false);
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
      playSound(isCorrect ? correctSoundFile : errorSoundFile);
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
  const isEliminated = Boolean(me?.eliminated);
  const soloPlayer = state!.players.length === 1;
  // O líder joga quando está sozinho ou quando o modo "criador participa"
  // (hostPlays) está ativo — inclusive nas salas de torneio. Caso contrário é
  // apresentador (espectador): não responde nem pontua.
  const hostPlays = Boolean(state!.config.hostPlays);
  const isHostSpectator = Boolean(me?.host) && !hostPlays && !soloPlayer;
  const iPlay = !isHostSpectator;
  const isSpectator =
    isHostSpectator || (isTeamMode && Boolean(me?.teamId) && !me?.captain) || isEliminated;

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

  // Avanço manual pelo líder nas salas normais (HOST). Nas salas de torneio
  // (AUTO) as questões avançam sozinhas por tempo — sem controles de líder.
  const canAdvance =
    state!.status === "BETWEEN" &&
    result != null &&
    room.isHost &&
    state!.config.advanceMode === "HOST";
  // Prévia da próxima questão (backend só envia entre questões e havendo próxima).
  const nextPreview = state!.nextQuestion;
  const hasNext = Boolean(nextPreview);
  const skippedCount = state!.skippedCount;

  // Atalhos de teclado: 1-6 escolhem a alternativa, espaço avança a questão (host).
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code === "Space" && canAdvance) {
        e.preventDefault();
        room.next();
        return;
      }
      const index = Number(e.key) - 1;
      if (Number.isNaN(index) || !question) return;
      const alt = question.alternatives[index];
      if (alt) pick(alt.id);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [canAdvance, question, pick, room]);

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
          // Os botões flutuantes de tela cheia/modo TV ficam no topo esquerdo em
          // posição absoluta. No mobile e no tablet (até ~1199px) a Container é
          // quase full-width e não sobra margem lateral, então eles cobrem o
          // "Questão X de N" — empurra a linha pra baixo até lg (desktop), onde
          // a Container centraliza e sobra espaço à esquerda.
          mt: { xs: 6, lg: 0 },
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography color="text.secondary">
          Questão {question.index + 1} de {question.total}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {me && iPlay && (
            <Typography
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                fontWeight: "bold",
                color: "warning.main",
              }}
            >
              <BsStarFill aria-hidden /> {me.score} pts
            </Typography>
          )}
          {inQuestion && (
            <span className={`fw-bold fs-5 mp-timer ${remaining <= 5 ? "low" : ""}`}>
              {remaining}s
            </span>
          )}
        </Box>
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
              {isEliminated
                ? "Você foi eliminado — acompanhe o restante da partida como espectador."
                : isHostSpectator
                  ? "Você está apresentando — os jogadores estão respondendo."
                  : "Seu capitão está respondendo..."}
            </Typography>
          )}
          {inQuestion && !isSpectator && selectedId != null && (
            <Typography align="center" color="text.secondary" sx={{ mt: 3 }}>
              Resposta enviada. Aguardando os demais...
            </Typography>
          )}
        </>
      )}

      {showScoreboardOnly && betweenView === "chart" && (
        <Box sx={{ mt: 4 }}>
          <AnswerDistributionChart
            result={result!}
            questionAlternatives={question.alternatives}
          />
          <Button
            fullWidth
            variant="contained"
            color="info"
            onClick={() => setBetweenView("scoreboard")}
          >
            Exibir placar
          </Button>
        </Box>
      )}

      {showScoreboardOnly && betweenView === "scoreboard" && (
        <Box sx={{ mt: 4 }}>
          {/* Jogadores (não-líder): avisa quando o líder pulou questões. */}
          {!room.isHost && skippedCount > 0 && (
            <Typography
              align="center"
              sx={{ mb: 2, color: "#fff", fontWeight: "bold" }}
            >
              O líder pulou {skippedCount}{" "}
              {skippedCount === 1 ? "questão" : "questões"} — aguarde a próxima.
            </Typography>
          )}
          {canAdvance && hasNext && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                mb: 1,
                flexWrap: "wrap",
              }}
            >
              <Typography sx={{ color: "#fff", fontWeight: "bold" }}>
                Próxima questão: {nextPreview!.title}
              </Typography>
              <Tooltip title="Pré-visualizar a próxima questão">
                <IconButton
                  size="small"
                  onClick={() => setShowNextPreview(true)}
                  sx={{ color: "#fff" }}
                  aria-label="Pré-visualizar próxima questão"
                >
                  <BsEyeFill />
                </IconButton>
              </Tooltip>
            </Box>
          )}
          {canAdvance && (
            <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                color="success"
                onClick={room.next}
                sx={{ flex: "2 1 200px" }}
              >
                {hasNext ? "Próxima questão" : "Ver resultado final"}
              </Button>
              {hasNext && (
                <Button
                  variant="contained"
                  color="warning"
                  startIcon={<BsSkipForwardFill />}
                  onClick={room.skip}
                  sx={{ flex: "1 1 160px" }}
                >
                  Pular questão
                </Button>
              )}
            </Box>
          )}
          <Button
            size="small"
            variant="outlined"
            startIcon={<BsBarChartFill />}
            onClick={() => setBetweenView("chart")}
            sx={{ mb: 2, color: "#fff", borderColor: "rgba(255,255,255,0.7)" }}
          >
            Ver gráfico de respostas
          </Button>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "flex-start",
            }}
          >
            <Card
              elevation={2}
              className="mp-pop"
              sx={{ flex: "2 1 320px", minWidth: 280 }}
            >
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
                    className={bannerClassName(p.banner)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      opacity: p.eliminated ? 0.5 : 1,
                      borderRadius: 1,
                      px: 0.5,
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      {i < 3 ? (
                        <span className={`mp-rank-icon mp-rank-${i + 1}`}>
                          {i + 1}
                        </span>
                      ) : (
                        <span style={{ marginRight: 10 }}>{i + 1}.</span>
                      )}
                      {p.avatar && (
                        <FramedAvatar code={p.frame} size={26}>
                          <span style={{ fontSize: "0.9em" }}>{p.avatar}</span>
                        </FramedAvatar>
                      )}
                      <span style={{ textDecoration: p.eliminated ? "line-through" : "none" }}>
                        {p.name}
                      </span>
                      <TitleBadge code={p.title} />
                      {p.id === room.playerId && " (você)"}
                      {p.eliminated && (
                        <span style={{ marginLeft: 6, fontSize: "0.8em" }}>💀</span>
                      )}
                    </span>
                    <strong>{p.score}</strong>
                  </Box>
                ))}
              </CardContent>
            </Card>

            {room.isHost && isFunMode && !result!.lastQuestion && (
              <Card
                elevation={2}
                className="mp-pop"
                sx={{ flex: "1 1 240px", minWidth: 240 }}
              >
                <CardHeader title="Poderes" sx={{ fontWeight: "bold" }} />
                <CardContent>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Ativar poder pra próxima questão:
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {(Object.keys(QUESTION_POWER_LABELS) as QuestionPower[]).map((power) => {
                      const { icon: PowerIcon, color } = POWER_STYLE[power];
                      return (
                        <Button
                          key={power}
                          fullWidth
                          size="small"
                          startIcon={<PowerIcon />}
                          variant={state!.pendingPowerUp === power ? "contained" : "outlined"}
                          color={color}
                          sx={{ justifyContent: "flex-start" }}
                          onClick={() =>
                            room.setPower(state!.pendingPowerUp === power ? null : power)
                          }
                        >
                          {QUESTION_POWER_LABELS[power]}
                        </Button>
                      );
                    })}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>
      )}

      {/* Prévia da próxima questão — só o líder abre pelo olho; os jogadores
          nunca veem a questão até o líder clicar em "Próxima questão". */}
      {nextPreview && (
        <Dialog
          open={showNextPreview}
          onClose={() => setShowNextPreview(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Próxima questão (prévia)</DialogTitle>
          <DialogContent>
            <Typography variant="h6" align="center" sx={{ mb: 2 }}>
              {nextPreview.title}
            </Typography>
            {(() => {
              const previewImages = getOrderedQuestionImages({
                imageUrl: nextPreview.imageUrl,
                imageOneUrl: nextPreview.imageOneUrl,
                imageTwoUrl: nextPreview.imageTwoUrl,
                imagesOrder: nextPreview.imagesOrder,
              } as QuestionModel);
              return (
                previewImages.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mb: 2,
                      height: 220,
                    }}
                  >
                    <QuestionImageGallery images={previewImages} />
                  </Box>
                )
              );
            })()}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {nextPreview.alternatives.map((alt, i) => (
                <Card key={alt.id} variant="outlined">
                  <CardContent
                    sx={{ display: "flex", alignItems: "center", gap: 1, py: 1.5 }}
                  >
                    <strong>{ALTERNATIVE_LETTERS[i]}</strong>
                    <span>{alt.text}</span>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </DialogContent>
        </Dialog>
      )}
      </Container>
    </div>
  );
};

export default GamePlay;
