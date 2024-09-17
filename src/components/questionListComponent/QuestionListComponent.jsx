import { BsCaretRightSquareFill } from "react-icons/bs";
import QuestionBoxComponent from "../questionBoxComponent/QuestionBoxComponent";
import { useState, useEffect } from "react";
import { DEFAULT_IMG } from "../../vite-env";
import { QuestionService } from "../../service/QuestionService";
import InformationBox from "../informationBox/InformationBox";
import Loading from "../loading/Loading";

import "./QuestionListComponent.css";

function QuestionListComponent() {
  const [showQuestionBox, setQuestionBox] = useState(false);
  const [questionData, setQuestionData] = useState({});
  const [isVisible, setIsVisible] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 1360);

  const [questions, setQuestions] = useState([]);

  const idTheme = JSON.parse(localStorage.getItem("theme")).id;

  const [loading, setLoading] = useState(false);
  const [informationBox, setInformationBox] = useState(false);
  const [informationBoxData, setInformationBoxData] = useState({
    text: "",
    color: "red",
    icon: "exclamation",
  });

  const questionService = new QuestionService();

  const [callback, setCallback] = useState({});

  useEffect(() => {
    fetchData();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [callback]);

  async function fetchData() {
    try {
      setLoading(true);
      const questionResponse = await questionService.findAllQuestionsByTheme(idTheme);

      if (!questionResponse.success) {
        activeInformationBox(true, questionResponse.message);
        return;
      }

      setQuestions(questionResponse.data);
    } catch (error) {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }

  function activeInformationBox(isFail, message) {
    if (isFail) {
      setInformationBoxData((prevData) => {
        return {
          ...prevData,
          text: message,
          color: "red",
          icon: "exclamation",
        };
      });
      setInformationBox(true);
    } else {
      setInformationBoxData((prevData) => {
        return { ...prevData, text: message, color: "green", icon: "check" };
      });
      setInformationBox(true);
    }
  }

  function handleResize() {
    setIsSmallScreen(window.innerWidth <= 1360);
    if (window.innerWidth > 1360) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }

  function activeQuestionBox(question) {
    setQuestionData(question);
    setQuestionBox(true);
  }

  function toggleVisibility() {
    setIsVisible(!isVisible);
  }

  return (
    <>
      {isSmallScreen && (
        <div className={`question-list-icon ${isVisible ? "move-right" : ""}`} onClick={toggleVisibility}>
          <BsCaretRightSquareFill />
        </div>
      )}

      {isVisible && (
        <div className="container-question-list">
          <h3>Questões</h3>
          {questions &&
            questions.map((question) => (
              <div
                key={question.id}
                className="question-list-data"
                onClick={() => activeQuestionBox(question)}
              >
                <p>{question.title}</p>
                {question.imageUrl && (
                  <img src={question.imageUrl} width={55} height={55} />
                )}

                {!question.imageUrl && (
                  <img src={DEFAULT_IMG} width={55} height={55} />
                )}

                <div className="container-question-list-alternatives">
                  {question.alternatives &&
                    question.alternatives.map((alternative) => (
                      <span
                        key={alternative.id}
                        className={`question-list-alternatives ${
                          alternative.correct ? "question-correct" : ""
                        }`}
                      ></span>
                    ))}
                </div>
              </div>
            ))}

          {loading && <Loading />}
          {showQuestionBox && (
            <QuestionBoxComponent
              setQuestionBox={setQuestionBox}
              question={questionData}
              setQuestion={setQuestionData}
              setCallback={setCallback}
            />
          )}

          {informationBox && (
            <InformationBox
              closeBox={() => setInformationBox(false)}
              color={informationBoxData.color}
              text={informationBoxData.text}
              icon={informationBoxData.icon}
            />
          )}
        </div>
      )}
    </>
  );
}

export default QuestionListComponent;