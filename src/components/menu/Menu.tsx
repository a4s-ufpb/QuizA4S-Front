import { useContext, type Dispatch, type SetStateAction } from "react";
import { AuthenticationContext } from "../../context/AuthenticationContext";
import { useNavigate } from "react-router-dom";

import "./Menu.css";

interface MenuProps {
  setMenu: Dispatch<SetStateAction<boolean>>;
  isAuth: boolean;
}

const Menu = ({ setMenu, isAuth }: MenuProps) => {
  const { setAuthenticated } = useContext(AuthenticationContext);
  const navigate = useNavigate();

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

      {isAuth && (
        <div className="container-btns">
          <button
            type="button"
            onClick={() => handleButtonClick(() => navigate("/"))}
          >
            Jogar
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick(() => navigate("/profile"))}
          >
            Meu Perfil
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick(() => navigate("/create/quiz"))}
          >
            Criar Quiz
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick(() => navigate("/multiplayer"))}
          >
            Multiplayer
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick(() => navigate("/ranking"))}
          >
            Ranking
          </button>
          <button type="button" onClick={() => handleButtonClick(logout)}>
            Sair
          </button>
        </div>
      )}

      {!isAuth && (
        <div className="container-btns">
          <button
            type="button"
            onClick={() => handleButtonClick(() => navigate("/"))}
          >
            Jogar
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick(() => navigate("/multiplayer"))}
          >
            Multiplayer
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick(() => navigate("/register"))}
          >
            Cadastrar-se
          </button>
          <button
            type="button"
            onClick={() => handleButtonClick(() => navigate("/login"))}
          >
            Login
          </button>
        </div>
      )}
    </div>
  );
};

export default Menu;
