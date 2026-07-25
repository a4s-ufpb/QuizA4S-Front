import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { BsTrashFill, BsPencilSquare, BsPlusLg, BsCheck, BsX } from "react-icons/bs";
import {
  useMyTagsQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
} from "../../query/useTagQueries";

interface Props {
  open: boolean;
  onClose: () => void;
}

const TagManageModal = ({ open, onClose }: Props) => {
  const { data } = useMyTagsQuery(open);
  const createMut = useCreateTagMutation();
  const updateMut = useUpdateTagMutation();
  const deleteMut = useDeleteTagMutation();

  const tags = data?.data ?? [];
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  async function handleCreate() {
    const name = newName.trim();
    if (name.length < 3) {
      setNameError("Mínimo de 3 caracteres");
      return;
    }
    setNameError(null);
    await createMut.mutateAsync(name);
    setNewName("");
  }

  function startEdit(id: number, name: string) {
    setEditingId(id);
    setEditingName(name);
  }

  async function saveEdit() {
    if (editingId == null) return;
    const name = editingName.trim();
    if (name.length < 3) return;
    await updateMut.mutateAsync({ id: editingId, name });
    setEditingId(null);
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Gerenciar minhas Tags</DialogTitle>
      <DialogContent>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Nova tag"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            error={!!nameError}
            helperText={nameError ?? "Mínimo 3 caracteres"}
          />
          <Button
            variant="contained"
            startIcon={<BsPlusLg />}
            onClick={handleCreate}
            disabled={createMut.isPending}
          >
            Criar
          </Button>
        </Stack>

        {tags.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Nenhuma tag ainda. Crie a primeira acima.
          </Typography>
        )}

        <List dense>
          {tags.map((tag) => (
            <ListItem
              key={tag.id}
              secondaryAction={
                editingId === tag.id ? (
                  <Stack direction="row">
                    <IconButton onClick={saveEdit} color="primary">
                      <BsCheck />
                    </IconButton>
                    <IconButton onClick={() => setEditingId(null)}>
                      <BsX />
                    </IconButton>
                  </Stack>
                ) : (
                  <Stack direction="row">
                    <IconButton onClick={() => startEdit(tag.id, tag.name)}>
                      <BsPencilSquare />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => deleteMut.mutate(tag.id)}
                    >
                      <BsTrashFill />
                    </IconButton>
                  </Stack>
                )
              }
            >
              {editingId === tag.id ? (
                <TextField
                  size="small"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  fullWidth
                />
              ) : (
                <ListItemText primary={tag.name} />
              )}
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TagManageModal;
