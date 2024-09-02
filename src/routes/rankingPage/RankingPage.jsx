import { useState } from "react";
import ThemeTemplate from "../../components/themeTemplate/ThemeTemplate";
import "./RankingPage.css";
import Ranking from "../../components/ranking/Ranking";

function RankingPage() {
  const [isShowRanking, setShowRanking] = useState(false);

  function showRanking(theme) {
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
      {isShowRanking && <Ranking navigatePath={"/ranking"} setShowRanking={setShowRanking}/>}
    </div>
  );
}

export default RankingPage;
