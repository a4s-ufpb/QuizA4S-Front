import { useState } from "react";
import { Modal, Form, Button, InputGroup } from "react-bootstrap";
import Loading from "../loading/Loading";
import InformationBox from "../informationBox/InformationBox";
import { useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { ThemeService } from "../../service/ThemeService";
import SearchImage from "../searchImageComponent/SearchImage";
import type { InformationData, Theme } from "../../types";

interface ThemeMenuProps {
  setThemeMenu: (value: boolean) => void;
}

interface ThemeFormData {
  name: string;
  imageUrl?: string;
}

const ThemeMenu = ({ setThemeMenu }: ThemeMenuProps) => {
  const themeService = new ThemeService();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [informationBox, setInformationBox] = useState(false);
  const [searchImage, setSearchImage] = useState(false);
  const [informationData, setInformationData] = useState<InformationData>({
    text: "",
    color: "",
    icon: "",
  });

  function getUrlOfImage(imageUrl: string) {
    const inputImageUrl = document.getElementById(
      "input-image-url"
    ) as HTMLInputElement;
    inputImageUrl.value = imageUrl;
    setSearchImage(false);
  }

  const schema = object().shape({
    name: string()
      .required("Campo obrigatório")
      .min(3, "Mínimo de 3 caracteres")
      .max(70, "Máximo de 70 caracteres"),
    imageUrl: string().url("URL inválida"),
  });

  const {
    register,
    handleSubmit: onSubmit,
    formState: { errors },
  } = useForm<ThemeFormData>({ resolver: yupResolver(schema) });

  const handleSubmit: SubmitHandler<ThemeFormData> = async (themeRequest) => {
    const inputImageUrl = document.getElementById(
      "input-image-url"
    ) as HTMLInputElement;
    themeRequest.imageUrl = inputImageUrl.value;
    setLoading(true);

    const response = await themeService.insertTheme(themeRequest);
    if (response.success) {
      activateInformationBox(false, "Tema criado com sucesso");
      navigateCreateQuestion(response.data);
    } else {
      activateInformationBox(true, response.message);
    }

    setLoading(false);
  };

  function activateInformationBox(isError: boolean, message: string) {
    setInformationData({
      text: message,
      color: isError ? "red" : "green",
      icon: isError ? "exclamation" : "check",
    });
    setInformationBox(true);
  }

  function navigateCreateQuestion(theme: Theme) {
    localStorage.setItem("theme", JSON.stringify(theme));
    navigate(`/create/quiz/${theme.id}/question`);
  }

  return (
    <Modal show={true} onHide={() => setThemeMenu(false)} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Criar tema</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit(handleSubmit)}>
          <Form.Group className="mb-3">
            <Form.Label>Nome:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Digite o nome do seu tema"
              maxLength={70}
              {...register("name")}
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">
              {errors?.name?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Imagem:</Form.Label>
            <InputGroup>
              <Form.Control
                id="input-image-url"
                type="text"
                placeholder="Digite ou Pesquise a URL da imagem"
                {...register("imageUrl")}
                isInvalid={!!errors.imageUrl}
              />
              <Button
                variant="outline-primary"
                onClick={() => setSearchImage(true)}
              >
                Pesquisar Imagem
              </Button>
              <Form.Control.Feedback type="invalid">
                {errors?.imageUrl?.message}
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="danger" onClick={() => setThemeMenu(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Criar
            </Button>
          </div>
        </Form>
      </Modal.Body>

      {informationBox && (
        <InformationBox
          text={informationData.text}
          color={informationData.color}
          icon={informationData.icon}
          closeBox={() => setInformationBox(false)}
        />
      )}

      {loading && <Loading />}

      {searchImage && (
        <SearchImage
          setSearchImage={setSearchImage}
          getUrlOfImage={getUrlOfImage}
        />
      )}
    </Modal>
  );
};

export default ThemeMenu;
