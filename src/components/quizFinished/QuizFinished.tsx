import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  LinearProgress,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  BsTrophyFill,
  BsClockFill,
  BsCheckCircleFill,
  BsStars,
  BsChatDotsFill,
  BsShareFill,
  BsArrowLeft,
} from "react-icons/bs";
import Loading from "../loading/Loading";
import Ranking from "../ranking/Ranking";
import ConfirmBox from "../confirmBox/ConfirmBox";
import ThemeFeedbackModal from "../feedback/ThemeFeedbackModal";
import "./QuizFinished.css";
import { useInsertScoreMutation } from "../../query/useScoreQueries";
import { useNavigate } from "react-router-dom";
import InformationBox from "../informationBox/InformationBox";
import { HIT_VALUE, REDUCE_VALUE, MIN_VALUE_PER_HIT } from "../../vite-env";
import { useInsertStatisticMutation } from "../../query/useStatisticQueries";
import { getStoredTheme, getStoredUser } from "../../util/storage";
import { generateResultImage, downloadImage } from "../../util/shareImage";
import { APP_TOKEN_KEY } from "../../util/token";
import type { ScoreRequest, StatisticRequest } from "../../types";

interface QuizFinishedProps {
  percentage: number;
  restart: () => void;
  score: number;
  time: number;
  total: number;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function feedbackMessage(pct: number) {
  if (pct === 100) return { title: "Impecável!", text: "Pontuação máxima! Você é um verdadeiro mestre neste assunto." };
  if (pct > 60) return { title: "Muito bom!", text: "Impressionante — mais um passo e chega à perfeição." };
  if (pct > 30) return { title: "Bom trabalho!", text: "Você está indo bem. Um pouco mais de prática e domina o quiz." };
  return { title: "Não desanime!", text: "Cada erro é uma oportunidade de aprender algo novo." };
}

const QuizFinished = ({
  percentage,
  restart,
  score,
  time,
  total,
}: QuizFinishedProps) => {
  const insertScoreMutation = useInsertScoreMutation();
  const insertStatisticMutation = useInsertStatisticMutation();

  const [loading, setLoading] = useState(false);
  const [confirmBox, setConfirmBox] = useState(false);
  const [informationBox, setInformationBox] = useState(false);
  const isAuth = localStorage.getItem(APP_TOKEN_KEY);

  const [activeRanking, setActiveRanking] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const navigate = useNavigate();
  const storedTheme = getStoredTheme();

  // Guard contra double-run em React StrictMode (dev) que causava statistic salva 2x.
  const statisticSentRef = useRef(false);
  useEffect(() => {
    if (statisticSentRef.current) return;
    if (!isLoggedUser()) return;
    statisticSentRef.current = true;
    const user = getStoredUser();
    const theme = getStoredTheme();
    const statistic: StatisticRequest = {
      studentName: user.name,
      themeName: theme.name,
      percentagemOfHits: percentage,
      gameMode: "SINGLE_PLAYER",
    };
    saveStatistic(statistic);
  }, []);

  function saveStatistic(statistic: StatisticRequest) {
    try {
      setLoading(true);
      insertStatisticMutation.mutate({
        statistic,
        studentUuid: getStoredUser().uuid || undefined,
      });
    } catch (error) {
      console.error(error);
      setInformationBox(true);
      return;
    } finally {
      setLoading(false);
    }
  }

  function calculateResult(): string {
    const raw = score * HIT_VALUE - time * REDUCE_VALUE;
    const floor = score * MIN_VALUE_PER_HIT;
    return Math.max(raw, floor).toFixed(2);
  }

  const scoreRequest: ScoreRequest = {
    numberOfHits: score,
    totalTime: time,
  };

  async function saveResult() {
    let userId = "";
    let themeId = 0;

    if (isLoggedUser()) {
      userId = getStoredUser().uuid;
      themeId = getStoredTheme().id;
    }

    setConfirmBox(false);
    setLoading(true);
    const scoreResponse = await insertScoreMutation.mutateAsync({
      score: scoreRequest,
      userId,
      themeId,
    });
    setLoading(false);

    if (scoreResponse.success) {
      setActiveRanking(true);
      return;
    }
    setInformationBox(true);
  }

  function isLoggedUser(): boolean {
    const user = getStoredUser();
    const theme = getStoredTheme();
    return Boolean(user.uuid && theme.id);
  }

  function closeBox() {
    setConfirmBox(false);
    navigate("/theme");
  }

  function handleShare() {
    const theme = getStoredTheme();
    const user = getStoredUser();
    const dataUrl = generateResultImage({
      themeName: theme.name || "Quiz",
      playerName: user.name || "Jogador",
      score,
      total,
    });
    downloadImage(dataUrl, "quiz-a4s-resultado.png");
  }

  const msg = feedbackMessage(percentage);
  const finalPoints = calculateResult();
  // Cor do medalhão baseada na performance, mas dentro da paleta do projeto.
  const medalColor =
    percentage === 100
      ? "#ffb300"
      : percentage > 60
        ? "#3f7fd6"
        : percentage > 30
          ? "#5bcebf"
          : "#607d8b";

  return (
    <>
      <Dialog
        open
        fullWidth
        maxWidth="md"
        slotProps={{
          paper: {
            sx: {
              bgcolor: "#ffffff",
              borderRadius: 1,
            },
          },
        }}
      >
        <DialogTitle sx={{ py: 3, textAlign: "center" }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 1.5 }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                bgcolor: medalColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "3px solid #fff",
                boxShadow: 3,
              }}
            >
              <BsTrophyFill size={34} color="#fff" />
            </Box>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
            Quiz Finalizado!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {msg.title}
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ py: 3 }}>
          <Stack direction="row" spacing={1} sx={{ justifyContent: "center", mb: 3, flexWrap: "wrap", rowGap: 1 }}>
            {isAuth && (
              <Chip
                icon={<BsStars />}
                label={`Pontuação: ${finalPoints}`}
                color="warning"
                variant="outlined"
              />
            )}
            <Chip
              icon={<BsClockFill />}
              label={`Tempo: ${formatTime(time)}`}
              variant="outlined"
            />
            <Chip
              icon={<BsCheckCircleFill />}
              label={`Acertos: ${score}/${total}`}
              color="success"
              variant="outlined"
            />
          </Stack>

          <Box sx={{ mb: 3 }}>
            <Stack direction="row" sx={{ justifyContent: "space-between", mb: 0.75 }}>
              <Typography variant="caption" color="text.secondary">
                Aproveitamento
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                {percentage}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{
                height: 10,
                borderRadius: 1,
              }}
            />
          </Box>

          <Typography sx={{ textAlign: "center", color: "text.secondary" }}>
            {msg.text}
          </Typography>
        </DialogContent>
        <Divider />
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            flexWrap: "wrap",
            gap: 1,
            justifyContent: { xs: "center", sm: "flex-end" },
            "& > :not(style) ~ :not(style)": { ml: 0 },
          }}
        >
          <Tooltip title="Voltar para a tela de temas">
            <Button
              variant="outlined"
              startIcon={<BsArrowLeft />}
              onClick={restart}
            >
              Voltar
            </Button>
          </Tooltip>
          <Tooltip title="Baixar imagem do resultado para compartilhar">
            <Button
              variant="outlined"
              startIcon={<BsShareFill />}
              onClick={handleShare}
            >
              Compartilhar
            </Button>
          </Tooltip>
          {isAuth && storedTheme?.id && (
            <Tooltip title="Enviar feedback ao criador deste tema">
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<BsChatDotsFill />}
                onClick={() => setFeedbackOpen(true)}
              >
                Feedback
              </Button>
            </Tooltip>
          )}
          {isAuth && (
            <Tooltip title="Salvar sua pontuação e ver o ranking deste tema">
              <Button
                variant="contained"
                startIcon={<BsTrophyFill />}
                onClick={() => setConfirmBox(true)}
              >
                Ranking
              </Button>
            </Tooltip>
          )}
        </DialogActions>
      </Dialog>

      {activeRanking && (
        <Ranking navigatePath={"/theme"} setShowRanking={setActiveRanking} />
      )}

      {feedbackOpen && storedTheme?.id && (
        <ThemeFeedbackModal
          themeId={storedTheme.id}
          themeName={storedTheme.name}
          allowCreate
          onClose={() => setFeedbackOpen(false)}
        />
      )}

      {loading && <Loading />}

      {confirmBox && (
        <ConfirmBox
          title="Deseja salvar sua pontuação?"
          textBtn1="Sim"
          textBtn2="Não, voltar"
          onClickBtn1={saveResult}
          onClickBtn2={closeBox}
          onDismiss={() => setConfirmBox(false)}
        />
      )}

      {informationBox && (
        <InformationBox
          text="Tente novamente mais tarde!"
          closeBox={() => setInformationBox(false)}
          color="red"
          icon="exclamation"
        />
      )}
    </>
  );
};

export default QuizFinished;
