import { useState } from "react";
import "./FilterComponent.css";
import { BsFillTrash3Fill, BsSearch } from "react-icons/bs";

const FilterComponent = ({
  onData
}) => {

  const [currentDate, setCurrentDate] = useState("");
  const [finalDate, setFinalDate] = useState("");
  const [username, setUsername] = useState("");

  const handleFilter = () => {
    onData({
      currentDate,
      finalDate,
      username
    });
  };

  const clearInputs = () => {
    setCurrentDate("");
    setFinalDate("");
    setUsername("");
    onData({ currentDate: "", finalDate: "", username: "" });
  };

  return (
    <div className="filter-container">
      <div className="filter-body">
        <div className="container-filter-input">
          <label className="filter-input">
            <span>Nome do Usuário</span>
            <input
              type="text"
              placeholder="Digite o nome do usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>

          <label className="filter-input">
            <span>Data Inicial</span>
            <input
              type="date"
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
            />
          </label>
          <label className="filter-input">
            <span>Data Final</span>
            <input
              type="date"
              value={finalDate}
              onChange={(e) => setFinalDate(e.target.value)}
            />
          </label>
        </div>

        <button type="button" onClick={handleFilter}>
          Filtrar
        </button>

        <button type="button" onClick={clearInputs}>
          Limpar
        </button>

        <BsSearch className="icon" onClick={handleFilter} />

        <BsFillTrash3Fill className="icon" id="trash" onClick={clearInputs} />
      </div>
    </div>
  );
};

export default FilterComponent;
