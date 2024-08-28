import "./QuestionBoxComponent.css";
import { useState } from "react";
import UpdateBox from "../../components/updateBox/UpdateBox";
import Loading from "../../components/loading/Loading";
import InformationBox from "../../components/informationBox/InformationBox";
import { AlternativeService } from "./../../service/AlternativeService";
import { QuestionService } from "./../../service/QuestionService";
import { BsTrash } from "react-icons/bs";
import ConfirmBox from "../confirmBox/ConfirmBox";

function QuestionBoxComponent({ setQuestionBox, question, setCallback }) {
  const alternativeService = new AlternativeService();
  const questionService = new QuestionService();
  const alternativesList = ["A", "B", "C", "D"];

  const [newResponse, setResponse] = useState("");
  const [alternativeId, setAlternativeId] = useState(0);

  const [loading, setLoading] = useState(false);
  const [isUpdateAlternative, setUpdateBoxAlternative] = useState(false);
  const [isUpdateQuestion, setUpdateBoxQuestion] = useState(false);
  const [isInformationBox, setInformationBox] = useState(false);
  const [isConfirmBox, setConfirmBox] = useState(false);

  const alternativeInputs = [
    {
      label: "Nova resposta",
      type: "text",
      placeholder: "Digite sua resposta",
      value: newResponse,
      maxLength: 100,
      minLength: 1,
    },
  ];

  const [newQuestion, setNewQuestion] = useState({
    id: 0,
    title: "",
    imageUrl: "",
  });

  const questionInputs = [
    {
      label: "Novo título",
      type: "text",
      placeholder: "Digite o título da questão",
      value: newQuestion.title,
      maxLength: 170,
      minLength: 4,
    },
    {
      label: "URL da Imagem",
      type: "text",
      placeholder: "Digite a url da imagem",
      value: newQuestion.imageUrl,
      maxLength: 255,
      minLength: 0,
    },
  ];

  const [informationData, setInformationData] = useState({
    text: "",
    icon: "exclamation",
    color: "red",
  });

  function activeInformationBox(isFail, message) {
    if (isFail) {
      setInformationData((prevData) => {
        return { ...prevData, text: message };
      });
      setInformationBox(true);
    } else {
      setInformationData((prevData) => {
        return { ...prevData, text: message, color: "green", icon: "check" };
      });
      setInformationBox(true);
    }
  }

  function changeValue(value, label) {
    switch (label) {
      case "Nova resposta":
        setResponse(value);
        return;
      default:
        return "";
    }
  }

  function showUpdateAlternativeBox(text, id) {
    setResponse(text);
    setAlternativeId(id);
    setUpdateBoxAlternative(true);
  }

  function showUpdateQuestioneBox(id, title, imageUrl) {
    const question = {
      id,
      title,
      imageUrl,
    };
    setNewQuestion(question);
    setUpdateBoxQuestion(true);
  }

  function showConfirmBox(id, title, imageUrl) {
    const question = {
      id,
      title,
      imageUrl,
    };
    setNewQuestion(question);
    setConfirmBox(true);
  }

  async function updateAlternative() {
    setLoading(true);
    const response = await alternativeService.updateAlternative(alternativeId, {
      text: newResponse,
    });

    if (!response.success) {
      activeInformationBox(true, response.message);
      setLoading(false);
      return;
    }

    setCallback({});
    activeInformationBox(false, "Alternativa atualizada com sucesso!");
    setUpdateBoxAlternative(false);
    setLoading(false);
  }

  async function updateQuestion() {
    setLoading(true);
    const response = await alternativeService.updateAlternative(alternativeId, {
      text: newResponse,
    });

    if (!response.success) {
      activeInformationBox(true, response.message);
      setLoading(false);
      return;
    }

    setCallback({});
    activeInformationBox(false, "Questão atualizada com sucesso!");
    setUpdateBoxAlternative(false);
    setLoading(false);
  }

  async function removeQuestion() {
    setLoading(true);
    const response = await questionService.removeQuestion(newQuestion.id);
    setLoading(false);

    if (!response.success) {
      activeInformationBox(true, response.message);
      return;
    }

    setCallback({});
    activeInformationBox(false, "Questão removida com sucesso!");
    setConfirmBox(false);

    setTimeout(() => {
      setQuestionBox(false);
    }, 1000);
  }

  return (
    <div className="container-question-box">
      <div className="question-box">
        <span className="button-close" onClick={() => setQuestionBox(false)}>
          X
        </span>

        <div className="question-box-options">
          <i
            className="bi bi-pencil-square"
            onClick={() =>
              showUpdateQuestioneBox(
                question.id,
                question.title,
                question.imageUrl
              )
            }
          ></i>
          <BsTrash
            onClick={() =>
              showConfirmBox(question.id, question.title, question.imageUrl)
            }
          />
        </div>

        <div className="question-box-header">
          <h2>{question?.title}</h2>
          <img src={question.imageUrl} alt="" width={300} height={250} />
        </div>
        <div className="question-box-body">
          {question.alternatives &&
            question.alternatives.map((alternative, index) => (
              <div key={alternative.id} className="question-box-data">
                <span className="alternative-letter">
                  {alternativesList[index]}
                </span>
                <span className="alternative-text">{alternative.text}</span>
                <i
                  className="bi bi-pencil-square"
                  onClick={() =>
                    showUpdateAlternativeBox(alternative.text, alternative.id)
                  }
                ></i>
              </div>
            ))}
        </div>
      </div>

      {isUpdateAlternative && (
        <UpdateBox
          title="Atualizar Alternativa"
          inputs={alternativeInputs}
          onChange={changeValue}
          onClickSave={updateAlternative}
          onClickCancel={() => setUpdateBoxAlternative(false)}
        />
      )}

      {isUpdateQuestion && (
        <UpdateBox
          title="Atualizar Questão"
          inputs={questionInputs}
          onChange={changeValue}
          onClickSave={updateQuestion}
          onClickCancel={() => setUpdateBoxQuestion(false)}
        />
      )}

      {loading && <Loading />}

      {isInformationBox && (
        <InformationBox
          text={informationData.text}
          color={informationData.color}
          icon={informationData.icon}
          closeBox={() => setInformationBox(false)}
        />
      )}

      {isConfirmBox && (
        <ConfirmBox
          title="Deseja Remover essa Questão?"
          textBtn1="Sim"
          textBtn2="Não"
          onClickBtn1={removeQuestion}
          onClickBtn2={() => setConfirmBox(false)}
        />
      )}
    </div>
  );
}

export default QuestionBoxComponent;
