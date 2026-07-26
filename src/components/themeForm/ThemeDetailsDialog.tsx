import { useEffect, useState } from "react";
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
  ToggleButton,
  ToggleButtonGroup,
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
import { useLikeThemeMutation } from "../../query/useThemeQueries";
import { APP_TOKEN_KEY } from "../../util/token";
import type { MaterialType, Theme } from "../../types";

interface ThemeDetailsDialogProps {
  theme: Theme | null;
  onClose: () => void;
  onPlay?: () => void;
  playLabel?: string;
  /** Notifica o pai quando algo relevante muda (like) pra refetch da listagem. */
  onChanged?: () => void;
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
  onChanged,
}: ThemeDetailsDialogProps) => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [optimisticLiked, setOptimisticLiked] = useState(false);
  const likeMut = useLikeThemeMutation();

  const explanationSetting = "quiz:showExplanation";
  const [explanationEnabled, setExplanationEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    const s = localStorage.getItem(explanationSetting);
    return s === null ? true : s === "true";
  });

  useEffect(() => {
    setOptimisticLiked(false);
  }, [theme?.id]);

  if (!theme) return null;
  const materials = theme.materials ?? [];
  const tags = theme.tags ?? [];
  const isAuth = Boolean(localStorage.getItem(APP_TOKEN_KEY));
  const liked = optimisticLiked || !!theme.likedByMe;
  const count = (theme.likeCount ?? 0) + (optimisticLiked && !theme.likedByMe ? 1 : 0);

  async function handleLike() {
    if (!isAuth || liked || likeMut.isPending) return;
    const res = await likeMut.mutateAsync(theme!.id);
    if (res.success) {
      setOptimisticLiked(true);
      onChanged?.();
    }
  }

  function toggleExplanation() {
    setExplanationEnabled((prev) => {
      const next = !prev;
      localStorage.setItem(explanationSetting, String(next));
      return next;
    });
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

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              mb: 2,
              alignItems: { xs: "stretch", sm: "flex-start" },
              justifyContent: "space-between",
            }}
          >
            {/* Gostei */}
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Tooltip title={!isAuth ? "Faça login para curtir" : liked ? "Você já curtiu este tema" : "Curtir"}>
                <span>
                  <IconButton
                    onClick={handleLike}
                    color={liked ? "error" : "default"}
                    disabled={!isAuth || liked || likeMut.isPending}
                  >
                    {liked ? <BsHeartFill /> : <BsHeart />}
                  </IconButton>
                </span>
              </Tooltip>
              <Typography variant="body2">{count} gostei</Typography>
            </Stack>

            {/* Modo de explicação: label + ? em cima, toggle SIM/NÃO embaixo */}
            <Stack spacing={0.5} sx={{ alignItems: { xs: "flex-start", sm: "center" } }}>
              <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                <Typography variant="body2">Modo de explicação</Typography>
                <Tooltip title="Se ativado, ao errar uma questão o quiz pausa e exibe a explicação da resposta correta. Você pode ler com calma e clicar em 'Entendi' para continuar.">
                  <IconButton size="small">
                    <span style={{ fontWeight: "bold", fontSize: 14 }}>?</span>
                  </IconButton>
                </Tooltip>
              </Stack>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={explanationEnabled ? "sim" : "nao"}
                onChange={(_e, val) => {
                  if (val != null && (val === "sim") !== explanationEnabled) toggleExplanation();
                }}
              >
                <ToggleButton
                  value="sim"
                  sx={{
                    px: 2,
                    fontWeight: 700,
                    "&.Mui-selected": { bgcolor: "success.main", color: "#fff", "&:hover": { bgcolor: "success.dark" } },
                  }}
                >
                  SIM
                </ToggleButton>
                <ToggleButton
                  value="nao"
                  sx={{
                    px: 2,
                    fontWeight: 700,
                    "&.Mui-selected": { bgcolor: "error.main", color: "#fff", "&:hover": { bgcolor: "error.dark" } },
                  }}
                >
                  NÃO
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            {/* Ver feedbacks */}
            <Stack direction="row" sx={{ alignItems: "center" }}>
              <Button
                size="small"
                startIcon={<BsChatDotsFill />}
                onClick={() => setFeedbackOpen(true)}
              >
                Ver feedbacks
              </Button>
            </Stack>
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
          <Box
            sx={{ mb: 2, color: "text.secondary", "& p": { m: 0 } }}
            dangerouslySetInnerHTML={{
              __html: theme.description?.trim()
                ? theme.description
                : "Este tema não possui uma descrição de conteúdos.",
            }}
          />

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
