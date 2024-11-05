import { useState } from "react";
import "./FilterComponent.css";
import { ResponseService } from "../../service/ResponseService";
import { BsCalendar } from "react-icons/bs";

const FilterComponent = ({ onData }) => {
  const [currentDate, setCurrentDate] = useState("");
  const [finalDate, setFinalDate] = useState("");
  const [username, setUsername] = useState("");
  const [themeName, setThemeName] = useState("");
  const [usernamesList, setUsernameList] = useState([]);
  const [themesList, setThemesList] = useState([]);
  const [showUsernameDropDown, setUsernameDropDown] = useState(false);
  const [showThemeNameDropDown, setThemeNameDropDown] = useState(false);
  const [showFilterPerDate, setFilterPerDate] = useState(false);

  const responseService = new ResponseService();

  const handleFilter = () => {
    onData({
      currentDate,
      finalDate,
      username,
      themeName
    });
  };

  const clearInputs = () => {
    setCurrentDate("");
    setFinalDate("");
    setUsername("");
    setThemeName("");
    onData({ currentDate: "", finalDate: "", username: "", themeName: "" });
  };

  const fetchUsernames = async () => {
    const user = localStorage.getItem("user");
    const { uuid: creatorId } = JSON.parse(user);

    const response = await responseService.findUsernamesByCreator(creatorId);
    if (response.success) {
      setUsernameList(response.data || []);
    } else {
      console.error(response.message);
    }
  };

  const fetchThemeNames = async () => {
    const user = localStorage.getItem("user");
    const { uuid: creatorId } = JSON.parse(user);

    const response = await responseService.findThemeNamesByCreator(creatorId);
    if (response.success) {
      setThemesList(response.data || []);
    } else {
      console.error(response.message);
    }
  };

  return (
    <div className="filter-container">
      <div className="filter-body">
        <div className="container-filter-input">
          <label className="filter-input">
            <span>Usuário:</span>
            <input
              type="text"
              placeholder="Digite o nome do usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => {
                setUsernameDropDown(true);
                fetchUsernames();
              }}
              onBlur={() => setTimeout(() => setUsernameDropDown(false), 100)}
            />
            {showUsernameDropDown && usernamesList.length > 0 && (
              <div className="dropdown-options">
                {usernamesList.map((data, index) => (
                  <div
                    key={index}
                    className="dropdown-option"
                    onMouseDown={() => setUsername(data.username)}
                  >
                    {data.username}
                  </div>
                ))}
              </div>
            )}
          </label>

          <label className="filter-input">
            <span>Tema:</span>
            <input
              type="text"
              placeholder="Digite o nome do tema"
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              onFocus={() => {
                setThemeNameDropDown(true);
                fetchThemeNames();
              }}
              onBlur={() => setTimeout(() => setThemeNameDropDown(false), 100)}
            />
            {showThemeNameDropDown && themesList.length > 0 && (
              <div className="dropdown-options">
                {themesList.map((data, index) => (
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
            )}
          </div>
        </div>

        <div className="filter-buttons">
          <button type="button" onClick={handleFilter}>
            Filtrar
          </button>

          <button type="button" onClick={clearInputs}>
            Limpar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterComponent;
