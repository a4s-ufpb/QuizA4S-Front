import { useEffect, useState } from "react";
import "./MyStatistics.css";
import Loading from "../../components/loading/Loading";
import NotFoundComponent from "../../components/notFound/NotFoundComponent";
import { ThemeService } from "../../service/ThemeService";
import { ResponseService } from "./../../service/ResponseService";
import { UserService } from "../../service/UserService";

function MyStatistics() {
  const themeService = new ThemeService();
  const responseService = new ResponseService();
  const userService = new UserService();

  const [loading, setLoading] = useState(false);

  const [themeNamesList, setThemeNamesList] = useState([]);

  const [statistics, setStatistics] = useState([]);

  const { uuid: userId } = JSON.parse(localStorage.getItem("user"));

  async function fetchData() {
    setLoading(true);

    try {
      const validateUser = await userService.validateIfUserIsAdmin(userId);
      const isAdmin = validateUser.data.isAdmin;

      const fetchThemes = isAdmin
        ? themeService.findAllThemes("", 0)
        : themeService.findThemesByCreator("", 0);

      const response = await fetchThemes;

      setThemeNamesList(response.data.content || []);
    } catch (error) {
      setThemeNamesList([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function searchStatistics(nameOfTheme) {
    if (nameOfTheme === "") {
      setStatistics([]);
      return;
    }

    setLoading(true);
    const response = await responseService.findResponsesStatistics(
      nameOfTheme,
      userId
    );
    setLoading(false);

    if (!response.success) {
      return;
    }

    setStatistics(response.data);
  }

  return (
    <div className="container-statistics">
      <div className="filter-statistics">
        <span>Selecione um tema</span>
        <select name="theme" onChange={(e) => searchStatistics(e.target.value)}>
          <option value="">Vazio</option>
          {themeNamesList &&
            themeNamesList.map((theme) => (
              <option value={theme.name} key={theme.name}>
                {theme.name}
              </option>
            ))}
        </select>
      </div>

      <div className="container-table-statistics">
        <table className="table-statistics">
          <thead>
            <tr>
              <th>ID da Questão</th>
              <th>Título da Questão</th>
              <th>Total de Respostas</th>
              <th>Respostas Certas</th>
              <th>Respostas Erradas</th>
              <th>Porcentagem de Certas</th>
              <th>Porcentagem de Erradas</th>
            </tr>
          </thead>

          <tbody>
            {statistics &&
              statistics.map((statistic) => (
                <tr key={statistic.questionId}>
                  <td>{statistic.questionId}</td>
                  <td>{statistic.questionTitle}</td>
                  <td>{statistic.totalOfAnswers}</td>
                  <td>{statistic.totalOfCorrectAnswers}</td>
                  <td>{statistic.totalOfIncorrectAnswers}</td>
                  <td>{statistic.percentageOfAnswersCorrect.toFixed(1)}%</td>
                  <td>{statistic.percentageOfAnswersIncorrect.toFixed(1)}%</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {loading && <Loading />}

      {!loading && themeNamesList.length == 0 && (
        <NotFoundComponent title="Nenhuma Estatística" />
      )}
    </div>
  );
}

export default MyStatistics;
