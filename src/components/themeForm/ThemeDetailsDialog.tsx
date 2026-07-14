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
} from "@mui/material";
import { BsBoxArrowUpRight, BsPlayFill } from "react-icons/bs";
import { DEFAULT_IMG } from "../../vite-env";
import { materialTypeIcon } from "./ThemeFormDialog";
import type { MaterialType, Theme } from "../../types";

interface ThemeDetailsDialogProps {
  theme: Theme | null;
  onClose: () => void;
  /** Ação principal (ex.: iniciar o quiz). Se ausente, o botão não é exibido. */
  onPlay?: () => void;
  playLabel?: string;
}

const TYPE_LABEL: Record<MaterialType, string> = {
  VIDEO: "Vídeo",
  FILE: "Arquivo",
  SITE: "Site",
};

/**
 * Modal com os detalhes de um tema: imagem, nome, conteúdos e materiais de
 * apoio (clicáveis, abrem em nova guia). Opcionalmente exibe um botão de ação.
 */
const ThemeDetailsDialog = ({
  theme,
  onClose,
  onPlay,
  playLabel = "Jogar",
}: ThemeDetailsDialogProps) => {
  if (!theme) return null;
  const materials = theme.materials ?? [];

  return (
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
  );
};

export default ThemeDetailsDialog;
