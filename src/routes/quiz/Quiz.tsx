import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BsArrowsFullscreen, BsFullscreenExit } from "react-icons/bs";
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

// CSS
import "./Quiz.css";

const Quiz = () => {
  // Instanciados uma única vez (não a cada render) via ref com lazy-init.
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
  const token = localStorage.getItem("token");

  const [quizFinished, setQuizFinished] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { id: themeId } = useParams();

  const questionsQuery = useTop10QuestionsForPlayQuery(themeId ?? "");
  const loading = questionsQuery.isLoading;

  const currentQuestion = questions[currentQuestionIndex];

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
      // Tenta iniciar em tela cheia (pode ser bloqueado sem gesto do usuário;
      // nesse caso o botão no canto superior esquerdo permite ativar).
      containerRef.current?.requestFullscreen?.().catch(() => {});
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

  // Sai da tela cheia ao exibir o modal de pontuação final.
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

    // Borda demarcando qual alternativa o jogador marcou (some junto com o
    // reset ao carregar a próxima questão).
    event.currentTarget.classList.add("alternative-selected");

    if (isCorrect) {
      event.currentTarget.classList.add("correct-answer");
      setScore(score + 1);
      setFeedbackMessage("Parabéns, você acertou!");
      setFeedbackColor("green");
      // Play correct sound
      if (!getSoundMuted() && correctSoundRef.current) {
        correctSoundRef.current.volume = getSoundVolume();
        correctSoundRef.current.play().catch((error) => {
          console.error("Error playing correct sound:", error);
        });
      }
    } else {
      event.currentTarget.classList.add("wrong-answer");
      setFeedbackMessage("Que pena, você errou!");
      setFeedbackColor("red");
      // Play error sound
      if (!getSoundMuted() && errorSoundRef.current) {
        errorSoundRef.current.volume = getSoundVolume();
        errorSoundRef.current.play().catch((error) => {
          console.error("Error playing error sound:", error);
        });
      }
    }

    setShowFeedback(true);

    // Pausa maior (era 2s) pro jogador ver com calma se acertou/errou e qual
    // era a alternativa correta antes de avançar.
    setTimeout(() => {
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
    }, 3500);

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

  function incrementTime() {
    setTimeout(() => {
      setTime(time + 1);
    }, 1000);
  }

  return (
    <div className="container-quiz-external" ref={containerRef}>
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

      {!quizFinished ? (incrementTime(), null) : null}

      {quizFinished && (
        <QuestionFinished
          percentage={Number(((score / questions.length) * 100).toFixed(0))}
          restart={restart}
          score={score}
          time={time}
          total={questions.length}
        />
      )}
    </div>
  );
};

export default Quiz;
