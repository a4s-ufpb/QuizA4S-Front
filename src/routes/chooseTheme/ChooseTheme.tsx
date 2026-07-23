import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeTemplate from "../../components/themeTemplate/ThemeTemplate";
import ThemeDetailsDialog from "../../components/themeForm/ThemeDetailsDialog";
import type { Theme } from "../../types";

const ChooseTheme = () => {
  const navigate = useNavigate();
  const baseUrl = "/theme";

  // No modo um jogador, clicar num tema abre os detalhes antes de começar.
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);

  function startQuiz(theme: Theme) {
    sessionStorage.setItem("theme", JSON.stringify(theme));
    navigate(`/theme/quiz/${theme.id}`);
  }

  return (
    <>
      <ThemeTemplate
        path={baseUrl}
        onClickFunction={setSelectedTheme}
        title="Escolha o Tema do seu Quiz"
        searchOnButton
      />

      <ThemeDetailsDialog
        theme={selectedTheme}
        onClose={() => setSelectedTheme(null)}
        onPlay={() => selectedTheme && startQuiz(selectedTheme)}
        playLabel="Jogar"
      />
    </>
  );
};

export default ChooseTheme;
