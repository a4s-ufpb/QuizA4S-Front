import { useEffect, useState } from "react";
import MyTheme from "./MyTheme";
import MyResponse from "./MyResponse";
import Loading from "../../components/loading/Loading";
import InformationBox from "../../components/informationBox/InformationBox";
import ConfirmBox from "../../components/confirmBox/ConfirmBox";
import UpdateBox from "../../components/updateBox/UpdateBox";
import MyStatistics from "./MyStatistics";
import { UserService } from "./../../service/UserService";

import "./Profile.css";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const userService = new UserService();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [informationBox, setInformationBox] = useState(false);
  const [confirmBox, setConfirmBox] = useState(false);
  const [updateBox, setUpdateBox] = useState(false);
  const [passwordBox, setPasswordBox] = useState(false);

  const [informationData, setInformationData] = useState({
    text: "",
    icon: "",
    color: "",
  });

  const confirmBoxData = {
    title: "Deseja remover sua conta?",
    textBtn1: "Sim",
    textBtn2: "Não",
  };

  const [currentItem, setCurrentItem] = useState(0);
  const componentsItens = [<MyTheme />, <MyResponse />, <MyStatistics />];

  useEffect(() => {
    const btnQuiz = document.getElementById("btn-quiz");
    const btnResponse = document.getElementById("btn-response");
    const btnStatistic = document.getElementById("btn-statistic");

    if (currentItem === 0) {
      btnQuiz.classList.add("selected-btn");
      btnResponse.classList.remove("selected-btn");
      btnStatistic.classList.remove("selected-btn");
    } else if (currentItem === 1) {
      btnQuiz.classList.remove("selected-btn");
      btnResponse.classList.add("selected-btn");
      btnStatistic.classList.remove("selected-btn");
    } else {
      btnQuiz.classList.remove("selected-btn");
      btnResponse.classList.remove("selected-btn");
      btnStatistic.classList.add("selected-btn");
    }
  }, [currentItem]);

  const { uuid, name, email } = JSON.parse(localStorage.getItem("user"));

  const [newName, setNewName] = useState("");

  const updateBoxData = {
    title: "Editar perfil",
    inputs: [
      {
        label: "Novo nome:",
        type: "text",
        placeholder: "Digite seu novo nome",
        value: newName,
        maxLength: 30,
        minLength: 3,
      },
    ],
  };

  const userUpdate = {
    name: newName,
  };

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const passwordBoxData = {
    title: "Alterar senha",
    inputs: [
      {
        label: "Nova senha:",
        type: "password",
        placeholder: "Digite sua nova senha",
        value: newPassword,
        maxLength: 20,
        minLength: 8,
      },
      {
        label: "Confirmar senha:",
        type: "password",
        placeholder: "Digite novamente sua nova senha",
        value: confirmNewPassword,
        maxLength: 20,
        minLength: 8,
      },
    ],
  };

  const userPassword = {
    password: newPassword,
  };

  function changeValueForPasswordBox(value, label) {
    switch (label) {
      case "Nova senha:":
        setNewPassword(value);
        break;
      case "Confirmar senha:":
        setConfirmNewPassword(value);
        break;
      default:
        break;
    }
  }

  async function updateAccount() {
    setLoading(true);
    const response = await userService.updateUser(uuid, userUpdate);
    if (!response.success) {
      activeInformationBox(true, response.message);
      setLoading(false);
      return;
    }

    localStorage.setItem(
      "user",
      JSON.stringify({ uuid: uuid, name: userUpdate.name, email: email })
    );
    setLoading(false);

    activeInformationBox(false, "Nome atualizado com sucesso!");

    setUpdateBox(false);
  }

  async function removeAccount() {
    setLoading(true);
    const response = await userService.removeUser(uuid);
    setLoading(false);

    if (!response.success) {
      setInformationData((prevData) => {
        return { ...prevData, text: response.message };
      });
      setInformationBox(true);
    }

    navigate("/");
  }

  async function updatePassword() {
    const validate = validatePassword();

    if (!validate.valid) {
      activeInformationBox(true, validate.message);
      return;
    }

    setLoading(true);
    const response = await userService.updatePassword(uuid, userPassword);
    if (!response.success) {
      activeInformationBox(true, response.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    activeInformationBox(false, "Senha atualizada com sucesso!");

    setPasswordBox(false);
  }

  function validatePassword() {
    let validAndMessage = {
      valid: true,
      message: "",
    };

    if (newPassword != confirmNewPassword) {
      validAndMessage.valid = false;
      validAndMessage.message = "Senhas diferentes";
    } else if (newPassword.length < 8 || newPassword.length > 20) {
      validAndMessage.valid = false;
      validAndMessage.message = "A senha deve conter de 8 a 20 caracteres";
    } else if (
      confirmNewPassword.length < 8 ||
      confirmNewPassword.length > 20
    ) {
      validAndMessage.valid = false;
      validAndMessage.message = "A senha deve conter de 8 a 20 caracteres";
    }

    return validAndMessage;
  }

  function activeInformationBox(isFail, message) {
    if (isFail) {
      setInformationData({
        color: "red",
        icon: "exclamation",
        text: message
      });
      setInformationBox(true);
      return;
    } 

    setInformationData({
      color: "green",
      icon: "check",
      text: message
    });
    setInformationBox(true);
  }

  function showConfirmationBox() {
    setConfirmBox(true);
  }

  function showUpdateBox() {
    setUpdateBox(true);
  }

  function showPasswordBox() {
    setNewPassword("");
    setConfirmNewPassword("");
    setPasswordBox(true);
  }

  return (
    <div className="container-profile outlet">
      <div className="user-profile">
        <i className="bi bi-person-circle"></i>
        <p>{name}</p>
        <p>{email}</p>
        <button
          id="user-profile-btn-update"
          type="button"
          onClick={showUpdateBox}
        >
          Editar Perfil
        </button>
        <button
          id="user-profile-btn-update"
          type="button"
          onClick={showPasswordBox}
        >
          Alterar Senha
        </button>
        <button
          id="user-profile-btn-delete"
          type="button"
          onClick={showConfirmationBox}
        >
          Excluir Conta
        </button>
      </div>

      <div className="container-user-itens">
        <div className="select-user-item">
          <button
            type="button"
            onClick={() => setCurrentItem(0)}
            id="btn-quiz"
            className="select-user-btn"
          >
            Meus Temas
          </button>
          <button
            type="button"
            onClick={() => setCurrentItem(1)}
            id="btn-response"
            className="select-user-btn"
          >
            Painel de Respostas
          </button>
          <button
            type="button"
            onClick={() => setCurrentItem(2)}
            id="btn-statistic"
            className="select-user-btn"
          >
            Estatistícas
          </button>
        </div>

        <div className="user-itens">{componentsItens[currentItem]}</div>
      </div>

      {loading && <Loading />}
      {informationBox && (
        <InformationBox
          text={informationData.text}
          closeBox={() => setInformationBox(false)}
          icon={informationData.icon}
          color={informationData.color}
        />
      )}
      {confirmBox && (
        <ConfirmBox
          title={confirmBoxData.title}
          textBtn1={confirmBoxData.textBtn1}
          textBtn2={confirmBoxData.textBtn2}
          onClickBtn1={removeAccount}
          onClickBtn2={() => setConfirmBox(false)}
        />
      )}
      {updateBox && (
        <UpdateBox
          title={updateBoxData.title}
          inputs={updateBoxData.inputs}
          onChange={setNewName}
          onClickSave={updateAccount}
          onClickCancel={() => setUpdateBox(false)}
        />
      )}
      {passwordBox && (
        <UpdateBox
          title={passwordBoxData.title}
          inputs={passwordBoxData.inputs}
          onChange={changeValueForPasswordBox}
          onClickSave={updatePassword}
          onClickCancel={() => setPasswordBox(false)}
        />
      )}
    </div>
  );
};

export default Profile;
