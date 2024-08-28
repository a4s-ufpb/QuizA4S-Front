import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import InformationBox from "../informationBox/InformationBox";
import Loading from "../loading/Loading";
import { AuthenticationContext } from "../../context/AuthenticationContext";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string } from "yup";
import { UserService } from "../../service/UserService.js";

import "./FormTemplate.css";

const FormTemplate = ({
  title,
  fields,
  buttonText,
  redirectText,
  redirectLink,
  isRegister,
}) => {
  const [activeInformationBox, setInformationBox] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuthenticated } = useContext(AuthenticationContext);
  const userService = new UserService();

  const handleSubmit = async (formData) => {
    if (isInvalidPassword(formData)) return;

    setLoading(true);

    let response;
    if (isRegister) {
      response = await userService.registerUser(formData);
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

  const isInvalidPassword = (formData) => {
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

  const handleResponse = (response) => {
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
  } = useForm({ resolver: yupResolver(resolverSchema) });

  return (
    <div className="container">
      <form onSubmit={onSubmit(handleSubmit)} className="form">
        <h1>{title}</h1>

        {fields.map((field) => (
          <label key={field.name} className="container-input">
            <span className="container-input-label">{field.label}:</span>
            <input
              type={field.type}
              placeholder={field.placeholder}
              {...register(field.name)}
            />
            <span className="span-error-message">
              {errors?.[field.name]?.message}
            </span>
          </label>
        ))}

        {loading && <Loading />}

        {activeInformationBox && (
          <InformationBox
            text={error}
            closeBox={closeInformationBox}
            icon="exclamation"
            color="red"
          />
        )}

        <button type="submit" className="btn">
          {buttonText}
        </button>
        <Link to={redirectLink} className="anchor">
          <p>{redirectText}</p>
        </Link>
      </form>
    </div>
  );
};

export default FormTemplate;