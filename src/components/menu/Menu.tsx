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
  BsGearFill,
  BsClockHistory,
  BsPersonHeart,
  BsAwardFill,
  BsDiagram3Fill,
  BsShopWindow,
  BsArrowLeft,
} from "react-icons/bs";
import { getStoredUser } from "../../util/storage";
import { clearAuthStorage } from "../../util/token";
import { TitleBadge, FramedAvatar, bannerClassName, PlayerName } from "../cosmetics/Cosmetic";

import "./Menu.css";

interface MenuProps {
  setMenu: Dispatch<SetStateAction<boolean>>;
  isAuth: boolean;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onOpenFriends: () => void;
  onOpenAchievements: () => void;
}

const Menu = ({
  setMenu,
  isAuth,
  onOpenSettings,
  onOpenHistory,
  onOpenFriends,
  onOpenAchievements,
}: MenuProps) => {
  const { setAuthenticated } = useContext(AuthenticationContext);
  const navigate = useNavigate();
  const user = isAuth ? getStoredUser() : null;

  function handleButtonClick(callback: () => void) {
    setMenu(false);
    callback();
  }

  function logout() {
    clearAuthStorage();
    setAuthenticated(false);
    navigate("/login");
  }

  return (
    <div className="menu">
      <div className="container-btn-fechar">
        <button type="button" className="menu-btn-close" onClick={() => setMenu(false)} title="Fechar menu">
          <BsArrowLeft size={20} />
        </button>
      </div>

      {isAuth && user && (
        <div
          className={`menu-user-header ${bannerClassName(user.equippedBanner)}`}
        >
          <FramedAvatar code={user.equippedFrame} size={56}>
            <BsPersonCircle size={38} color="#fff" />
          </FramedAvatar>
          <span className="menu-user-name">
            <PlayerName
              name={user.name}
              font={user.equippedFont}
              style={user.equippedNameStyle}
              effect={user.equippedNameEffect}
            />
          </span>
          {user.equippedTitle && <TitleBadge code={user.equippedTitle} />}
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
            onClick={() => handleButtonClick(() => navigate("/tournament"))}
          >
            <BsDiagram3Fill /> Torneio
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick(() => navigate("/ranking"))}
          >
            <BsTrophyFill /> Ranking
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick(() => navigate("/store"))}
          >
            <BsShopWindow /> Loja
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick(onOpenHistory)}
          >
            <BsClockHistory /> Histórico Recente
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick(onOpenFriends)}
          >
            <BsPersonHeart /> Amigos
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick(onOpenAchievements)}
          >
            <BsAwardFill /> Conquistas
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick(onOpenSettings)}
          >
            <BsGearFill /> Configurações
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
            onClick={() => handleButtonClick(() => navigate("/tournament"))}
          >
            <BsDiagram3Fill /> Torneio
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick(onOpenSettings)}
          >
            <BsGearFill /> Configurações
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
