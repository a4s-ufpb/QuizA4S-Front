import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
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
  const isAuth = Boolean(localStorage.getItem("token"));

  async function send() {
    if (!text.trim()) return;
    await createMut.mutateAsync({ themeId, text: text.trim() });
    setText("");
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Feedbacks {themeName ? `— ${themeName}` : ""}</DialogTitle>
      <DialogContent>
        {(allowCreate || isAuth) && (
          <>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                multiline
                minRows={2}
                label="Escreva seu feedback"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <Button variant="contained" onClick={send} disabled={createMut.isPending}>
                Enviar
              </Button>
            </Stack>
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
                      <span>{f.text}</span>
                      <br />
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
