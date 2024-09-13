import { useState } from "react";
import "./FilterStatistic.css";

const FilterStatistic = ({ onFilter }) => {
  const [studentName, setStudentName] = useState("");
  const [themeName, setThemeName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
          />
        </label>
        <label className="label-filter-statistics">
          <span>Tema:</span>
          <input
            type="text"
            placeholder="Tema"
            value={themeName}
            onChange={(e) => setThemeName(e.target.value)}
          />
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
