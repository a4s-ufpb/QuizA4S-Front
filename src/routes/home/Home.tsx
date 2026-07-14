import "./Home.css";
import qrCode from "../../assets/qr-code.webp";
import { useNavigate } from "react-router-dom";
import { BsPersonFill, BsPeopleFill } from "react-icons/bs";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="container-home">
      <div className="home">
        <h1 className="home-title">Aprenda se divertindo</h1>
        <p className="home-description">
          Escolha um modo de jogo e inicie um Quiz agora!
        </p>
        <div className="home-mode-buttons">
          <button
            className="home-button"
            type="button"
            onClick={() => navigate("/theme")}
          >
            <BsPersonFill aria-hidden /> Um Jogador
          </button>
          <button
            className="home-button home-button-multiplayer"
            type="button"
            onClick={() => navigate("/multiplayer")}
          >
            <BsPeopleFill aria-hidden /> Multijogador
          </button>
        </div>

        <div className="qr-code">
          <h3>Acesse o site pelo QR-Code abaixo</h3>
          <img src={qrCode} alt="qr-code" width={120} height={120} />
        </div>
      </div>
    </div>
  );
};

export default Home;
