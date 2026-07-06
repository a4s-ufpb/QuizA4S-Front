import { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import ThemeTemplate from "../../components/themeTemplate/ThemeTemplate";
import "./RankingPage.css";
import Ranking from "../../components/ranking/Ranking";
import GlobalRanking from "../../components/globalRanking/GlobalRanking";
import type { Theme } from "../../types";

function RankingPage() {
  const [isShowRanking, setShowRanking] = useState(false);
  const [tab, setTab] = useState(0);

  function showRanking(theme: Theme) {
    sessionStorage.setItem("theme", JSON.stringify(theme));
    setShowRanking(true);
  }

  return (
    <div className="container-external-ranking">
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <Tabs value={tab} onChange={(_e, v) => setTab(v)}>
          <Tab label="Por Tema" />
          <Tab label="Global" />
        </Tabs>
      </Box>

      {tab === 0 && (
        <>
          <ThemeTemplate
            path="/theme"
            onClickFunction={showRanking}
            title="Selecione o Ranking por Quiz"
          />
          {isShowRanking && (
            <Ranking navigatePath={"/ranking"} setShowRanking={setShowRanking} />
          )}
        </>
      )}

      {tab === 1 && <GlobalRanking />}
    </div>
  );
}

export default RankingPage;
