import QuestionBoxComponent from "../questionBoxComponent/QuestionBoxComponent";
import "./QuestionListComponent.css";
import { useState } from "react";

function QuestionListComponent({ questions, setCallback }) {
  const [showQuestionBox, setQuestionBox] = useState(false);

  const [questionData, setQuestionData] = useState({});

  function activeQuestionBox(question) {
    setQuestionData(question);
    setQuestionBox(true);
  }

  return (
    <div className="container-question-list">
      <h3>Questões</h3>
      {questions &&
        questions.map((question) => (
          <div key={question.id} className="question-list-data" onClick={() => activeQuestionBox(question)}>
            <p>{question.title}</p>
            {question.imageUrl && (
              <img src={question.imageUrl} width={55} height={55} />
            )}

            {!question.imageUrl && <div className="default-image"></div>}

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

      {showQuestionBox && <QuestionBoxComponent setQuestionBox={setQuestionBox} question={questionData} setCallback={setCallback}/>}
    </div>
  );
}

export default QuestionListComponent;
