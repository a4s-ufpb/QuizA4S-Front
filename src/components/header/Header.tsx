import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/logo-a4s.webp";
import { BsList } from "react-icons/bs";

import "./Header.css";
import { useState } from "react";
import Menu from "../menu/Menu";

interface HeaderProps {
  isAuth: boolean;
}

const Header = ({ isAuth }: HeaderProps) => {
  const [menu, setMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="header">
      <Link to="/">
        <img
          src={logo}
          alt="Logo Apps4Society"
          className="logo"
          width="80"
          height="80"
        />
      </Link>

      <h1 className="title" onClick={() => navigate("/")}>
        Quiz A4S
      </h1>

      <ul className="nav-bar">
        {!isAuth && (
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            Início
          </NavLink>
        )}

        {!isAuth && (
          <NavLink
            to="/register"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            Cadastrar-se
          </NavLink>
        )}

        {!isAuth && (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            Login
          </NavLink>
        )}
      </ul>
      {isAuth && (
        <BsList className="profile" onClick={() => setMenu(true)} />
      )}

      {!isAuth && (
        <BsList className="menu-mobile" onClick={() => setMenu(true)} />
      )}

      {menu && <Menu setMenu={setMenu} isAuth={isAuth} />}
    </header>
  );
};

export default Header;
