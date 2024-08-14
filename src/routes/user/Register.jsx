import FormTemplate from "../../components/formTemplate/FormTemplate.jsx";

const fields = [
  { 
    name: "name",
    label: "Nome",
    type: "text",
    placeholder: "Digite seu nome"
  },
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
  {
    name: "confirmPassword",
    label: "Confirmar senha",
    type: "password",
    placeholder: "Digite novamente sua senha",
  },
];

const Register = () => {
  return (
    <FormTemplate
      title="Criar conta"
      buttonText="Criar conta"
      redirectText="Já possui uma conta? Clique aqui!"
      redirectLink="/login"
      fields={fields}
      baseUrl="/user/register"
      isRegister={true}
    />
  );
};

export default Register;
