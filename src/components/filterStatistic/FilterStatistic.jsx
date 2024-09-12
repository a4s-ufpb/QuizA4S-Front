import { useState } from "react";
import "./FilterStatistic.css"

const FilterStatistic = ({ onFilter }) => {
  const [studentName, setStudentName] = useState("");
  const [themeName, setThemeName] = useState("");

  const handleFilter = () => {
    onFilter({ studentName, themeName });
  };

  return (
    <div className="filter-container-statistic">
      <input
        type="text"
        placeholder="Nome do Usuário"
        value={studentName}
        onChange={(e) => setStudentName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Tema"
        value={themeName}
        onChange={(e) => setThemeName(e.target.value)}
      />
      <button onClick={handleFilter}>Filtrar</button>
    </div>
  );
};

export default FilterStatistic;
