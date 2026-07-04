import { useState, type Dispatch, type SetStateAction } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  IconButton,
  Select,
  MenuItem,
  type SelectChangeEvent,
} from "@mui/material";
import { BsTrashFill, BsPencilSquare } from "react-icons/bs";
import ConfirmBox from "../confirmBox/ConfirmBox";
import UpdateBox from "../updateBox/UpdateBox";
import Loading from "../loading/Loading";
import InformationBox from "../informationBox/InformationBox";
import {
  useRemoveUserMutation,
  useUpdatePasswordMutation,
  useUpdateUserMutation,
  useUpdateUserRoleMutation,
} from "../../query/useUserQueries";

import type { InformationData, Role, User } from "../../types";

interface UserTemplateProps {
  users: User[];
  setUsers: Dispatch<SetStateAction<User[]>>;
  setCurrentPage: Dispatch<SetStateAction<number>>;
}

interface PasswordValidation {
  valid: boolean;
  message: string;
}

function UserTemplate({ users, setUsers, setCurrentPage }: UserTemplateProps) {
  const removeUserMutation = useRemoveUserMutation();
  const updateUserRoleMutation = useUpdateUserRoleMutation();
  const updateUserMutation = useUpdateUserMutation();
  const updatePasswordMutation = useUpdatePasswordMutation();

  const [isConfirmBox, setConfirmBox] = useState(false);
  const [isUpdateBox, setUpdateBox] = useState(false);
  const [isInformationBox, setInformationBox] = useState(false);

  const loading =
    removeUserMutation.isPending ||
    updateUserRoleMutation.isPending ||
    updateUserMutation.isPending ||
    updatePasswordMutation.isPending;

  const [informationData, setInformationData] = useState<InformationData>({
    text: "",
    icon: "",
    color: "",
  });

  const [userId, setUserId] = useState("");
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

  function showConfirmBox(id: string, name: string, email: string) {
    setUserId(id);
    setNewName(name);
    setNewEmail(email);
    setConfirmBox(true);
  }

  function showUpdateBox(id: string, name: string, email: string) {
    setUserId(id);
    setNewName(name);
    setNewEmail(email);
    setUpdateBox(true);
  }

  async function removeUser() {
    const response = await removeUserMutation.mutateAsync({
      userId,
      isAdmin: true,
    });

    if (!response.success) {
      activeInformationBox(true, response.message);
      return;
    }

    setUsers(users.filter((user) => userId !== user.uuid));
    setCurrentPage(0);
    activeInformationBox(false, "Usuário removido com sucesso!");
    setConfirmBox(false);
  }

  async function changeRole(id: string, role: Role) {
    const response = await updateUserRoleMutation.mutateAsync({ userId: id, role });

    if (!response.success) {
      activeInformationBox(true, response.message);
      return;
    }

    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.uuid === id ? { ...user, role } : user))
    );
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
    try {
      const responseUserUpdate = await updateUserMutation.mutateAsync({
        userId,
        userUpdate: newUser,
      });

      if (!responseUserUpdate.success) {
        activeInformationBox(true, responseUserUpdate.message);
        return;
      }

      let responseUserPassword = { success: true, message: "" };

      if (newPassword && confirmNewPassword) {
        const validatePasswordResponse = validatePassword(
          newPassword,
          confirmNewPassword
        );

        if (!validatePasswordResponse.valid) {
          activeInformationBox(true, validatePasswordResponse.message);
          return;
        }

        responseUserPassword = await updatePasswordMutation.mutateAsync({
          userId,
          userPassword,
        });

        if (!responseUserPassword.success) {
          activeInformationBox(true, responseUserPassword.message);
          return;
        }
      }

      activeInformationBox(false, "Usuário atualizado com sucesso");
      setUpdateBox(false);
    } catch (error) {
      activeInformationBox(true, "Erro ao atualizar usuário. Tente novamente.");
    }
  }

  function validatePassword(
    newPassword: string,
    confirmNewPassword: string
  ): PasswordValidation {
    const validAndMessage: PasswordValidation = {
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

  function activeInformationBox(isFail: boolean, message: string) {
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

  function changeValue(value: string, label: string) {
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
    <TableContainer component={Paper} sx={{ width: "100%", mt: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Cargo</TableCell>
            <TableCell align="center">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users &&
            users.map((user) => (
              <TableRow key={user.uuid} hover>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Select
                    size="small"
                    value={user.role ?? "USER"}
                    onChange={(e: SelectChangeEvent) =>
                      changeRole(user.uuid, e.target.value as Role)
                    }
                    sx={{ minWidth: 130 }}
                  >
                    <MenuItem value="ADMIN">ADMIN</MenuItem>
                    <MenuItem value="USER">USUÁRIO</MenuItem>
                  </Select>
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    color="primary"
                    onClick={() => showUpdateBox(user.uuid, user.name, user.email)}
                    title="Editar usuário"
                  >
                    <BsPencilSquare />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => showConfirmBox(user.uuid, user.name, user.email)}
                    title="Remover usuário"
                  >
                    <BsTrashFill />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

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
    </TableContainer>
  );
}

export default UserTemplate;
