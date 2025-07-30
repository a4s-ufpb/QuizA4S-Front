import { Modal, Button } from "react-bootstrap";

const ConfirmBox = ({ title, textBtn1, textBtn2, onClickBtn1, onClickBtn2 }) => {
  return (
    <Modal show={true} onHide={onClickBtn2} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <i className="bi bi-question-circle" style={{ fontSize: "3rem", color: "#0055cc" }}></i>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={onClickBtn1}>
          {textBtn1}
        </Button>
        <Button variant="danger" onClick={onClickBtn2}>
          {textBtn2}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmBox;