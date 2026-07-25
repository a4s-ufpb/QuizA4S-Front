import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BsArrowsFullscreen, BsFullscreenExit, BsArrowLeft, BsLightbulbFill } from "react-icons/bs";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  Divider,
} from "@mui/material";
import Question from "../../components/question/Question";
import InformationBox from "../../components/informationBox/InformationBox";
import Loading from "../../components/loading/Loading";
import QuestionFinished from "../../components/quizFinished/QuizFinished";
import { useTop10QuestionsForPlayQuery } from "../../query/useQuestionQueries";
import { useInsertResponseMutation } from "../../query/useResponseQueries";
import FeedbackBox from "../../components/feedbackBox/FeedbackBox";
import { getStoredUser, getStoredTheme } from "../../util/storage";
import { addMatchHistoryEntry } from "../../util/matchHistory";
import { useRecordMatchMutation } from "../../query/useMatchHistoryQueries";
import type { QuizQuestion } from "../../types";

import correctSoundFile from "../../assets/sounds/alternative-success.mp3";
import errorSoundFile from "../../assets/sounds/alternative-error.mp3";
import { getSoundMuted, getSoundVolume } from "../../util/sound";
import { APP_TOKEN_KEY } from "../../util/token";

import "./Quiz.css";

const Quiz = () => {
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const errorSoundRef = useRef<HTMLAudioElement | null>(null);
  if (!correctSoundRef.current) correctSoundRef.current = new Audio(correctSoundFile);
  if (!errorSoundRef.current) errorSoundRef.current = new Audio(errorSoundFile);

  const insertResponseMutation = useInsertResponseMutation();
  const recordMatchMutation = useRecordMatchMutation();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);

  const [informationAlert, setInformationAlert] = useState(false);
  const [textAlert, setTextAlert] = useState("");

  const navigate = useNavigate();

  const user = getStoredUser();
  const token = localStorage.getItem(APP_TOKEN_KEY);

  const [quizFinished, setQuizFinished] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { id: themeId } = useParams();

  const questionsQuery = useTop10QuestionsForPlayQuery(themeId ?? "");
  const loading = questionsQuery.isLoading;

  const currentQuestion = questions[currentQuestionIndex];

  const showExplanation = (() => {
    const s = localStorage.getItem("quiz:showExplanation");
    return s === null ? true : s === "true";
  })();

  useEffect(() => {
    if (!questionsQuery.data) return;

    if (!questionsQuery.data.success) {
      setTextAlert(questionsQuery.data.message);
      setInformationAlert(true);
      return;
    }

    setQuestions(questionsQuery.data.data);

    if (questionsQuery.data.data.length < 5) {
      setTextAlert("Cadastre no mínimo 5 questões para jogar esse quiz");
      setInformationAlert(true);
    } else {
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      if (!isMobile) {
        containerRef.current?.requestFullscreen?.().catch(() => {});
      }
    }
  }, [questionsQuery.data]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (quizFinished && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, [quizFinished]);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  const [clickEnabled, setClickEnabled] = useState(true);

  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackColor, setFeedbackColor] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  const [explanationModal, setExplanationModal] = useState<{
    open: boolean;
    text: string;
    onContinue: () => void;
  }>({ open: false, text: "", onContinue: () => {} });
  const [timerPaused, setTimerPaused] = useState(false);

  function handleAnswerClick(
    event: MouseEvent<HTMLLIElement>,
    alternativeId: number | undefined,
    questionId: number
  ) {
    setClickEnabled(false);

    const isCorrect = isAlternativeCorrect(event);
    const alternatives = (event.currentTarget.parentNode as HTMLElement)
      .childNodes;

    const green = "#5bcebf";
    const red = "#d9434f";
    const white = "#fff";

    alternatives.forEach((node) => {
      const alt = node as HTMLElement;
      alt.classList.remove("correct-answer", "wrong-answer", "alternative-selected");

      if (alt.getAttribute("value") === "true") {
        alt.style.backgroundColor = green;
        alt.style.color = white;
      } else {
        alt.style.backgroundColor = red;
        alt.style.color = white;
      }
    });

    event.currentTarget.classList.add("alternative-selected");

    if (isCorrect) {
      event.currentTarget.classList.add("correct-answer");
      setScore(score + 1);
      setFeedbackMessage("Parabéns, você acertou!");
      setFeedbackColor("green");
      if (!getSoundMuted() && correctSoundRef.current) {
        correctSoundRef.current.volume = getSoundVolume();
        correctSoundRef.current.play().catch(() => {});
      }
    } else {
      event.currentTarget.classList.add("wrong-answer");
      setFeedbackMessage("Que pena, você errou!");
      setFeedbackColor("red");
      if (!getSoundMuted() && errorSoundRef.current) {
        errorSoundRef.current.volume = getSoundVolume();
        errorSoundRef.current.play().catch(() => {});
      }
    }

    setShowFeedback(true);

    const finalizeAdvance = () => {
      setShowFeedback(false);
      setClickEnabled(true);

      if (currentQuestionIndex === questions.length - 1) {
        setQuizFinished(true);
        const finalScore = isCorrect ? score + 1 : score;
        const matchThemeName = getStoredTheme().name || "Quiz";
        addMatchHistoryEntry({
          mode: "SINGLE_PLAYER",
          themeName: matchThemeName,
          score: finalScore,
          total: questions.length,
        });
        if (token) {
          recordMatchMutation.mutate({
            mode: "SINGLE_PLAYER",
            themeName: matchThemeName,
            score: finalScore,
            total: questions.length,
          });
        }
        return;
      }

      setCurrentQuestionIndex(currentQuestionIndex + 1);
    };

    const wrongWithExplanation =
      !isCorrect && showExplanation && !!currentQuestion?.explanation;

    if (wrongWithExplanation) {
      // Pausa o timer e abre modal com a explicação; só avança ao clicar em Entendi.
      setTimeout(() => {
        setShowFeedback(false);
        setTimerPaused(true);
        setExplanationModal({
          open: true,
          text: currentQuestion.explanation ?? "",
          onContinue: () => {
            setExplanationModal((prev) => ({ ...prev, open: false }));
            setTimerPaused(false);
            finalizeAdvance();
          },
        });
      }, 1500);
    } else {
      setTimeout(finalizeAdvance, 3500);
    }

    if (token) {
      postResponse(user.uuid, questionId, alternativeId as number);
    }
  }

  function isAlternativeCorrect(event: MouseEvent<HTMLLIElement>) {
    return event.currentTarget.getAttribute("value") === "true";
  }

  async function postResponse(
    uuid: string,
    questionId: number,
    alternativeId: number
  ) {
    const response = await insertResponseMutation.mutateAsync({
      idUser: uuid,
      idQuestion: questionId,
      idAlternative: alternativeId,
    });
    if (!response.success) {
      console.log("Usuário está jogando sem salvar suas respostas");
    }
  }

  function restart() {
    navigate("/theme");
  }

  const [time, setTime] = useState(0);

  // Timer único via setInterval, respeitando pausa (explicação) e término do quiz.
  useEffect(() => {
    if (quizFinished || timerPaused || questions.length === 0) return;
    const id = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [quizFinished, timerPaused, questions.length]);

  return (
    <div className="container-quiz-external" ref={containerRef}>
      <button
        type="button"
        className="quiz-back-btn"
        onClick={() => { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); navigate("/theme"); }}
        title="Voltar"
        aria-label="Voltar"
      >
        <BsArrowLeft size={20} />
      </button>
      <button
        type="button"
        className="fullscreen-btn"
        onClick={toggleFullscreen}
        title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
        aria-label={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
      >
        {isFullscreen ? (
          <BsFullscreenExit size={20} />
        ) : (
          <BsArrowsFullscreen size={20} />
        )}
      </button>
      <div className="container-quiz">
        <div className="timer">
          <p>{time}s</p>
        </div>

        {questions.length > 0 && (
          <>
            <Question
              title={currentQuestion.title}
              questionId={currentQuestion.id}
              questionImg={currentQuestion.imageUrl}
              imageOneUrl={currentQuestion.imageOneUrl}
              imageTwoUrl={currentQuestion.imageTwoUrl}
              imagesOrder={currentQuestion.imagesOrder}
              alternatives={currentQuestion.alternatives}
              onAnswerClick={
                clickEnabled ? handleAnswerClick : () => console.log()
              }
              currentQuestion={currentQuestionIndex + 1}
              lastQuestion={questions.length}
            />
            {showFeedback && (
              <FeedbackBox title={feedbackMessage} color={feedbackColor} />
            )}
          </>
        )}
      </div>

      {loading && <Loading />}

      {informationAlert && (
        <InformationBox
          text={textAlert}
          closeBox={restart}
          icon="exclamation"
          color="red"
        />
      )}

      {quizFinished && (
        <QuestionFinished
          percentage={Number(((score / questions.length) * 100).toFixed(0))}
          restart={restart}
          score={score}
          time={time}
          total={questions.length}
        />
      )}

      <Dialog
        open={explanationModal.open}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: "#ffffff",
              borderRadius: 1,
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontWeight: 700,
            color: "primary.main",
          }}
        >
          <BsLightbulbFill size={22} color="#3f7fd6" />
          Aprendendo com o erro
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
            {explanationModal.text}
          </Typography>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            variant="contained"
            onClick={explanationModal.onContinue}
          >
            Entendi
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Quiz;
