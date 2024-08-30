import { useState } from "react";
import ConfirmBox from "../confirmBox/ConfirmBox";
import UpdateBox from "../updateBox/UpdateBox";
import Loading from "../loading/Loading";
import InformationBox from "../informationBox/InformationBox";
import { UserService } from "../../service/UserService";

import "./UserTemplate.css";

function UserTemplate({ users, setUsers, setCurrentPage, setCallBack }) {
  const userService = new UserService();

  const [isConfirmBox, setConfirmBox] = useState(false);
  const [isUpdateBox, setUpdateBox] = useState(false);
  const [isInformationBox, setInformationBox] = useState(false);

  const [loading, setLoading] = useState(false);

  const [informationData, setInformationData] = useState({
    text: "",
    icon: "",
    color: "",
  });

  const [userId, setUserId] = useState(0);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const inputs = [
    {
      label: "Novo nome:",
      type: "text",
      placeholder: "Digite seu novo nome",
      value: newName,
      maxLength: 30,
      minLength: 3,
    },
    {
      label: "Email:",
      type: "text",
      placeholder: "Digite seu novo email",
      value: newEmail,
      maxLength: 100,
      minLength: 0,
    },
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
  ];

  function showConfirmBox(id, name, email) {
    setUserId(id);
    setNewName(name);
    setNewEmail(email);
    setConfirmBox(true);
  }

  function showUpdateBox(id, name, email) {
    setUserId(id);
    setNewName(name);
    setNewEmail(email);
    setUpdateBox(true);
  }

  async function removeUser() {
    setLoading(true);
    const response = await userService.removeUser(userId, true);
    setLoading(false);

    if (!response.success) {
      activeInformationBox(true, response.message);
      return;
    }

    setUsers(users.filter((user) => userId !== user.uuid));
    setCurrentPage(0);
    activeInformationBox(false, "Usuário removido com sucesso!");
    setConfirmBox(false);
  }

  const newUser = {
    name: newName,
    imageUrl: newEmail,
  };

  const userPassword = {
    newPassword: newPassword,
    confirmNewPassword: confirmNewPassword,
  };

  async function updateUser() {
    setLoading(true);
    try {
      const responseUserUpdate = await userService.updateUser(userId, newUser);
      
      if (!responseUserUpdate.success) {
        activeInformationBox(true, responseUserUpdate.message);
        return;
      }
  
      let responseUserPassword = { success: true };
  
      if (newPassword && confirmNewPassword) {
        const validatePasswordResponse = validatePassword(newPassword, confirmNewPassword);

        if(!validatePasswordResponse.valid) {
          activeInformationBox(true, validatePasswordResponse.message);
          return;
        }

        responseUserPassword = await userService.updatePassword(userId, userPassword);
        
        if (!responseUserPassword.success) {
          activeInformationBox(true, responseUserPassword.message);
          return;
        }
      }
  
      activeInformationBox(false, "Usuário atualizado com sucesso");
      setCallBack({});
      setUpdateBox(false);
      
    } catch (error) {
      activeInformationBox(true, "Erro ao atualizar usuário. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  function validatePassword(newPassword, confirmNewPassword) {
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
      setInformationData((prevData) => {
        return {
          ...prevData,
          text: message,
          color: "red",
          icon: "exclamation",
        };
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
      case "Novo nome:":
        setNewName(value);
        return;
      case "Novo email:":
        setNewEmail(value);
        return;
      case "Nova senha:":
        setNewPassword(value);
        break;
      case "Confirmar senha:":
        setConfirmNewPassword(value);
        break;
      default:
        return "";
    }
  }

  return (
    <div className="container-users">
      {users &&
        users.map((user) => (
          <div key={user.uuid} className="user-data">
            <i className="bi bi-person-circle"></i>
            <div className="user-info">
              <p>Nome: {user.name}</p>
              <p>Email: {user.email}</p>
            </div>
            <div className="user-action">
              <i
                className="bi bi-trash-fill"
                onClick={() => showConfirmBox(user.uuid, user.name, user.email)}
              ></i>
              <i
                className="bi bi-pencil-square"
                onClick={() => showUpdateBox(user.uuid, user.name, user.email)}
              ></i>
            </div>
          </div>
        ))}

      {isConfirmBox && (
        <ConfirmBox
          title="Deseja remover este usuário?"
          textBtn1="Sim"
          textBtn2="Não"
          onClickBtn1={removeUser}
          onClickBtn2={() => setConfirmBox(false)}
        />
      )}
      {isUpdateBox && (
        <UpdateBox
          title="Atualizar Usuário"
          inputs={inputs}
          onChange={changeValue}
          onClickSave={updateUser}
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
}

export default UserTemplate;