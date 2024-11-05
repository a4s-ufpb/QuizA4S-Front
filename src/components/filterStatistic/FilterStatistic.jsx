import { useState, useEffect } from "react";
import "./FilterStatistic.css";
import { StatisticService } from "../../service/StatisticService";
import { BsCalendar } from "react-icons/bs";

const FilterStatistic = ({ onFilter }) => {
  const [studentName, setStudentName] = useState("");
  const [themeName, setThemeName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [studentNameList, setStudentNameList] = useState([]);
  const [themeNameList, setThemeNameList] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filteredThemes, setFilteredThemes] = useState([]);
  const [showStudentOptions, setShowStudentOptions] = useState(false);
  const [showThemeOptions, setShowThemeOptions] = useState(false);
  const [showFilterPerDate, setFilterPerDate] = useState(false);

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

  const fetchDistinctStudentNames = async () => {
    const user = localStorage.getItem("user");
    const { uuid: creatorId } = JSON.parse(user);

    const response = await statisticService.findDistinctStudentNameByCreatorId(
      creatorId
    );
    if (response.success) {
      setStudentNameList(response.data || []);
      setFilteredStudents(response.data || []);
    } else {
      console.error(response.message);
    }
  };

  const fetchDistinctThemeNames = async () => {
    const user = localStorage.getItem("user");
    const { uuid: creatorId } = JSON.parse(user);

    const response = await statisticService.findDistinctThemeNameByCreatorId(
      creatorId
    );
    if (response.success) {
      setThemeNameList(response.data || []);
      setFilteredThemes(response.data || []);
    } else {
      console.error(response.message);
    }
  };

  useEffect(() => {
    setFilteredStudents(
      studentNameList.filter((data) =>
        data.studentName.toLowerCase().includes(studentName.toLowerCase())
      )
    );
  }, [studentName, studentNameList]);

  useEffect(() => {
    setFilteredThemes(
      themeNameList.filter((data) =>
        data.themeName.toLowerCase().includes(themeName.toLowerCase())
      )
    );
  }, [themeName, themeNameList]);

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
          {showStudentOptions && filteredStudents.length > 0 && (
            <div className="dropdown-options">
              {filteredStudents.map((data, index) => (
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
            onBlur={() => setTimeout(() => setShowThemeOptions(false), 200)}
          />
          {showThemeOptions && filteredThemes.length > 0 && (
            <div className="dropdown-options">
              {filteredThemes.map((data, index) => (
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
        <div className="filter-date-container">
          <div className="set-filter-date" onClick={() => setFilterPerDate(!showFilterPerDate)}>
            <p>Filtrar por período</p>
            <BsCalendar />
          </div>

          {showFilterPerDate && (
            <div className="filter-date">
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
          )}
        </div>
      </div>

      <div className="filter-statistic-buttons">
        <button onClick={handleFilter}>Filtrar</button>
        <button onClick={clearInputs}>Limpar</button>
      </div>
    </div>
  );
};

export default FilterStatistic;