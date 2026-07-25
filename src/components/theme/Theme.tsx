import { useState, type Dispatch, type SetStateAction } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { BsTrashFill, BsPencilSquare, BsHeartFill, BsTagFill, BsEye } from "react-icons/bs";
import ConfirmBox from "../confirmBox/ConfirmBox";
import Loading from "../loading/Loading";
import InformationBox from "../informationBox/InformationBox";
import ThemeFormDialog, {
  type ThemeFormValues,
} from "../themeForm/ThemeFormDialog";
import ThemeDetailsDialog from "../themeForm/ThemeDetailsDialog";
import TagManageModal from "../tags/TagManageModal";
import { DEFAULT_IMG } from "../../vite-env";
import { useNavigate } from "react-router-dom";
import {
  useRemoveThemeMutation,
  useUpdateThemeMutation,
} from "../../query/useThemeQueries";

import NotFoundComponent from "../notFound/NotFoundComponent";
import type { InformationData, Theme as ThemeModel } from "../../types";
import { setStoredTheme } from "../../util/storage";

interface ThemeProps {
  themes: ThemeModel[];
  setThemes: Dispatch<SetStateAction<ThemeModel[]>>;
  setCurrentPage: Dispatch<SetStateAction<number>>;
}

const Theme = ({ themes, setThemes, setCurrentPage }: ThemeProps) => {
  const removeThemeMutation = useRemoveThemeMutation();
  const updateThemeMutation = useUpdateThemeMutation();

  const navigate = useNavigate();

  const loading = removeThemeMutation.isPending || updateThemeMutation.isPending;

  const [isConfirmBox, setConfirmBox] = useState(false);
  const [isInformationBox, setInformationBox] = useState(false);
  const [editingTheme, setEditingTheme] = useState<ThemeModel | null>(null);
  const [detailsTheme, setDetailsTheme] = useState<ThemeModel | null>(null);
  const [themeId, setThemeId] = useState(0);
  const [tagModalOpen, setTagModalOpen] = useState(false);

  const [informationData, setInformationData] = useState<InformationData>({
    text: "",
    icon: "",
    color: "",
  });

  function showConfirmBox(id: number) {
    setThemeId(id);
    setConfirmBox(true);
  }

  async function removeTheme() {
    const response = await removeThemeMutation.mutateAsync(themeId);
    if (!response.success) {
      activeInformationBox(true, response.message);
      return;
    }
    setThemes(themes.filter((t) => themeId !== t.id));
    setCurrentPage(0);
    activeInformationBox(false, "Tema removido com sucesso!");
    setConfirmBox(false);
  }

  async function updateTheme(values: ThemeFormValues) {
    if (!editingTheme) return;
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("description", values.description ?? "");
    formData.append("materials", JSON.stringify(values.materials));
    formData.append("tagIds", JSON.stringify(values.tags.map((t) => t.id)));
    if (values.imageFile) {
      formData.append("imageFile", values.imageFile);
    } else if (values.imageUrl) {
      formData.append("imageUrl", values.imageUrl);
    }

    const response = await updateThemeMutation.mutateAsync({
      themeId: editingTheme.id,
      formData,
    });

    if (!response.success) {
      activeInformationBox(true, response.message);
      return;
    }

    setThemes(
      themes.map((t) => (t.id === editingTheme.id ? response.data : t))
    );
    activeInformationBox(false, "Tema atualizado com sucesso");
    setEditingTheme(null);
  }

  function activeInformationBox(isFail: boolean, message: string) {
    setInformationData({
      text: message,
      color: isFail ? "red" : "green",
      icon: isFail ? "exclamation" : "check",
    });
    setInformationBox(true);
  }

  function showQuestions(id: number, name: string, imageUrl: string) {
    const theme = { id, name, imageUrl };
    setStoredTheme(theme);
    navigate(`/profile/theme/${id}/question`);
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Stack direction="row" sx={{ mb: 2, justifyContent: "flex-end" }}>
        <Button
          variant="outlined"
          startIcon={<BsTagFill />}
          onClick={() => setTagModalOpen(true)}
        >
          Gerenciar Tags
        </Button>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "1fr 1fr",
            md: "1fr 1fr 1fr",
          },
          gap: 2,
        }}
      >
        {themes.map((theme) => (
          <Card key={theme.id} elevation={2}>
            <CardMedia
              component="img"
              image={theme.imageUrl || DEFAULT_IMG}
              alt={theme.name}
              sx={{ height: 160, objectFit: "cover" }}
            />
            <CardContent>
              <Typography variant="h6" gutterBottom noWrap>
                {theme.name}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: "center" }}>
                <Tooltip title="Gostei">
                  <Chip
                    icon={<BsHeartFill color="#e74c3c" />}
                    label={theme.likeCount ?? 0}
                    size="small"
                  />
                </Tooltip>
                {(theme.tags ?? []).slice(0, 3).map((t) => (
                  <Chip key={t.id} label={t.name} size="small" variant="outlined" />
                ))}
              </Stack>
            </CardContent>
            <CardActions sx={{ justifyContent: "space-between" }}>
              <Stack direction="row">
                <Tooltip title="Ver detalhes">
                  <IconButton onClick={() => setDetailsTheme(theme)}>
                    <BsEye />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Editar">
                  <IconButton onClick={() => setEditingTheme(theme)}>
                    <BsPencilSquare />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Remover">
                  <IconButton color="error" onClick={() => showConfirmBox(theme.id)}>
                    <BsTrashFill />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Button
                size="small"
                variant="contained"
                onClick={() => showQuestions(theme.id, theme.name, theme.imageUrl)}
              >
                Questões
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>

      {!loading && themes.length == 0 && (
        <NotFoundComponent title="Nenhum tema encontrado" />
      )}

      {isConfirmBox && (
        <ConfirmBox
          title="Deseja remover este tema?"
          textBtn1="Sim"
          textBtn2="Não"
          onClickBtn1={removeTheme}
          onClickBtn2={() => setConfirmBox(false)}
        />
      )}

      {editingTheme && (
        <ThemeFormDialog
          title="Atualizar tema"
          submitLabel="Salvar"
          loading={updateThemeMutation.isPending}
          initial={{
            name: editingTheme.name,
            imageUrl: editingTheme.imageUrl,
            description: editingTheme.description ?? "",
            materials: editingTheme.materials ?? [],
            tags: editingTheme.tags ?? [],
          }}
          onClose={() => setEditingTheme(null)}
          onSubmit={updateTheme}
        />
      )}

      <ThemeDetailsDialog
        theme={detailsTheme}
        onClose={() => setDetailsTheme(null)}
      />

      <TagManageModal open={tagModalOpen} onClose={() => setTagModalOpen(false)} />

      {isInformationBox && (
        <InformationBox
          text={informationData.text}
          color={informationData.color}
          icon={informationData.icon}
          closeBox={() => setInformationBox(false)}
        />
      )}

      {loading && <Loading />}
    </Box>
  );
};

export default Theme;
