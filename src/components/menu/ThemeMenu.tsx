import { useState, type ChangeEvent } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import { BsCloudUpload, BsXLg } from "react-icons/bs";
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
}

const MAX_THEME_IMAGE_SIZE_BYTES = 1 * 1024 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const ThemeMenu = ({ setThemeMenu }: ThemeMenuProps) => {
  const insertThemeMutation = useInsertThemeMutation();
  const navigate = useNavigate();

  const [informationBox, setInformationBox] = useState(false);
  const [searchImage, setSearchImage] = useState(false);
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");
  const [imageUrl, setImageUrl] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [informationData, setInformationData] = useState<InformationData>({
    text: "",
    color: "",
    icon: "",
  });

  const schema = object().shape({
    name: string()
      .required("Campo obrigatório")
      .min(3, "Mínimo de 3 caracteres")
      .max(70, "Máximo de 70 caracteres"),
  });

  const {
    register,
    handleSubmit: onSubmit,
    formState: { errors },
  } = useForm<ThemeFormData>({ resolver: yupResolver(schema) });

  function activeInformationBox(isError: boolean, message: string) {
    setInformationData({
      text: message,
      color: isError ? "red" : "green",
      icon: isError ? "exclamation" : "check",
    });
    setInformationBox(true);
  }

  // Um tema só tem 1 imagem — trocar de modo (URL x upload) limpa a outra opção.
  function handleModeChange(_: unknown, next: "url" | "upload" | null) {
    if (!next) return;
    setImageMode(next);
    setImageUrl("");
    setUploadedFileName(null);
  }

  function getUrlOfImage(url: string) {
    setImageUrl(url);
    setSearchImage(false);
  }

  async function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > MAX_THEME_IMAGE_SIZE_BYTES) {
      activeInformationBox(true, "A imagem deve ter no máximo 1MB");
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    setImageUrl(dataUrl);
    setUploadedFileName(file.name);
  }

  function removeImage() {
    setImageUrl("");
    setUploadedFileName(null);
  }

  function navigateCreateQuestion(theme: Theme) {
    sessionStorage.setItem("theme", JSON.stringify(theme));
    navigate(`/create/quiz/${theme.id}/question`);
  }

  const handleSubmit: SubmitHandler<ThemeFormData> = async (formData) => {
    const response = await insertThemeMutation.mutateAsync({
      name: formData.name,
      imageUrl,
    });
    if (response.success) {
      activeInformationBox(false, "Tema criado com sucesso");
      navigateCreateQuestion(response.data);
    } else {
      activeInformationBox(true, response.message);
    }
  };

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

          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Imagem do tema
            </Typography>
            <ToggleButtonGroup
              value={imageMode}
              exclusive
              size="small"
              onChange={handleModeChange}
              sx={{ mb: 2 }}
            >
              <ToggleButton value="url">Por URL</ToggleButton>
              <ToggleButton value="upload">Upload</ToggleButton>
            </ToggleButtonGroup>

            {imageMode === "url" && (
              <TextField
                label="Imagem"
                placeholder="Digite ou pesquise a URL da imagem"
                fullWidth
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                slotProps={{
                  input: {
                    endAdornment: (
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ whiteSpace: "nowrap" }}
                        onClick={() => setSearchImage(true)}
                      >
                        Pesquisar
                      </Button>
                    ),
                  },
                }}
              />
            )}

            {imageMode === "upload" && (
              <Button
                component="label"
                variant="outlined"
                startIcon={<BsCloudUpload />}
                fullWidth
              >
                {uploadedFileName ?? "Selecionar imagem (máx. 1MB)"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileUpload}
                />
              </Button>
            )}

            {imageUrl && (
              <Box sx={{ position: "relative", mt: 2, width: "fit-content" }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                  Preview
                </Typography>
                <Box
                  component="img"
                  src={imageUrl}
                  alt="preview do tema"
                  sx={{
                    width: 160,
                    height: 100,
                    objectFit: "cover",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                />
                <IconButton
                  size="small"
                  onClick={removeImage}
                  sx={{
                    position: "absolute",
                    top: 18,
                    right: -10,
                    bgcolor: "background.paper",
                    boxShadow: 1,
                    "&:hover": { bgcolor: "background.paper" },
                  }}
                >
                  <BsXLg size={12} />
                </IconButton>
              </Box>
            )}
          </Box>

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
