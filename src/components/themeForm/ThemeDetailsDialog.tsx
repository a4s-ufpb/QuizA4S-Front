import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Stack,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  BsBoxArrowUpRight,
  BsPlayFill,
  BsHeart,
  BsHeartFill,
  BsChatDotsFill,
} from "react-icons/bs";
import { DEFAULT_IMG } from "../../vite-env";
import { materialTypeIcon } from "./ThemeFormDialog";
import ThemeFeedbackModal from "../feedback/ThemeFeedbackModal";
import {
  useLikeThemeMutation,
  useUnlikeThemeMutation,
} from "../../query/useThemeQueries";
import type { MaterialType, Theme } from "../../types";

interface ThemeDetailsDialogProps {
  theme: Theme | null;
  onClose: () => void;
  onPlay?: () => void;
  playLabel?: string;
}

const TYPE_LABEL: Record<MaterialType, string> = {
  VIDEO: "Vídeo",
  FILE: "Arquivo",
  SITE: "Site",
};

const ThemeDetailsDialog = ({
  theme,
  onClose,
  onPlay,
  playLabel = "Jogar",
}: ThemeDetailsDialogProps) => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const likeMut = useLikeThemeMutation();
  const unlikeMut = useUnlikeThemeMutation();

  if (!theme) return null;
  const materials = theme.materials ?? [];
  const tags = theme.tags ?? [];
  const isAuth = Boolean(localStorage.getItem("token"));
  const liked = !!theme.likedByMe;

  function toggleLike() {
    if (!isAuth) return;
    if (liked) unlikeMut.mutate(theme!.id);
    else likeMut.mutate(theme!.id);
  }

  return (
    <>
      <Dialog open onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>{theme.name}</DialogTitle>
        <DialogContent>
          <Box
            component="img"
            src={theme.imageUrl || DEFAULT_IMG}
            alt={theme.name}
            sx={{
              width: "100%",
              maxHeight: 220,
              objectFit: "cover",
              borderRadius: 2,
              mb: 2,
            }}
          />

          <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: "center" }}>
            <Tooltip title={isAuth ? (liked ? "Descurtir" : "Curtir") : "Faça login para curtir"}>
              <span>
                <IconButton
                  onClick={toggleLike}
                  color={liked ? "error" : "default"}
                  disabled={!isAuth}
                >
                  {liked ? <BsHeartFill /> : <BsHeart />}
                </IconButton>
              </span>
            </Tooltip>
            <Typography variant="body2">{theme.likeCount ?? 0} gostei</Typography>
            <Box sx={{ flex: 1 }} />
            <Button
              size="small"
              startIcon={<BsChatDotsFill />}
              onClick={() => setFeedbackOpen(true)}
            >
              Ver feedbacks
            </Button>
          </Stack>

          {tags.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
              {tags.map((t) => (
                <Chip key={t.id} label={t.name} size="small" />
              ))}
            </Stack>
          )}

          <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
            Conteúdos
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, whiteSpace: "pre-wrap" }}
          >
            {theme.description?.trim()
              ? theme.description
              : "Este tema não possui uma descrição de conteúdos."}
          </Typography>

          <Divider sx={{ mb: 1 }} />

          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
            Materiais de apoio
          </Typography>
          {materials.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nenhum material disponível para este tema.
            </Typography>
          ) : (
            <List dense disablePadding>
              {materials.map((material, i) => (
                <ListItemButton
                  key={material.id ?? i}
                  component="a"
                  href={material.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ borderRadius: 1 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {materialTypeIcon(material.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={material.name}
                    secondary={TYPE_LABEL[material.type]}
                  />
                  <BsBoxArrowUpRight />
                </ListItemButton>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button color="secondary" onClick={onClose}>
            Fechar
          </Button>
          {onPlay && (
            <Button variant="contained" startIcon={<BsPlayFill />} onClick={onPlay}>
              {playLabel}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {feedbackOpen && (
        <ThemeFeedbackModal
          themeId={theme.id}
          themeName={theme.name}
          onClose={() => setFeedbackOpen(false)}
        />
      )}
    </>
  );
};

export default ThemeDetailsDialog;
