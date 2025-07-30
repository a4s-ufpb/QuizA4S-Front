import { Modal, Button } from "react-bootstrap";

const InformationBox = ({ text, closeBox, icon, color }) => {
  return (
    <Modal show={true} onHide={closeBox} centered>
      <Modal.Body className="text-center">
        <i className={`bi bi-${icon}-circle-fill`} style={{ fontSize: "3rem", color }}></i>
        <h4 className="mt-3" style={{ color }}>{text}</h4>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={closeBox} style={{ backgroundColor: color, borderColor: color }}>
          Ok
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InformationBox;