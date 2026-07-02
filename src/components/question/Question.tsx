import type { MouseEvent } from "react";
import "./Question.css";
import type { Alternative, Question as QuestionModel } from "../../types";
import QuestionImageGallery from "../questionImageGallery/QuestionImageGallery";
import { getOrderedQuestionImages } from "../../util/questionImages";

interface QuestionProps {
  title: string;
  questionId: number;
  questionImg?: string;
  imageBase64One?: string;
  imageBase64Two?: string;
  imagesOrder?: string;
  creatorId?: string;
  alternatives?: Alternative[];
  onAnswerClick: (
    e: MouseEvent<HTMLLIElement>,
    alternativeId: number | undefined,
    questionId: number,
    creatorId?: string
  ) => void;
  currentQuestion: number;
  lastQuestion: number;
}

const Question = ({
  title,
  questionId,
  questionImg,
  imageBase64One,
  imageBase64Two,
  imagesOrder,
  creatorId,
  alternatives,
  onAnswerClick,
  currentQuestion,
  lastQuestion,
}: QuestionProps) => {
  const alternativeList = ["A", "B", "C", "D", "E", "F"];

  const images = getOrderedQuestionImages({
    imageUrl: questionImg,
    imageBase64One,
    imageBase64Two,
    imagesOrder,
  } as QuestionModel);

  return (
    <div className="question">
      <div className="question-header">
        <p className="question-number">
          Questão {currentQuestion} de {lastQuestion}
        </p>
        <h1 className="question-title">{title}</h1>
        <QuestionImageGallery images={images} className="question-image" />
      </div>

      <ul className="alternatives">
        {alternatives &&
          alternatives.map((alternative, index) => (
            <li
              key={alternative.id}
              value={String(alternative.correct)}
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
