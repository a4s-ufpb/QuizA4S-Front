import React, { useState } from "react";
import { Modal, Button, Card, Row, Col } from "react-bootstrap";
import UpdateBox from "../../components/updateBox/UpdateBox";
import Loading from "../../components/loading/Loading";
import InformationBox from "../../components/informationBox/InformationBox";
import { AlternativeService } from "../../service/AlternativeService";
import { QuestionService } from "../../service/QuestionService";
import { BsPencilSquare } from "react-icons/bs";
import ConfirmBox from "../confirmBox/ConfirmBox";
import { DEFAULT_IMG } from "../../vite-env";

function QuestionBoxComponent({
  setQuestionBox,
  question,
  setCallback,
  setQuestion,
}) {
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
      label: "Nova resposta:",
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
      label: "Novo título:",
      type: "text",
      placeholder: "Digite o título da questão",
      value: newQuestion.title,
      maxLength: 170,
      minLength: 4,
    },
    {
      label: "URL da Imagem:",
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
      setInformationData((prevData) => ({
        ...prevData,
        text: message,
      }));
      setInformationBox(true);
    } else {
      setInformationData((prevData) => ({
        ...prevData,
        text: message,
        color: "green",
        icon: "check",
      }));
      setInformationBox(true);
    }
  }

  function changeValue(value, label) {
    switch (label) {
      case "Nova resposta:":
        setResponse(value);
        break;
      case "Novo título:":
        setNewQuestion((prevQuestion) => ({
          ...prevQuestion,
          title: value,
        }));
        break;
      case "URL da Imagem:":
        setNewQuestion((prevQuestion) => ({
          ...prevQuestion,
          imageUrl: value,
        }));
        break;
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
    const question = { id, title, imageUrl };
    setNewQuestion(question);
    setUpdateBoxQuestion(true);
  }

  function showConfirmBox(id, title, imageUrl) {
    const question = { id, title, imageUrl };
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

    setQuestion((prevQuestion) => ({
      ...prevQuestion,
      alternatives: prevQuestion.alternatives.map((alt) =>
        alt.id === alternativeId ? { ...alt, text: response.data.text } : alt
      ),
    }));
    setCallback({});
    activeInformationBox(false, "Alternativa atualizada com sucesso!");
    setUpdateBoxAlternative(false);
    setLoading(false);
  }

  async function updateQuestion() {
    setLoading(true);
    const response = await questionService.updateQuestion(
      newQuestion.id,
      newQuestion
    );

    if (!response.success) {
      activeInformationBox(true, response.message);
      setLoading(false);
      return;
    }

    setCallback({});
    setQuestion(response.data);
    activeInformationBox(false, "Questão atualizada com sucesso!");
    setUpdateBoxQuestion(false);
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
    <Modal
      show={true}
      onHide={() => setQuestionBox(false)}
      centered
      size="lg"
      dialogClassName="custom-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>{question?.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-gradient">
        <Card className="mb-3 d-flex justify-content-center align-items-center border-0">
          <Card.Img
            variant="top"
            src={question.imageUrl || DEFAULT_IMG}
            alt="question"
            style={{ width: "300px", height: "300px"}}
            className="rounded"
          />
        </Card>
        <Row className="g-3">
          {question.alternatives &&
            question.alternatives.map((alternative, index) => (
              <Col key={alternative.id} md={6}>
                <Card className={alternative.correct ? "bg-success bg-opacity-50" : ""}>
                  <Card.Body className="d-flex align-items-center">
                    <span className="me-2 fw-bold">
                      {alternativesList[index]}
                    </span>
                    <span className="flex-grow-1">{alternative.text}</span>
                    <Button
                      variant="link"
                      onClick={() =>
                        showUpdateAlternativeBox(
                          alternative.text,
                          alternative.id
                        )
                      }
                    >
                      <BsPencilSquare />
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="primary"
          onClick={() =>
            showUpdateQuestioneBox(question.id, question.title, question.imageUrl)
          }
        >
          Editar Questão
        </Button>
        <Button
          variant="danger"
          onClick={() =>
            showConfirmBox(question.id, question.title, question.imageUrl)
          }
        >
          Remover Questão
        </Button>
      </Modal.Footer>

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
    </Modal>
  );
}

export default QuestionBoxComponent;
