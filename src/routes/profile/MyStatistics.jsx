import { useEffect, useState } from "react"
import "./MyStatistics.css"
import { ApiFetch } from './../../util/ApiFetch';
import Loading from "../../components/loading/Loading";
import NotFoundComponent from "../../components/notFound/NotFoundComponent";

function MyStatistics() {
  const apiFetch = new ApiFetch();
  const [loading, setLoading] = useState(false);

  const [themeNamesList, setThemeNamesList] = useState([]);

  const [statistics, setStatistics] = useState([])

  useEffect(() =>{
    setLoading(true);
    const promisse = apiFetch.getPages("/theme/creator", "Nenhum tema encontrado");

    promisse.then((response) =>{
      if(!response.success) {
        setLoading(false);
        return;
      }
      
      setThemeNamesList(response.data);
      setLoading(false);
    })
  }, [])

  function searchStatistics(nameOfTheme){
    if(nameOfTheme === ""){
      setStatistics([]);
      return;
    }
    
    setLoading(true);

    const promisse = apiFetch.get(`/response/statistic/${nameOfTheme}`, "Nenhuma estatística encontrada");

    promisse.then((response) =>{
      if(!response.success){
        setLoading(false);
      }

      setStatistics(response.data);
      setLoading(false);
    })
  }


  return (
    <div className="container-statistics">
      <div className="filter-statistics">
        <span>Selecione um tema</span>
        <select name="theme" onChange={(e) => searchStatistics(e.target.value)}>
          <option value="">Vazio</option>
          {themeNamesList && themeNamesList.map((theme) => (
            <option value={theme.name} key={theme.name}>{theme.name}</option>
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
        <NotFoundComponent title="Nenhuma Estatística"/>
      )}
    </div>
  )
}

export default MyStatistics