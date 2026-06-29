import { useState } from "react";
import ThemeTemplate from "../../components/themeTemplate/ThemeTemplate";
import "./RankingPage.css";
import Ranking from "../../components/ranking/Ranking";
import type { Theme } from "../../types";

function RankingPage() {
  const [isShowRanking, setShowRanking] = useState(false);

  function showRanking(theme: Theme) {
    localStorage.setItem("theme", JSON.stringify(theme));
    setShowRanking(true);
  }

  return (
    <div className="container-external-ranking">
      <ThemeTemplate
        path="/theme"
        onClickFunction={showRanking}
        title="Selecione o Ranking por Quiz"
      />
      {isShowRanking && (
        <Ranking navigatePath={"/ranking"} setShowRanking={setShowRanking} />
      )}
    </div>
  );
}

export default RankingPage;
