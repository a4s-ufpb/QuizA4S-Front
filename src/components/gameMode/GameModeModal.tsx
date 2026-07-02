import { Modal } from "react-bootstrap";
import onePlayerImg from "../../assets/img-one-player.webp";
import multiplayerImg from "../../assets/img-multiplayer.webp";
import "./GameModeModal.css";

interface GameModeModalProps {
  show: boolean;
  onHide: () => void;
  onSingle: () => void;
  onMulti: () => void;
}

/** Seleção de modo de jogo: um jogador ou multijogador. */
const GameModeModal = ({
  show,
  onHide,
  onSingle,
  onMulti,
}: GameModeModalProps) => {
  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Como você quer jogar?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="game-mode-options">
          <button
            type="button"
            className="game-mode-card"
            onClick={onSingle}
          >
            <img src={onePlayerImg} alt="Um jogador" />
            <span>Um jogador</span>
          </button>

          <button
            type="button"
            className="game-mode-card"
            onClick={onMulti}
          >
            <img src={multiplayerImg} alt="Multijogador" />
            <span>Multijogador</span>
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default GameModeModal;
