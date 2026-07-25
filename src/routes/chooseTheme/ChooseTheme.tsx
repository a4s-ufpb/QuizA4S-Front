import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeTemplate from "../../components/themeTemplate/ThemeTemplate";
import ThemeDetailsDialog from "../../components/themeForm/ThemeDetailsDialog";
import MyTagFilterBar from "../../components/tags/MyTagFilterBar";
import type { Theme } from "../../types";

const ChooseTheme = () => {
  const navigate = useNavigate();
  const baseUrl = "/theme";

  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [tagIds, setTagIds] = useState<number[]>([]);

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
        tagIds={tagIds}
        extraHeader={<MyTagFilterBar selected={tagIds} onChange={setTagIds} />}
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
