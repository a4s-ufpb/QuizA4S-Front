import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo-a4s.webp";
import { BsList, BsSunFill, BsMoonStarsFill } from "react-icons/bs";
import { IconButton, Tooltip } from "@mui/material";

import "./Header.css";
import { useContext, useState } from "react";
import Menu from "../menu/Menu";
import SettingsModal from "../settingsModal/SettingsModal";
import ProfileFeatureModal from "../profileFeatureModal/ProfileFeatureModal";
import MatchHistory from "../../routes/profile/matchHistory/MatchHistory";
import Friends from "../../routes/profile/friends/Friends";
import Achievements from "../../routes/profile/achievements/Achievements";
import { ThemeModeContext } from "../../context/ThemeModeContext";

interface HeaderProps {
  isAuth: boolean;
}

const Header = ({ isAuth }: HeaderProps) => {
  const [menu, setMenu] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const navigate = useNavigate();
  const { mode, toggleMode } = useContext(ThemeModeContext);

  return (
    <header className="header">
      <Link to="/">
        <img
          src={logo}
          alt="Logo Apps4Society"
          className="logo"
          width="60"
          height="60"
        />
      </Link>

      <h1 onClick={() => navigate("/")}>
        Quiz A4S
      </h1>

      <div className="header-buttons">
        <Tooltip title={mode === "light" ? "Modo escuro" : "Modo claro"}>
          <IconButton onClick={toggleMode} sx={{ color: "inherit" }}>
            {mode === "light" ? <BsMoonStarsFill /> : <BsSunFill />}
          </IconButton>
        </Tooltip>

        <IconButton onClick={() => setMenu(!menu)} sx={{ color: "inherit" }}>
          <BsList size={35}/>
        </IconButton>
      </div>

      {menu && (
        <Menu
          setMenu={setMenu}
          isAuth={isAuth}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenHistory={() => setHistoryOpen(true)}
          onOpenFriends={() => setFriendsOpen(true)}
          onOpenAchievements={() => setAchievementsOpen(true)}
        />
      )}

      <SettingsModal open={settingsOpen} setOpen={setSettingsOpen} />

      {isAuth && (
        <>
          <ProfileFeatureModal
            title="Histórico Recente"
            open={historyOpen}
            onClose={() => setHistoryOpen(false)}
          >
            <MatchHistory />
          </ProfileFeatureModal>

          <ProfileFeatureModal
            title="Amigos"
            open={friendsOpen}
            onClose={() => setFriendsOpen(false)}
          >
            <Friends onNavigateAway={() => setFriendsOpen(false)} />
          </ProfileFeatureModal>

          <ProfileFeatureModal
            title="Conquistas"
            open={achievementsOpen}
            onClose={() => setAchievementsOpen(false)}
          >
            <Achievements />
          </ProfileFeatureModal>
        </>
      )}
    </header>
  );
};

export default Header;
