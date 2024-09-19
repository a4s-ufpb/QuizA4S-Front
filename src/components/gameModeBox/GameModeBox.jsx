import "./GameModeBox.css";
import { useNavigate } from "react-router-dom";
import ImgMultiPlayer from "../../assets/img-multiplayer.webp";
import ImgOnePlayer from "../../assets/img-one-player.webp";

function GameModeBox( {setGameModeBox} ) {
  const navigate = useNavigate();

  function navigateOnePlayer() {
    navigate("/theme");
    setGameModeBox(false);
  }

  function navigateMultiPlayer() {
    navigate("/room");
    setGameModeBox(false);
  }

  return (
    <div className="game-mode-container-external">
      <div className="game-mode-container">
        <h2>Escolha um modo de jogo</h2>

        <div className="select-game-mode">
          <div className="game-mode" onClick={navigateOnePlayer}>
            <img
              src={ImgOnePlayer}
              alt="img-one-player"
              width={250}
              height={250}
            />
            <span>Um Jogador</span>
          </div>
          <div className="game-mode" onClick={navigateMultiPlayer}>
            <img
              src={ImgMultiPlayer}
              alt="img-multplayer"
              width={250}
              height={250}
            />
            <span>Multijogador</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameModeBox;
