import { useState } from "react";
import { Modal, Button, ListGroup } from "react-bootstrap";
import UpdateBox from "../../components/updateBox/UpdateBox";
import Loading from "../../components/loading/Loading";
import InformationBox from "../../components/informationBox/InformationBox";
import { AlternativeService } from "./../../service/AlternativeService";

const MyAlternative = ({
  alternatives,
  setShowAlternatives,
  setCallBack,
  setAlternatives,
}) => {
  const alternativeService = new AlternativeService();
  const alternativeList = ["A", "B", "C", "D"];
  const [newResponse, setResponse] = useState("");
  const [alternativeId, setAlternativeId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isUpdateBox, setUpdateBox] = useState(false);
  const [isInformationBox, setInformationBox] = useState(false);
  const [informationData, setInformationData] = useState({
    text: "",
    icon: "exclamation",
    color: "red",
  });

  const inputs = [
    {
      label: "Nova resposta",
      type: "text",
      placeholder: "Digite sua resposta",
      value: newResponse,
      maxLength: 100,
      minLength: 1,
    },
  ];

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
    if (label === "Nova resposta") {
      setResponse(value);
    }
  }

  function showUpdateBox(text, id) {
    setResponse(text);
    setAlternativeId(id);
    setUpdateBox(true);
  }

  async function updateAlternative() {
    setLoading(true);
    const response = await alternativeService.updateAlternative(alternativeId, {
      text: newResponse,
    });
    setLoading(false);

    if (!response.success) {
      activeInformationBox(true, response.message);
      return;
    }

    setAlternatives((prevAlternatives) =>
      prevAlternatives.map((alt) =>
        alt.id === alternativeId ? { ...alt, text: response.data.text } : alt
      )
    );

    setCallBack({});
    activeInformationBox(false, "Alternativa atualizada com sucesso!");
    setUpdateBox(false);
  }

  return (
    <Modal
      show={true}
      onHide={() => setShowAlternatives(false)}
      centered
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Alternativas</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ListGroup>
          {alternatives &&
            alternatives.map((alt, index) => (
              <ListGroup.Item
                key={alt.id}
                className="d-flex align-items-center gap-3"
                variant={alt.correct ? "success" : ""}
              >
                <span className="fw-bold">{alternativeList[index]}</span>
                <span className="flex-grow-1">{alt.text}</span>
                <Button
                  variant="outline-warning"
                  size="sm"
                  onClick={() => showUpdateBox(alt.text, alt.id)}
                >
                  <i className="bi bi-pencil-square"></i>
                </Button>
              </ListGroup.Item>
            ))}
        </ListGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="danger"
          onClick={() => setShowAlternatives(false)}
        >
          Fechar
        </Button>
      </Modal.Footer>

      {isUpdateBox && (
        <UpdateBox
          title="Atualizar Alternativa"
          inputs={inputs}
          onChange={changeValue}
          onClickSave={updateAlternative}
          onClickCancel={() => setUpdateBox(false)}
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
    </Modal>
  );
};

export default MyAlternative;