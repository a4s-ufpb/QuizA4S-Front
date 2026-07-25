import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeTemplate from "../../components/themeTemplate/ThemeTemplate";
import ThemeDetailsDialog from "../../components/themeForm/ThemeDetailsDialog";
import ThemeTagFilterBar from "../../components/tags/ThemeTagFilterBar";
import type { Theme } from "../../types";
import { setStoredTheme } from "../../util/storage";

const ChooseTheme = () => {
  const navigate = useNavigate();
  const baseUrl = "/theme";

  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  function startQuiz(theme: Theme) {
    setStoredTheme(theme);
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
        refreshKey={refreshKey}
        extraHeader={<ThemeTagFilterBar selected={tagIds} onChange={setTagIds} />}
      />

      <ThemeDetailsDialog
        theme={selectedTheme}
        onClose={() => setSelectedTheme(null)}
        onPlay={() => selectedTheme && startQuiz(selectedTheme)}
        playLabel="Jogar"
        onChanged={() => setRefreshKey((k) => k + 1)}
      />
    </>
  );
};

export default ChooseTheme;
