import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
} from "@mui/material";
import {
  useThemeFeedbackByThemeQuery,
  useCreateThemeFeedbackMutation,
} from "../../query/useThemeFeedbackQueries";
import RichTextEditor from "../richText/RichTextEditor";
import { APP_TOKEN_KEY } from "../../util/token";

interface Props {
  themeId: number;
  themeName?: string;
  allowCreate?: boolean;
  onClose: () => void;
}

const ThemeFeedbackModal = ({ themeId, themeName, allowCreate = false, onClose }: Props) => {
  const { data } = useThemeFeedbackByThemeQuery(themeId);
  const createMut = useCreateThemeFeedbackMutation();
  const [text, setText] = useState("");

  const feedbacks = data?.data ?? [];
  const isAuth = Boolean(localStorage.getItem(APP_TOKEN_KEY));
  const [error, setError] = useState<string | null>(null);

  async function send() {
    const stripped = text.replace(/<[^>]*>/g, "").trim();
    if (stripped.length < 5) {
      setError("O feedback deve ter no mínimo 5 caracteres");
      return;
    }
    setError(null);
    const res = await createMut.mutateAsync({ themeId, text });
    if (res.success) {
      setText("");
    }
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Feedbacks {themeName ? `— ${themeName}` : ""}</DialogTitle>
      <DialogContent>
        {(allowCreate || isAuth) && (
          <>
            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                Escreva seu feedback
              </Typography>
              <RichTextEditor
                value={text}
                onChange={setText}
                placeholder="Digite seu feedback (mín. 5 caracteres)"
                minRows={3}
                error={!!error}
                helperText={error ?? "Você pode usar negrito, itálico, listas etc."}
              />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <Button variant="contained" onClick={send} disabled={createMut.isPending}>
                Enviar
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
          </>
        )}

        {feedbacks.length === 0 ? (
          <Typography color="text.secondary">Ainda sem feedbacks.</Typography>
        ) : (
          <List dense>
            {feedbacks.map((f) => (
              <ListItem key={f.id} alignItems="flex-start">
                <ListItemText
                  primary={f.userName}
                  secondary={
                    <>
                      <Box
                        component="span"
                        sx={{ display: "block", "& p": { m: 0 }, "& ul, & ol": { pl: 3, my: 0 } }}
                        dangerouslySetInnerHTML={{ __html: f.text }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {f.createdAt}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ThemeFeedbackModal;
