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
  TextField,
} from "@mui/material";
import {
  useThemeFeedbackByThemeQuery,
  useCreateThemeFeedbackMutation,
} from "../../query/useThemeFeedbackQueries";
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
    const trimmed = text.trim();
    if (trimmed.length < 5) {
      setError("O feedback deve ter no mínimo 5 caracteres");
      return;
    }
    setError(null);
    const res = await createMut.mutateAsync({ themeId, text: trimmed });
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
            <TextField
              label="Escreva seu feedback"
              value={text}
              onChange={(e) => setText(e.target.value)}
              multiline
              minRows={3}
              fullWidth
              error={!!error}
              helperText={error ?? "Mínimo 5 caracteres"}
              sx={{ mb: 1 }}
            />
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
                      <Typography component="span" sx={{ display: "block", whiteSpace: "pre-wrap" }}>
                        {f.text}
                      </Typography>
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
