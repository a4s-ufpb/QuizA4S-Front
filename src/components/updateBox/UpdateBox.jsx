import { Modal, Form, Button } from "react-bootstrap";

const UpdateBox = ({ title, inputs, onChange, onClickSave, onClickCancel }) => {
  return (
    <Modal show={true} onHide={onClickCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {inputs &&
            inputs.map((input) => (
              <Form.Group key={input.label} className="mb-3">
                <Form.Label>{input.label}</Form.Label>
                {input.type === "password" ? (
                  <Form.Control
                    type={input.type}
                    placeholder={input.placeholder}
                    value={input.value}
                    onChange={(e) => onChange(e.target.value, input.label)}
                    maxLength={input.maxLength}
                    minLength={input.minLength}
                  />
                ) : (
                  <Form.Control
                    as="textarea"
                    placeholder={input.placeholder}
                    value={input.value}
                    onChange={(e) => onChange(e.target.value, input.label)}
                    maxLength={input.maxLength}
                    minLength={input.minLength}
                    rows={3}
                  />
                )}
              </Form.Group>
            ))}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={onClickSave}>
          Salvar
        </Button>
        <Button variant="danger" onClick={onClickCancel}>
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UpdateBox;