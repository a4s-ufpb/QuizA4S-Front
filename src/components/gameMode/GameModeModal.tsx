import { Dialog, DialogTitle, DialogContent } from "@mui/material";
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
    <Dialog open={show} onClose={onHide} fullWidth maxWidth="md">
      <DialogTitle>Como você quer jogar?</DialogTitle>
      <DialogContent>
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
      </DialogContent>
    </Dialog>
  );
};

export default GameModeModal;
