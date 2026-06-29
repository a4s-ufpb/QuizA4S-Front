import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Card, Container, Alert } from "react-bootstrap";
import Loading from "../loading/Loading";
import { AuthenticationContext } from "../../context/AuthenticationContext";
import { useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string } from "yup";
import { UserService } from "../../service/UserService";
import type { ApiResult, AuthResponse, FormField } from "../../types";

interface FormTemplateProps {
  title: string;
  fields: FormField[];
  buttonText: string;
  redirectText: string;
  redirectLink: string;
  isRegister: boolean;
}

type FormValues = {
  email: string;
  password: string;
  name?: string;
  confirmPassword?: string;
};

const FormTemplate = ({
  title,
  fields,
  buttonText,
  redirectText,
  redirectLink,
  isRegister,
}: FormTemplateProps) => {
  const [activeInformationBox, setInformationBox] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuthenticated } = useContext(AuthenticationContext);
  const userService = new UserService();

  const handleSubmit: SubmitHandler<FormValues> = async (formData) => {
    if (isInvalidPassword(formData)) return;

    setLoading(true);

    let response: ApiResult<AuthResponse>;
    if (isRegister) {
      response = (await userService.registerUser(
        formData
      )) as unknown as ApiResult<AuthResponse>;
      if (response.success) {
        response = await userService.loginUser({
          email: formData.email,
          password: formData.password,
        });
      }
    } else {
      response = await userService.loginUser(formData);
    }

    handleResponse(response);
  };

  const isInvalidPassword = (formData: FormValues) => {
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (isRegister && password !== confirmPassword) {
      setError("Senhas diferentes");
      setInformationBox(true);
      return true;
    }

    return false;
  };

  const closeInformationBox = () => {
    setInformationBox(false);
  };

  const handleResponse = (response: ApiResult<AuthResponse>) => {
    setLoading(false);

    if (!response.success) {
      setError(response.message);
      setInformationBox(true);
      return;
    }

    if (response.data.token) {
      window.localStorage.setItem("token", response.data.token);
      setAuthenticated(true);
      navigate("/");
    }
  };

  const requiredFieldMessage = "Campo obrigatório";
  const regexValidatedEmail =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const resolverSchema = object().shape({
    email: string()
      .required(requiredFieldMessage)
      .matches(regexValidatedEmail, "Email Inválido")
      .max(100, "Máximo de 100 caracteres"),
    password: string()
      .required(requiredFieldMessage)
      .min(8, "Mínimo de 8 caracteres")
      .max(20, "Máximo de 20 caracteres"),
    ...(isRegister && {
      name: string()
        .required(requiredFieldMessage)
        .min(3, "Mínimo de 3 caracteres")
        .max(30, "Máximo de 30 caracteres"),
      confirmPassword: string()
        .required(requiredFieldMessage)
        .min(8, "Mínimo de 8 caracteres")
        .max(20, "Máximo de 20 caracteres"),
    }),
  });

  const {
    register,
    handleSubmit: onSubmit,
    formState: { errors },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<FormValues>({ resolver: yupResolver(resolverSchema) as any });

  return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <Card className="shadow-sm w-100" style={{ maxWidth: "400px" }}>
        <Card.Body className="p-4">
          <h1 className="text-center mb-4">{title}</h1>

          <Form onSubmit={onSubmit(handleSubmit)}>
            {fields.map((field) => (
              <Form.Group key={field.name} className="mb-3">
                <Form.Label>{field.label}</Form.Label>
                <Form.Control
                  type={field.type}
                  placeholder={field.placeholder}
                  {...register(field.name as keyof FormValues)}
                  isInvalid={!!errors[field.name as keyof FormValues]}
                />
                <Form.Control.Feedback type="invalid">
                  {errors[field.name as keyof FormValues]?.message}
                </Form.Control.Feedback>
              </Form.Group>
            ))}

            {loading && <Loading />}

            {activeInformationBox && (
              <Alert variant="danger" onClose={closeInformationBox} dismissible>
                {error}
              </Alert>
            )}

            <Button
              variant="primary"
              type="submit"
              className="w-100 mb-3"
              disabled={loading}
            >
              {buttonText}
            </Button>

            <div className="text-center">
              <Link to={redirectLink} className="text-decoration-none">
                {redirectText}
              </Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default FormTemplate;
