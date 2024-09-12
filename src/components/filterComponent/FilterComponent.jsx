import { useState } from "react";
import "./FilterComponent.css";
import Loading from "../loading/Loading";
import { BsFillTrash3Fill, BsSearch } from "react-icons/bs";
import { ResponseService } from "./../../service/ResponseService";

const FilterComponent = ({
  onData,
  currentPage,
  setResponses,
  setCurrentPage,
  setTotalPages,
}) => {
  const [loading, setLoading] = useState(false);

  const responseService = new ResponseService();

  const [data, setData] = useState({
    username: "",
    currentDate: "",
    finalDate: "",
  });

  function changeData(name, value) {
    setData((prevData) => {
      return { ...prevData, [name]: value };
    });
  }

  async function filterResponses() {
    if (onData) {
      onData(data);
    }

    setLoading(true);
    const response =
      await responseService.findResponsesByQuestionCreatorAndUsernameAndDate(
        currentPage,
        data.username,
        data.currentDate,
        data.finalDate
      );
    setLoading(false);

    if (!response.success) {
      setResponses([]);
      setTotalPages(0);
      setCurrentPage(0);
      return;
    }

    setCurrentPage(0);
    setResponses(response.data.content);
    setTotalPages(response.data.totalPages);
  }

  async function clearInputs() {
    setData({
      username: "",
      currentDate: "",
      finalDate: "",
    });

    setLoading(true);
    const response =
      await responseService.findResponsesByQuestionCreatorAndUsernameAndDate(
        0,
        "",
        "",
        ""
      );
    setLoading(false);

    if (response.success) {
      setResponses(response.data.content);
      setCurrentPage(0);
      setTotalPages(response.data.totalPages);
      return;
    }

    setResponses([]);
  }

  return (
    <div className="filter-container">
      <div className="filter-body">
        <div className="container-filter-input">
          <label className="filter-input">
            <span>Nome do Usuário</span>
            <input
              type="text"
              placeholder="Digite o nome do usuário"
              value={data.username}
              onChange={(e) => changeData("username", e.target.value)}
            />
          </label>

          <label className="filter-input">
            <span>Data Inicial</span>
            <input
              type="date"
              value={data.currentDate}
              onChange={(e) => changeData("currentDate", e.target.value)}
            />
          </label>
          <label className="filter-input">
            <span>Data Final</span>
            <input
              type="date"
              value={data.finalDate}
              onChange={(e) => changeData("finalDate", e.target.value)}
            />
          </label>
        </div>

        <button type="button" onClick={filterResponses}>
          Filtrar
        </button>

        <button type="button" onClick={clearInputs}>
          Limpar
        </button>

        <BsSearch className="icon" onClick={filterResponses} />

        <BsFillTrash3Fill className="icon" id="trash" onClick={clearInputs} />
      </div>
      {loading && <Loading />}
    </div>
  );
};

export default FilterComponent;
