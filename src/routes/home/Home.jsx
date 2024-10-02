import "./Home.css";
import qrCode from "../../assets/qr-code.webp";

const Home = () => {


  return (
    <div className="container-home">
      <div className="home">
        <h1 className="home-title">Aprenda se divertindo</h1>
        <p className="home-description">
          Clique no botão abaixo e inicie um Quiz agora!
        </p>
        <button className="home-button" type="button">
          Jogar
        </button>
        
        <div className="qr-code">
          <h3>Acesse o site pelo QR-Code abaixo</h3>
          <img src={qrCode} alt="qr-code" width={120} height={120} />
        </div>
      </div>
    </div>
  );
};

export default Home;
