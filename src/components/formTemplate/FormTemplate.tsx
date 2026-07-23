import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Alert,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import Loading from "../loading/Loading";
import { AuthenticationContext } from "../../context/AuthenticationContext";
import { useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string } from "yup";
import {
  useLoginUserMutation,
  useRegisterUserMutation,
} from "../../query/useUserQueries";
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
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  function togglePassword(fieldName: string) {
    setShowPasswords((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
  }
  const navigate = useNavigate();
  const { setAuthenticated } = useContext(AuthenticationContext);
  const registerUserMutation = useRegisterUserMutation();
  const loginUserMutation = useLoginUserMutation();

  const handleSubmit: SubmitHandler<FormValues> = async (formData) => {
    if (isInvalidPassword(formData)) return;

    setLoading(true);

    let response: ApiResult<AuthResponse>;
    if (isRegister) {
      response = (await registerUserMutation.mutateAsync(
        formData
      )) as unknown as ApiResult<AuthResponse>;
      if (response.success) {
        response = await loginUserMutation.mutateAsync({
          email: formData.email,
          password: formData.password,
        });
      }
    } else {
      response = await loginUserMutation.mutateAsync(formData);
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
  } = useForm<FormValues>({ resolver: yupResolver(resolverSchema) as any });

  return (
    <Container
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Card elevation={3} sx={{ width: "100%", maxWidth: 400 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" align="center" sx={{ mb: 3 }}>
            {title}
          </Typography>

          <Box component="form" onSubmit={onSubmit(handleSubmit)}>
            {fields.map((field) => {
              const isPassword = field.type === "password";
              return (
                <TextField
                  key={field.name}
                  type={isPassword && showPasswords[field.name] ? "text" : field.type}
                  label={field.label}
                  placeholder={field.placeholder}
                  fullWidth
                  margin="normal"
                  error={!!errors[field.name as keyof FormValues]}
                  helperText={errors[field.name as keyof FormValues]?.message}
                  slotProps={isPassword ? {
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => togglePassword(field.name)} edge="end" tabIndex={-1}>
                            {showPasswords[field.name] ? <BsEyeSlash /> : <BsEye />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  } : undefined}
                  {...register(field.name as keyof FormValues)}
                />
              );
            })}

            {loading && <Loading />}

            {activeInformationBox && (
              <Alert severity="error" onClose={closeInformationBox} sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              variant="contained"
              type="submit"
              fullWidth
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {buttonText}
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <Link to={redirectLink} style={{ textDecoration: "none" }}>
                {redirectText}
              </Link>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default FormTemplate;
