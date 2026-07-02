import "./Home.css";
import { useState } from "react";
import qrCode from "../../assets/qr-code.webp";
import backgroundImage from "../../assets/background-quiz.webp";
import { useNavigate } from "react-router-dom";
import GameModeModal from "../../components/gameMode/GameModeModal";

const Home = () => {
  const navigate = useNavigate();
  const [showModes, setShowModes] = useState(false);

  return (
    <div
      className="container-home"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="home">
        <h1 className="home-title">Aprenda se divertindo</h1>
        <p className="home-description">
          Clique no botão abaixo e inicie um Quiz agora!
        </p>
        <button
          className="home-button"
          type="button"
          onClick={() => setShowModes(true)}
        >
          Jogar
        </button>

        <div className="qr-code">
          <h3>Acesse o site pelo QR-Code abaixo</h3>
          <img src={qrCode} alt="qr-code" width={120} height={120} />
        </div>
      </div>

      <GameModeModal
        show={showModes}
        onHide={() => setShowModes(false)}
        onSingle={() => navigate("/theme")}
        onMulti={() => navigate("/multiplayer")}
      />
    </div>
  );
};

export default Home;
