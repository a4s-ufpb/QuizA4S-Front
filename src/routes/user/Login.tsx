import FormTemplate from "../../components/formTemplate/FormTemplate";
import type { FormField } from "../../types";

const fields: FormField[] = [
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "Digite seu email",
  },
  {
    name: "password",
    label: "Senha",
    type: "password",
    placeholder: "Digite sua senha",
  },
];

const Login = () => {
  return (
    <FormTemplate
      title="Login"
      buttonText="Entrar"
      redirectText="Ainda não possui uma conta? Clique aqui!"
      redirectLink="/register"
      fields={fields}
      isRegister={false}
    />
  );
};

export default Login;
