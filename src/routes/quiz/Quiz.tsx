import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BsArrowsFullscreen, BsFullscreenExit } from "react-icons/bs";
import Question from "../../components/question/Question";
import InformationBox from "../../components/informationBox/InformationBox";
import Loading from "../../components/loading/Loading";
import QuestionFinished from "../../components/quizFinished/QuizFinished";
import { useTop10QuestionsByThemeQuery } from "../../query/useQuestionQueries";
import { useInsertResponseMutation } from "../../query/useResponseQueries";
import FeedbackBox from "../../components/feedbackBox/FeedbackBox";
import { getStoredUser } from "../../util/storage";
import type { Question as QuestionModel } from "../../types";

import correctSoundFile from "../../assets/sounds/alternative-success.mp3";
import errorSoundFile from "../../assets/sounds/alternative-error.mp3";

// CSS
import "./Quiz.css";

const Quiz = () => {
  // Audio files
  const correctSound = new Audio(correctSoundFile);
  const errorSound = new Audio(errorSoundFile);

  const insertResponseMutation = useInsertResponseMutation();

  const [questions, setQuestions] = useState<QuestionModel[]>([]);
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

  const questionsQuery = useTop10QuestionsByThemeQuery(themeId ?? "");
  const loading = questionsQuery.isLoading;

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
      alt.classList.remove("correct-answer", "wrong-answer");

      if (alt.getAttribute("value") === "true") {
        alt.style.backgroundColor = green;
        alt.style.color = white;
      } else {
        alt.style.backgroundColor = red;
        alt.style.color = white;
      }
    });

    if (isCorrect) {
      event.currentTarget.classList.add("correct-answer");
      setScore(score + 1);
      setFeedbackMessage("Parabéns, você acertou!");
      setFeedbackColor("green");
      // Play correct sound
      correctSound.play().catch((error) => {
        console.error("Error playing correct sound:", error);
      });
    } else {
      event.currentTarget.classList.add("wrong-answer");
      setFeedbackMessage("Que pena, você errou!");
      setFeedbackColor("red");
      // Play error sound
      errorSound.play().catch((error) => {
        console.error("Error playing error sound:", error);
      });
    }

    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
      setClickEnabled(true);

      if (currentQuestionIndex === questions.length - 1) {
        setQuizFinished(true);
        return;
      }

      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }, 2000);

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
              title={questions[currentQuestionIndex].title}
              questionId={questions[currentQuestionIndex].id}
              questionImg={questions[currentQuestionIndex].imageUrl}
              imageBase64One={questions[currentQuestionIndex].imageBase64One}
              imageBase64Two={questions[currentQuestionIndex].imageBase64Two}
              imagesOrder={questions[currentQuestionIndex].imagesOrder}
              creatorId={questions[currentQuestionIndex].creatorId}
              alternatives={questions[currentQuestionIndex].alternatives}
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
        />
      )}
    </div>
  );
};

export default Quiz;
