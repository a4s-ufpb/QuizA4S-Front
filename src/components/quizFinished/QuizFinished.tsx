import { useEffect, useState } from "react";
import Loading from "../loading/Loading";
import Ranking from "../ranking/Ranking";
import ConfirmBox from "../confirmBox/ConfirmBox";
import "./QuizFinished.css";
import { useInsertScoreMutation } from "../../query/useScoreQueries";
import { useNavigate } from "react-router-dom";
import InformationBox from "../informationBox/InformationBox";
import { HIT_VALUE, REDUCE_VALUE, MIN_VALUE_PER_HIT } from "../../vite-env";
import { useInsertStatisticMutation } from "../../query/useStatisticQueries";
import { getStoredTheme, getStoredUser } from "../../util/storage";
import { generateResultImage, downloadImage } from "../../util/shareImage";
import type { ScoreRequest, StatisticRequest } from "../../types";

interface QuizFinishedProps {
  percentage: number;
  restart: () => void;
  score: number;
  time: number;
  total: number;
}

const QuizFinished = ({
  percentage,
  restart,
  score,
  time,
  total,
}: QuizFinishedProps) => {
  const insertScoreMutation = useInsertScoreMutation();
  const insertStatisticMutation = useInsertStatisticMutation();

  const [loading, setLoading] = useState(false);
  const [confirmBox, setConfirmBox] = useState(false);
  const [informationBox, setInformationBox] = useState(false);
  const isAuth = localStorage.getItem("token");

  const [activeRanking, setActiveRanking] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedUser()) {
      const user = getStoredUser();
      const theme = getStoredTheme();

      const statistic: StatisticRequest = {
        studentName: user.name,
        themeName: theme.name,
        percentagemOfHits: percentage,
      };

      saveStatistic(statistic);
    }
  }, []);

  function saveStatistic(statistic: StatisticRequest) {
    try {
      setLoading(true);

      insertStatisticMutation.mutate(statistic);
    } catch (error) {
      console.error(error);
      setInformationBox(true);
      return;
    } finally {
      setLoading(false);
    }
  }

  function calculateResult(): string | number {
    // Espelha Score.calculateResult do backend: piso de MIN_VALUE_PER_HIT por
    // acerto, pra quem acertou ao menos 1 questão nunca ficar zerado.
    const raw = score * HIT_VALUE - time * REDUCE_VALUE;
    const floor = score * MIN_VALUE_PER_HIT;
    return Math.max(raw, floor).toFixed(2);
  }

  const scoreRequest: ScoreRequest = {
    numberOfHits: score,
    totalTime: time,
  };

  async function saveResult() {
    let userId = "";
    let themeId = 0;

    if (isLoggedUser()) {
      userId = getStoredUser().uuid;
      themeId = getStoredTheme().id;
    }

    setConfirmBox(false);

    setLoading(true);
    const scoreResponse = await insertScoreMutation.mutateAsync({
      score: scoreRequest,
      userId,
      themeId,
    });
    setLoading(false);

    if (scoreResponse.success) {
      setActiveRanking(true);
      return;
    }

    setInformationBox(true);
  }

  function isLoggedUser(): boolean {
    const user = getStoredUser();
    const theme = getStoredTheme();
    return Boolean(user.uuid && theme.id);
  }

  function closeBox() {
    setConfirmBox(false);
    navigate("/theme");
  }

  function handleShare() {
    const theme = getStoredTheme();
    const user = getStoredUser();
    const dataUrl = generateResultImage({
      themeName: theme.name || "Quiz",
      playerName: user.name || "Jogador",
      score,
      total,
    });
    downloadImage(dataUrl, "quiz-a4s-resultado.png");
  }

  return (
    <div className="container-quiz-finished">
      <div className="quiz-finished">
        <h2 className="quiz-finished-title">Quiz Finalizado!</h2>

        {isAuth && (
          <p className="quiz-finished-point">
            Sua pontuação: {calculateResult()}
          </p>
        )}

        {percentage >= 0 && percentage <= 30 && (
          <div className="quiz-finished-score">
            <span>{`${percentage}% de acertos!`}</span>
            <p>
              Não desanime! Cada erro é uma oportunidade de aprender algo novo.
            </p>
          </div>
        )}
        {percentage > 30 && percentage <= 60 && (
          <div className="quiz-finished-score">
            <span>{`${percentage}% de acertos!`}</span>
            <p>
              Você está indo bem! Com um pouco mais de prática, vai dominar este
              quiz!
            </p>
          </div>
        )}
        {percentage > 60 && percentage <= 90 && (
          <div className="quiz-finished-score">
            <span>{`${percentage}% de acertos!`}</span>
            <p>
              Impressionante! Você está quase lá, apenas mais um passo para a
              perfeição!
            </p>
          </div>
        )}
        {percentage == 100 && (
          <div className="quiz-finished-score">
            <span>{`${percentage}% de acertos!`}</span>
            <p>
              Uau! Pontuação máxima! Você é um verdadeiro mestre neste assunto!
            </p>
          </div>
        )}
        <div className="container-quiz-finished-btn">
          <button onClick={restart} className="quiz-finished-btn">
            Voltar
          </button>
          <button onClick={handleShare} className="quiz-finished-btn">
            Compartilhar
          </button>
          {isAuth && (
            <button
              onClick={() => setConfirmBox(true)}
              className="quiz-finished-btn"
            >
              Ranking
            </button>
          )}
        </div>
      </div>

      {activeRanking && (
        <Ranking navigatePath={"/theme"} setShowRanking={setActiveRanking} />
      )}

      {loading && <Loading />}

      {confirmBox && (
        <ConfirmBox
          title="Deseja salvar sua pontuação?"
          textBtn1="Sim"
          textBtn2="Não"
          onClickBtn1={saveResult}
          onClickBtn2={closeBox}
        />
      )}

      {informationBox && (
        <InformationBox
          text="Tente novamente mais tarde!"
          closeBox={() => setInformationBox(false)}
          color="red"
          icon="exclamation"
        />
      )}
    </div>
  );
};

export default QuizFinished;
