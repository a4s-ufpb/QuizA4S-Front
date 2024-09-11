import { BsCaretRightSquareFill } from "react-icons/bs";
import QuestionBoxComponent from "../questionBoxComponent/QuestionBoxComponent";
import "./QuestionListComponent.css";
import { useState, useEffect } from "react";
import { DEFAULT_IMG } from "../../vite-env";

function QuestionListComponent({ questions, setCallback }) {
  const [showQuestionBox, setQuestionBox] = useState(false);
  const [questionData, setQuestionData] = useState({});
  const [isVisible, setIsVisible] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 1360);

  useEffect(() => {
    function handleResize() {
      setIsSmallScreen(window.innerWidth <= 1360);
      if (window.innerWidth > 1360) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        <div className="question-list-icon" onClick={toggleVisibility}>
          <BsCaretRightSquareFill/>
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

                {!question.imageUrl && <img src={DEFAULT_IMG} width={55} height={55}/>}

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

          {showQuestionBox && (
            <QuestionBoxComponent
              setQuestionBox={setQuestionBox}
              question={questionData}
              setCallback={setCallback}
            />
          )}
        </div>
      )}
    </>
  );
}

export default QuestionListComponent;