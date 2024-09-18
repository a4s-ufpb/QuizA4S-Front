import { useState } from "react";
import Loading from "../loading/Loading";
import InformationBox from "../informationBox/InformationBox";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { ThemeService } from "../../service/ThemeService";
import SearchImage from "../searchImageComponent/SearchImage";

import "./ThemeMenu.css";

const ThemeMenu = ({ setThemeMenu }) => {

  const themeService = new ThemeService();

  const [loading, setLoading] = useState(false);
  const [informationBox, setInformationBox] = useState(false);
  const [searchImage, setSearchImage] = useState(false);
  const [informationData, setInformationData] = useState({
    text: "",
    color: "",
    icon: "",
  });

  const navigate = useNavigate();
  const inputImageUrl = document.getElementById("input-image-url");

  function getUrlOfImage(imageUrl) {
    inputImageUrl.value = imageUrl;
    setSearchImage(false);
  }

  const schema = object().shape({
    name: string()
      .required("Campo obrigatório")
      .min(3, "Mínimo de 3 caracteres")
      .max(20, "Máximo de 20 caracteres"),
    imageUrl: string().url("URL inválida"),
  });

  const {
    register,
    handleSubmit: onSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  async function handleSubmit(themeRequest) {
    themeRequest.imageUrl = inputImageUrl.value;
    setLoading(true);

    const response = await themeService.insertTheme(themeRequest);
    if (response.success) {
      activateInformationBox(false, "Tema criado com sucesso");
      navigateCreateQuestion(response.data);
    } else {
      activateInformationBox(true, response.message);
    }

    setLoading(false);
  }

  function activateInformationBox(isError, message) {
    setInformationData({
      text: message,
      color: isError ? "red" : "green",
      icon: isError ? "exclamation" : "check",
    });
    setInformationBox(true);
  }

  function navigateCreateQuestion(theme) {
    localStorage.setItem("theme", JSON.stringify(theme));
    navigate(`/create/quiz/${theme.id}/question`);
  }

  return (
    <div className="theme-menu">
      <form className="form-menu">
        <div className="theme-menu-close">
          <i
            className="bi bi-x-circle-fill"
            onClick={() => setThemeMenu(false)}
          ></i>
        </div>

        <h2 className="theme-menu-title">Criar tema</h2>

        <label className="theme-menu-input">
          <p>Nome:</p>
          <input
            type="text"
            placeholder="Digite o nome do seu tema"
            {...register("name")}
          />
          <span className="span-error-message">{errors?.name?.message}</span>
        </label>

        <label className="theme-menu-input">
          <p>Imagem:</p>
          <input
            id="input-image-url"
            type="text"
            placeholder="Digite ou Pesquise a URL da imagem"
            {...register("imageUrl")}
          />
          <span className="span-error-message">
            {errors?.imageUrl?.message}
          </span>
        </label>

        <button
          type="button"
          className="theme-menu-btn"
          onClick={() => setSearchImage(true)}
        >
          Pesquisar Imagem na Web
        </button>

        <button
          type="button"
          className="theme-menu-btn"
          onClick={onSubmit(handleSubmit)}
        >
          Criar
        </button>

        {informationBox && (
          <InformationBox
            text={informationData.text}
            color={informationData.color}
            icon={informationData.icon}
            closeBox={() => setInformationBox(false)}
          />
        )}

        {loading && <Loading />}
        {searchImage && (
          <SearchImage
            setSearchImage={setSearchImage}
            getUrlOfImage={getUrlOfImage}
          />
        )}
      </form>
    </div>
  );
};

export default ThemeMenu;