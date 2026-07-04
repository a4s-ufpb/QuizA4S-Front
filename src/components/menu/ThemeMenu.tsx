import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  InputAdornment,
  Stack,
} from "@mui/material";
import Loading from "../loading/Loading";
import InformationBox from "../informationBox/InformationBox";
import { useNavigate } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useInsertThemeMutation } from "../../query/useThemeQueries";
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
  const insertThemeMutation = useInsertThemeMutation();
  const navigate = useNavigate();

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

    const response = await insertThemeMutation.mutateAsync(themeRequest);
    if (response.success) {
      activateInformationBox(false, "Tema criado com sucesso");
      navigateCreateQuestion(response.data);
    } else {
      activateInformationBox(true, response.message);
    }
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
    <Dialog open={true} onClose={() => setThemeMenu(false)} fullWidth maxWidth="md">
      <DialogTitle>Criar tema</DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          onSubmit={onSubmit(handleSubmit)}
          spacing={3}
          sx={{ mt: 1 }}
        >
          <TextField
            label="Nome"
            placeholder="Digite o nome do seu tema"
            slotProps={{ htmlInput: { maxLength: 70 } }}
            error={!!errors.name}
            helperText={errors?.name?.message}
            fullWidth
            {...register("name")}
          />

          <TextField
            id="input-image-url"
            label="Imagem"
            placeholder="Digite ou Pesquise a URL da imagem"
            error={!!errors.imageUrl}
            helperText={errors?.imageUrl?.message}
            fullWidth
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Button
                      variant="outlined"
                      onClick={() => setSearchImage(true)}
                    >
                      Pesquisar Imagem
                    </Button>
                  </InputAdornment>
                ),
              },
            }}
            {...register("imageUrl")}
          />

          <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              color="error"
              onClick={() => setThemeMenu(false)}
            >
              Cancelar
            </Button>
            <Button variant="contained" type="submit">
              Criar
            </Button>
          </Stack>
        </Stack>
      </DialogContent>

      {informationBox && (
        <InformationBox
          text={informationData.text}
          color={informationData.color}
          icon={informationData.icon}
          closeBox={() => setInformationBox(false)}
        />
      )}

      {insertThemeMutation.isPending && <Loading />}

      {searchImage && (
        <SearchImage
          setSearchImage={setSearchImage}
          getUrlOfImage={getUrlOfImage}
        />
      )}
    </Dialog>
  );
};

export default ThemeMenu;
