import { useState } from "react";
import "./FilterStatistic.css";
import { StatisticService } from "../../service/StatisticService";

const FilterStatistic = ({ onFilter }) => {
  const [studentName, setStudentName] = useState("");
  const [themeName, setThemeName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [studentAndThemes, setStudentAndThemes] = useState([]);
  const [showStudentOptions, setShowStudentOptions] = useState(false);
  const [showThemeOptions, setShowThemeOptions] = useState(false);

  const statisticService = new StatisticService();

  const handleFilter = () => {
    onFilter({
      studentName,
      themeName,
      startDate,
      endDate,
    });
  };

  const clearInputs = () => {
    setStudentName("");
    setThemeName("");
    setStartDate("");
    setEndDate("");
    onFilter({ studentName: "", themeName: "", startDate: "", endDate: "" });
  };

  const fetchDistinctThemeNames = async () => {
    const user = localStorage.getItem("user");
    const { uuid: creatorId } = JSON.parse(user);

    const response = await statisticService.findDistinctThemeNameByCreatorId(creatorId);
    if (response.success) {
      setStudentAndThemes(response.data || []);
    } else {
      console.error(response.message);
    }
  };

  const fetchDistinctStudentNames = async () => {
    const user = localStorage.getItem("user");
    const { uuid: creatorId } = JSON.parse(user);

    const response = await statisticService.findDistinctStudentNameByCreatorId(creatorId);
    if (response.success) {
      setStudentAndThemes(response.data || []);
    } else {
      console.error(response.message);
    }
  };

  return (
    <div className="filter-container-statistic">
      <div className="filter-statistics-inputs">
        <label className="label-filter-statistics">
          <span>Usuário:</span>
          <input
            type="text"
            placeholder="Nome do Usuário"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            onFocus={() => {
              setShowStudentOptions(true);
              fetchDistinctStudentNames();
            }}
            onBlur={() => setTimeout(() => setShowStudentOptions(false), 100)}
          />
          {showStudentOptions && studentAndThemes.length > 0 && (
            <div className="dropdown-options">
              {studentAndThemes.map((data, index) => (
                <div
                  key={index}
                  className="dropdown-option"
                  onMouseDown={() => setStudentName(data.studentName)}
                >
                  {data.studentName}
                </div>
              ))}
            </div>
          )}
        </label>
        <label className="label-filter-statistics">
          <span>Tema:</span>
          <input
            type="text"
            placeholder="Tema"
            value={themeName}
            onChange={(e) => setThemeName(e.target.value)}
            onFocus={() => {
              setShowThemeOptions(true);
              fetchDistinctThemeNames();
            }}
            onBlur={() => setTimeout(() => setShowThemeOptions(false), 200)}  // timeout to prevent immediate hide
          />
          {showThemeOptions && (
            <div className="dropdown-options">
              {studentAndThemes.map((data, index) => (
                <div
                  key={index}
                  className="dropdown-option"
                  onMouseDown={() => setThemeName(data.themeName)}
                >
                  {data.themeName}
                </div>
              ))}
            </div>
          )}
        </label>
        <label className="label-filter-statistics">
          <span>Data Início:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label className="label-filter-statistics">
          <span>Data Fim:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      </div>

      <div className="filter-statistic-buttons">
        <button onClick={handleFilter}>Filtrar</button>
        <button onClick={clearInputs}>Limpar</button>
      </div>
    </div>
  );
};

export default FilterStatistic;