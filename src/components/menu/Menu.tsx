import { useContext, type Dispatch, type SetStateAction } from "react";
import { AuthenticationContext } from "../../context/AuthenticationContext";
import { useNavigate } from "react-router-dom";
import {
  BsPersonCircle,
  BsJoystick,
  BsPersonBadge,
  BsPencilSquare,
  BsPeopleFill,
  BsTrophyFill,
  BsBoxArrowRight,
  BsPersonPlusFill,
  BsBoxArrowInRight,
} from "react-icons/bs";
import { getStoredUser } from "../../util/storage";

import "./Menu.css";

interface MenuProps {
  setMenu: Dispatch<SetStateAction<boolean>>;
  isAuth: boolean;
}

const Menu = ({ setMenu, isAuth }: MenuProps) => {
  const { setAuthenticated } = useContext(AuthenticationContext);
  const navigate = useNavigate();
  const user = isAuth ? getStoredUser() : null;

  function handleButtonClick(callback: () => void) {
    setMenu(false);
    callback();
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthenticated(false);
    navigate("/login");
  }

  return (
    <div className="menu">
      <div className="container-btn-fechar">
        <button type="button" onClick={() => setMenu(false)}>
          X
        </button>
      </div>

      {isAuth && user && (
        <div className="menu-user-header">
          <BsPersonCircle className="menu-user-avatar" />
          <span className="menu-user-name">{user.name}</span>
        </div>
      )}

      {isAuth && (
        <div className="container-btns">
          <button
            type="button"
            onClick={() => handleButtonClick(() => navigate("/"))}
          >
            <BsJoystick /> Jogar
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick(() => navigate("/profile"))}
          >
            <BsPersonBadge /> Meu Perfil
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick(() => navigate("/create/quiz"))}
          >
            <BsPencilSquare /> Criar Quiz
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick(() => navigate("/multiplayer"))}
          >
            <BsPeopleFill /> Multiplayer
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick(() => navigate("/ranking"))}
          >
            <BsTrophyFill /> Ranking
          </button>
          <button
            type="button"
            className="menu-btn-logout"
            onClick={() => handleButtonClick(logout)}
          >
            <BsBoxArrowRight /> Sair
          </button>
        </div>
      )}

      {!isAuth && (
        <div className="container-btns">
          <button
            type="button"
            onClick={() => handleButtonClick(() => navigate("/"))}
          >
            <BsJoystick /> Jogar
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick(() => navigate("/multiplayer"))}
          >
            <BsPeopleFill /> Multiplayer
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick(() => navigate("/register"))}
          >
            <BsPersonPlusFill /> Cadastrar-se
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick(() => navigate("/login"))}
          >
            <BsBoxArrowInRight /> Login
          </button>
        </div>
      )}
    </div>
  );
};

export default Menu;
