import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Nav } from "react-bootstrap";
import { PersonCircle } from "react-bootstrap-icons";
import MyTheme from "./myTheme/MyTheme";
import MyResponse from "./myResponse/MyResponse";
import Loading from "../../components/loading/Loading";
import InformationBox from "../../components/informationBox/InformationBox";
import ConfirmBox from "../../components/confirmBox/ConfirmBox";
import UpdateBox from "../../components/updateBox/UpdateBox";
import MyStatistics from "./myStatisticPerResponse/MyStatistics";
import MyStatisticConclusion from "./myStatisticPerConclusion/MyStatisticConclusion";
import { UserService } from "./../../service/UserService";
import { useNavigate } from "react-router-dom";
import Users from "./users/Users";

const Profile = () => {
  const { uuid, name, email } = JSON.parse(localStorage.getItem("user"));
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentItem, setCurrentItem] = useState(0);

  const confirmBoxData = {
    title: "Deseja remover sua conta?",
    textBtn1: "Sim",
    textBtn2: "Não",
  };

  const componentsItens = [
    <MyTheme />,
    <MyResponse />,
    <MyStatistics />,
    <MyStatisticConclusion />,
    isAdmin && <Users />,
  ];

  const buttons = [
    { id: "btn-quiz", label: "Meus Temas", index: 0 },
    { id: "btn-response", label: "Painel de Respostas", index: 1 },
    { id: "btn-statistic-response", label: "Estatísticas por Questão", index: 2 },
    { id: "btn-statistic-conclusion", label: "Estatísticas por Conclusão", index: 3 },
    ...(isAdmin ? [{ id: "btn-admin", label: "Usuários", index: 4 }] : []),
  ];

  useEffect(() => {
    async function verifyUserAdmin() {
      const response = await userService.validateIfUserIsAdmin(uuid);
      if (response.data.isAdmin) {
        setIsAdmin(true);
      }
    }
    verifyUserAdmin();
  }, []);

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
    newPassword: newPassword,
    confirmNewPassword: confirmNewPassword,
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
      setInformationData((prevData) => ({
        ...prevData,
        text: response.message,
      }));
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
    if (newPassword !== confirmNewPassword) {
      validAndMessage.valid = false;
      validAndMessage.message = "Senhas diferentes";
    } else if (newPassword.length < 8 || newPassword.length > 20) {
      validAndMessage.valid = false;
      validAndMessage.message = "A senha deve conter de 8 a 20 caracteres";
    } else if (confirmNewPassword.length < 8 || confirmNewPassword.length > 20) {
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
        text: message,
      });
      setInformationBox(true);
      return;
    }
    setInformationData({
      color: "green",
      icon: "check",
      text: message,
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
    <Container fluid className="py-4 min-vh-100">
      <Row className="g-4">
        <Col lg={3} md={4} sm={12}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body className="text-center d-flex flex-column align-items-center gap-3">
              <PersonCircle size={80} className="text-primary" />
              <h5 className="mb-0">{name}</h5>
              <p className="text-muted">{email}</p>
              <Button
                variant="outline-primary"
                className="w-75 rounded-pill"
                onClick={showUpdateBox}
              >
                Editar Perfil
              </Button>
              <Button
                variant="outline-primary"
                className="w-75 rounded-pill"
                onClick={showPasswordBox}
              >
                Alterar Senha
              </Button>
              <Button
                variant="danger"
                className="w-75 rounded-pill"
                onClick={showConfirmationBox}
              >
                Excluir Conta
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={9} md={8} sm={12}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <Nav
                variant="tabs"
                activeKey={currentItem}
                className="mb-3"
                onSelect={(selectedKey) => setCurrentItem(Number(selectedKey))}
              >
                {buttons.map((button) => (
                  <Nav.Item key={button.id}>
                    <Nav.Link eventKey={button.index}>{button.label}</Nav.Link>
                  </Nav.Item>
                ))}
              </Nav>
              <div>{componentsItens[currentItem]}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

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
    </Container>
  );
};

export default Profile;