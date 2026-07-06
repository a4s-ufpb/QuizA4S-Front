import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Typography,
  LinearProgress,
} from "@mui/material";
import { BsPersonCircle, BsHandThumbsUpFill, BsCoin } from "react-icons/bs";
import { TitleBadge, FramedAvatar, bannerClassName } from "../../components/cosmetics/Cosmetic";
import MyTheme from "./myTheme/MyTheme";
import MyOwnResponses from "./myOwnResponses/MyOwnResponses";
import MyResponse from "./myResponse/MyResponse";
import Loading from "../../components/loading/Loading";
import InformationBox from "../../components/informationBox/InformationBox";
import ConfirmBox from "../../components/confirmBox/ConfirmBox";
import UpdateBox from "../../components/updateBox/UpdateBox";
import MyStatistics from "./myStatisticPerResponse/MyStatistics";
import MyStatisticConclusion from "./myStatisticPerConclusion/MyStatisticConclusion";
import { useNavigate } from "react-router-dom";
import Users from "./users/Users";
import { getStoredUser } from "../../util/storage";
import {
  useFindUserQuery,
  useIsAdminQuery,
  useRemoveUserMutation,
  useUpdatePasswordMutation,
  useUpdateUserMutation,
} from "../../query/useUserQueries";
import type { InformationData } from "../../types";

interface PasswordValidation {
  valid: boolean;
  message: string;
}

const Profile = () => {
  const { uuid, name, email } = getStoredUser();
  const findUserQuery = useFindUserQuery();
  const likes = findUserQuery.data?.success ? findUserQuery.data.data.likes ?? 0 : 0;
  const xp = findUserQuery.data?.success ? findUserQuery.data.data.xp ?? 0 : 0;
  const level = findUserQuery.data?.success ? findUserQuery.data.data.level ?? 1 : 1;
  const coins = findUserQuery.data?.success ? findUserQuery.data.data.coins ?? 0 : 0;
  const equippedTitle = findUserQuery.data?.success ? findUserQuery.data.data.equippedTitle : null;
  const equippedFrame = findUserQuery.data?.success ? findUserQuery.data.data.equippedFrame : null;
  const equippedBanner = findUserQuery.data?.success ? findUserQuery.data.data.equippedBanner : null;
  const xpIntoLevel = xp % 100;
  const updateUserMutation = useUpdateUserMutation();
  const removeUserMutation = useRemoveUserMutation();
  const updatePasswordMutation = useUpdatePasswordMutation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [informationBox, setInformationBox] = useState(false);
  const [confirmBox, setConfirmBox] = useState(false);
  const [updateBox, setUpdateBox] = useState(false);
  const [passwordBox, setPasswordBox] = useState(false);
  const [informationData, setInformationData] = useState<InformationData>({
    text: "",
    icon: "",
    color: "",
  });
  const isAdminQuery = useIsAdminQuery(uuid);
  const isAdmin = isAdminQuery.data?.data.isAdmin ?? false;
  const [currentItem, setCurrentItem] = useState(0);

  const confirmBoxData = {
    title: "Deseja remover sua conta?",
    textBtn1: "Sim",
    textBtn2: "Não",
  };

  const componentsItens = [
    <MyTheme key="my-theme" />,
    <MyOwnResponses key="my-own-responses" />,
    <MyResponse key="my-response" />,
    <MyStatistics key="my-statistics" />,
    <MyStatisticConclusion key="my-statistic-conclusion" />,
    isAdmin && <Users key="users" />,
  ];

  const buttons = [
    { id: "btn-quiz", label: "Meus Temas", index: 0 },
    { id: "btn-my-response", label: "Minhas Respostas", index: 1 },
    { id: "btn-response", label: "Painel de Respostas", index: 2 },
    {
      id: "btn-statistic-response",
      label: "Estatísticas por Questão",
      index: 3,
    },
    {
      id: "btn-statistic-conclusion",
      label: "Estatísticas por Conclusão",
      index: 4,
    },
    ...(isAdmin ? [{ id: "btn-admin", label: "Usuários", index: 5 }] : []),
  ];

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

  function changeValueForPasswordBox(value: string, label: string) {
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
    const response = await updateUserMutation.mutateAsync({
      userId: uuid,
      userUpdate,
    });
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
    const response = await removeUserMutation.mutateAsync({ userId: uuid });
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
    const response = await updatePasswordMutation.mutateAsync({
      userId: uuid,
      userPassword,
    });
    if (!response.success) {
      activeInformationBox(true, response.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    activeInformationBox(false, "Senha atualizada com sucesso!");
    setPasswordBox(false);
  }

  function validatePassword(): PasswordValidation {
    const validAndMessage: PasswordValidation = {
      valid: true,
      message: "",
    };
    if (newPassword !== confirmNewPassword) {
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

  function activeInformationBox(isFail: boolean, message: string) {
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
    <Box sx={{ py: 4, minHeight: "100vh" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "3fr 9fr" },
          gap: 3,
        }}
      >
        <Card elevation={2} sx={{ alignSelf: "start", height: "fit-content" }}>
          {equippedBanner && (
            <Box className={bannerClassName(equippedBanner)} sx={{ height: 48 }} />
          )}
          <CardContent
            sx={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              mt: equippedBanner ? -6 : 0,
            }}
          >
            <FramedAvatar code={equippedFrame} size={96}>
              <BsPersonCircle size={80} color="#3f7fd6" />
            </FramedAvatar>
            {equippedTitle && (
              <Box>
                <TitleBadge code={equippedTitle} />
              </Box>
            )}
            <Typography
              sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "primary.main", fontWeight: "bold" }}
            >
              Curtidas: {likes} <BsHandThumbsUpFill />
            </Typography>
            <Typography
              sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "warning.main", fontWeight: "bold" }}
            >
              {coins} moedas <BsCoin />
            </Typography>
            <Typography variant="h6" sx={{ mb: 0, mt: -1 }}>
              {name}
            </Typography>
            <Typography color="text.secondary">{email}</Typography>
            <Box sx={{ width: "100%" }}>
              <Typography variant="body2" sx={{ fontWeight: "bold", color: "primary.main" }}>
                Nível {level}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={xpIntoLevel}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary">
                {xpIntoLevel}/100 XP
              </Typography>
            </Box>
            <Button
              variant="outlined"
              sx={{ width: "75%", borderRadius: 50 }}
              onClick={showUpdateBox}
            >
              Editar Perfil
            </Button>
            <Button
              variant="outlined"
              sx={{ width: "75%", borderRadius: 50 }}
              onClick={showPasswordBox}
            >
              Alterar Senha
            </Button>
            <Button
              variant="contained"
              color="error"
              sx={{ width: "75%", borderRadius: 50 }}
              onClick={showConfirmationBox}
            >
              Excluir Conta
            </Button>
          </CardContent>
        </Card>

        <Card elevation={2}>
          <CardContent>
            <Tabs
              value={currentItem}
              onChange={(_e, newValue) => setCurrentItem(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 3 }}
            >
              {buttons.map((button) => (
                <Tab key={button.id} label={button.label} />
              ))}
            </Tabs>
            <div>{componentsItens[currentItem]}</div>
          </CardContent>
        </Card>
      </Box>

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
    </Box>
  );
};

export default Profile;
