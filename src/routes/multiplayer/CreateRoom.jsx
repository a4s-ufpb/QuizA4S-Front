import { useState } from "react";
import ThemeMenu from "../../components/menu/ThemeMenu";
import ImgCreateRoom from "../../assets/img-create-room.webp"
import ImgJoinRoom from "../../assets/img-join-room.webp"

//Css
import "./CreateRoom.css";
import { useNavigate } from "react-router-dom";

const CreateRoom = () => {

  const [activeThemeMenu, setThemeMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="container-create-room">
      <div className="container-room">
        <div className="container-room-header">
          <h2>Crie ou Entre em uma Sala</h2>
        </div>

        <div className="container-room-buttons">
          <div className="room-btn" onClick={() => setThemeMenu(true)}>
            <h2>Criar Sala</h2>
            <img src={ImgCreateRoom} alt="img-room-quiz" width="300" height="300"></img>
          </div>

          <div className="room-btn" onClick={() => navigate("/create/quiz/theme")}>
            <h2>Entrar na Sala</h2>
            <img src={ImgJoinRoom} alt="img-select-quiz" width="300" height="300"></img>
          </div>
        </div>
      </div>

      {activeThemeMenu && <ThemeMenu setThemeMenu={setThemeMenu}/>}
    </div>
  );
};

export default CreateRoom;
