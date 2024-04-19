import { useState } from "react";
import ConfirmBox from "../confirmBox/ConfirmBox";
import UpdateBox from "../updateBox/UpdateBox";
import { ApiFetch } from "../../util/ApiFetch";
import Loading from "../loading/Loading";
import InformationBox from "../informationBox/InformationBox";

import "./Theme.css";

const defaultImgUrl =
  "https://t3.ftcdn.net/jpg/04/60/01/36/360_F_460013622_6xF8uN6ubMvLx0tAJECBHfKPoNOR5cRa.jpg";

const Theme = ({ themes, setThemes, setCallBack }) => {
  const apiFetch = new ApiFetch();

  const [loading, setLoading] = useState(false);

  const [isConfirmBox, setConfirmBox] = useState(false);
  const [isUpdateBox, setUpdateBox] = useState(false);
  const [isInformationBox, setInformationBox] = useState(false);

  const [informationData, setInformationData] = useState({
    text: "",
    icon: "exclamation",
    color: "red",
  });

  const [themeId, setThemeId] = useState(0);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const inputs = [
    {
      label: "Novo nome",
      type: "text",
      placeholder: "Digite o nome do tema",
      value: newName,
    },
    {
      label: "URL da Imagem",
      type: "text",
      placeholder: "Digite a url da imagem",
      value: newUrl,
    },
  ];

  function showConfirmBox(id, name, imageUrl) {
    setThemeId(id);
    setNewName(name);
    setNewUrl(imageUrl);
    setConfirmBox(true);
  }

  function showUpdateBox(id, name, imageUrl) {
    setThemeId(id);
    setNewName(name);
    setNewUrl(imageUrl);
    setUpdateBox(true);
  }

  function removeTheme() {
    setLoading(true);
    const promisse = apiFetch.delete(`/theme/${themeId}`, false);

    promisse.then((response) => {
      if (!response.removed) {
        activeInformationBox(true, response.message);
        setLoading(false);
        return;
      }

      activeInformationBox(false, "Tema removido com sucesso!");
      setThemes(themes.filter((theme) => themeId !== theme.id));
      setLoading(false);
      setConfirmBox(false);
    });
  }

  const newTheme = {
    name: newName,
    imageUrl: newUrl,
  };

  function updateTheme() {
    setLoading(true);
    const promisse = apiFetch.patch(`/theme/${themeId}`, newTheme);

    promisse.then((response) => {
      if (!response.success) {
        activeInformationBox(true, response.message);
        setLoading(false);
        return;
      }

      activeInformationBox(false, "Tema atualizado com sucesso");
      setCallBack({});
      setLoading(false);
      setUpdateBox(false);
    });
  }

  function activeInformationBox(isFail, message) {
    if (isFail) {
      setInformationData((prevData) => {
        return { ...prevData, text: message };
      });
      setInformationBox(true);
    } else {
      setInformationData((prevData) => {
        return { ...prevData, text: message, color: "green", icon: "check" };
      });
      setInformationBox(true);
    }
  }

  function changeValue(value, label) {
    switch (label) {
      case "Novo nome":
        setNewName(value);
        return;
      case "URL da Imagem":
        setNewUrl(value);
        return;
      default:
        return "";
    }
  }

  return (
    <div className="my-theme-list">
      {themes &&
        themes.map((theme) => (
          <div key={theme.id} className="theme-data">
            <img
              src={theme.imageUrl == null ? defaultImgUrl : theme.imageUrl}
              alt="image"
            />
            <div className="theme-questions">
              <p>{theme.name}</p>
              <button type="button">Questões</button>
            </div>
            <div className="theme-action">
              <i
                className="bi bi-trash-fill"
                onClick={() =>
                  showConfirmBox(theme.id, theme.name, theme.imageUrl)
                }
              ></i>
              <i
                className="bi bi-pencil-square"
                onClick={() =>
                  showUpdateBox(theme.id, theme.name, theme.imageUrl)
                }
              ></i>
            </div>
          </div>
        ))}

      {isConfirmBox && (
        <ConfirmBox
          title="Deseja remover este tema?"
          textBtn1="Sim"
          textBtn2="Não"
          onClickBtn1={removeTheme}
          onClickBtn2={() => setConfirmBox(false)}
        />
      )}
      {isUpdateBox && (
        <UpdateBox
          title="Atualizar Tema"
          inputs={inputs}
          onChange={changeValue}
          onClickSave={updateTheme}
          onClickCancel={() => setUpdateBox(false)}
        />
      )}
      {isInformationBox && (
        <InformationBox
          text={informationData.text}
          color={informationData.color}
          icon={informationData.icon}
          closeBox={() => setInformationBox(false)}
        />
      )}

      {loading && <Loading />}
    </div>
  );
};

export default Theme;