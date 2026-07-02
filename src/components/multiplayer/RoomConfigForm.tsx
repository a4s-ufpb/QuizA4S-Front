import { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import type {
  AdvanceMode,
  GameConfig,
  RoomMode,
  ScoringMode,
} from "../../types/game";

interface RoomConfigFormProps {
  config: GameConfig;
  onSave: (config: GameConfig) => void;
  onClose: () => void;
}

/** Modal do líder para personalizar as regras da partida. */
const RoomConfigForm = ({ config, onSave, onClose }: RoomConfigFormProps) => {
  const [draft, setDraft] = useState<GameConfig>(config);

  function update<K extends keyof GameConfig>(key: K, value: GameConfig[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Modal show onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Regras da partida</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Modo</Form.Label>
            <Form.Select
              value={draft.roomMode}
              onChange={(e) => update("roomMode", e.target.value as RoomMode)}
            >
              <option value="INDIVIDUAL">Individual (todos contra todos)</option>
              <option value="TEAM">Equipes</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Pontuação</Form.Label>
            <Form.Select
              value={draft.scoringMode}
              onChange={(e) =>
                update("scoringMode", e.target.value as ScoringMode)
              }
            >
              <option value="SPEED">Por velocidade (estilo Kahoot)</option>
              <option value="FIXED">Pontos fixos por acerto</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Avanço das questões</Form.Label>
            <Form.Select
              value={draft.advanceMode}
              onChange={(e) =>
                update("advanceMode", e.target.value as AdvanceMode)
              }
            >
              <option value="HOST">Manual (o líder avança)</option>
              <option value="AUTO">Automático (após o tempo)</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tempo por questão: {draft.questionTimeSeconds}s</Form.Label>
            <Form.Range
              min={5}
              max={60}
              step={5}
              value={draft.questionTimeSeconds}
              onChange={(e) =>
                update("questionTimeSeconds", Number(e.target.value))
              }
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Número de questões: {draft.questionCount}</Form.Label>
            <Form.Range
              min={1}
              max={30}
              step={1}
              value={draft.questionCount}
              onChange={(e) => update("questionCount", Number(e.target.value))}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={() => onSave(draft)}>
          Salvar regras
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RoomConfigForm;
