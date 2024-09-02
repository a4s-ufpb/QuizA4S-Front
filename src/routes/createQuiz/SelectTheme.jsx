import { useNavigate } from "react-router-dom";
import ThemeTemplate from "../../components/themeTemplate/ThemeTemplate";

import "./SelectTheme.css";

const SelectTheme = () => {
  const path = "/theme/creator";
  const navigate = useNavigate();

  function showCreateQuestion(theme) {
    localStorage.setItem("theme", JSON.stringify(theme));
    navigate(`/create/quiz/${theme.id}/question`)
  }

  return (
    <div className="container-select-theme">

      <ThemeTemplate path={path} onClickFunction={showCreateQuestion} title="Escolha o Tema de suas Questões"/>

    </div>
  );
};

export default SelectTheme;
