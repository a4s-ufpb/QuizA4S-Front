import { useEffect, useState } from "react";
import "./Question.css";

const Question = ({
  title,
  questionId,
  questionImg,
  creatorId,
  alternatives,
  onAnswerClick,
  currentQuestion,
  lastQuestion,
}) => {
  const alternativeList = ["A", "B", "C", "D"];
  const [isImageValid, setImageValid] = useState(false);

  useEffect(() => {
    if (
      questionImg == "" ||
      questionImg == null ||
      questionImg == undefined
    ) {
      setImageValid(false);
      return;
    }

    setImageValid(true);
  }, [questionImg]);

  return (
    <div className="question">
      <div className="question-header">
        <p className="question-number">
          Questão {currentQuestion} de {lastQuestion}
        </p>
        <h1 className="question-title">{title}</h1>
        {isImageValid && (
          <img
            src={questionImg}
            className="question-image"
            loading="lazy"
            width={300}
            height={300}
          />
        )}
      </div>

      <ul className="alternatives">
        {alternatives &&
          alternatives.map((alternative, index) => (
            <li
              key={alternative.id}
              value={alternative.correct}
              onClick={(e) =>
                onAnswerClick(e, alternative.id, questionId, creatorId)
              }
            >
              <span>{alternativeList[index]}</span>
              <p>{alternative.text}</p>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default Question;
