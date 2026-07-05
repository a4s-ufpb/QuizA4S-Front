import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  IconButton,
  Chip,
  Stack,
} from "@mui/material";
import { BsPersonPlusFill, BsCheckLg, BsXLg, BsTrash } from "react-icons/bs";
import { UserService } from "../../../service/UserService";
import {
  useMyFriendsQuery,
  usePendingFriendRequestsQuery,
  useRequestFriendshipMutation,
  useAcceptFriendshipMutation,
  useRemoveFriendshipMutation,
} from "../../../query/useFriendshipQueries";
import { getStoredUser } from "../../../util/storage";
import type { User } from "../../../types";

const userService = new UserService();

const Friends = () => {
  const myUuid = getStoredUser().uuid;
  const [searchName, setSearchName] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);

  const myFriendsQuery = useMyFriendsQuery();
  const pendingQuery = usePendingFriendRequestsQuery();
  const requestMutation = useRequestFriendshipMutation();
  const acceptMutation = useAcceptFriendshipMutation();
  const removeMutation = useRemoveFriendshipMutation();

  const friends = myFriendsQuery.data?.success ? myFriendsQuery.data.data : [];
  const pending = pendingQuery.data?.success ? pendingQuery.data.data : [];

  async function handleSearch() {
    if (!searchName.trim()) return;
    setSearching(true);
    const response = await userService.searchUsersByName(searchName.trim());
    setSearchResults(response.success ? response.data : []);
    setSearching(false);
  }

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
        Adicionar amigo
      </Typography>
      <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Buscar por nome..."
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button variant="contained" onClick={handleSearch} disabled={searching}>
          Buscar
        </Button>
      </Box>

      {searchResults.length > 0 && (
        <List dense sx={{ mb: 3 }}>
          {searchResults.map((user) => (
            <ListItem
              key={user.uuid}
              secondaryAction={
                <IconButton
                  color="primary"
                  onClick={() => requestMutation.mutate(user.uuid)}
                  title="Adicionar amigo"
                >
                  <BsPersonPlusFill />
                </IconButton>
              }
            >
              <ListItemAvatar>
                <Avatar />
              </ListItemAvatar>
              <ListItemText primary={user.name} secondary={user.email} />
            </ListItem>
          ))}
        </List>
      )}

      {pending.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
            Solicitações pendentes
          </Typography>
          <List dense sx={{ mb: 3 }}>
            {pending.map((f) => (
              <ListItem
                key={f.id}
                secondaryAction={
                  <Stack direction="row" spacing={0.5}>
                    <IconButton
                      color="success"
                      onClick={() => acceptMutation.mutate(f.id)}
                      title="Aceitar"
                    >
                      <BsCheckLg />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => removeMutation.mutate(f.id)}
                      title="Recusar"
                    >
                      <BsXLg />
                    </IconButton>
                  </Stack>
                }
              >
                <ListItemAvatar>
                  <Avatar />
                </ListItemAvatar>
                <ListItemText primary={f.requester.name} />
              </ListItem>
            ))}
          </List>
        </>
      )}

      <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
        Meus amigos
      </Typography>
      {friends.length === 0 ? (
        <Typography color="text.secondary">
          Você ainda não tem amigos adicionados.
        </Typography>
      ) : (
        <List dense>
          {friends.map((f) => {
            const friend =
              f.requester.uuid === myUuid ? f.addressee : f.requester;
            return (
              <ListItem
                key={f.id}
                secondaryAction={
                  <IconButton
                    color="error"
                    onClick={() => removeMutation.mutate(f.id)}
                    title="Remover amigo"
                  >
                    <BsTrash />
                  </IconButton>
                }
              >
                <ListItemAvatar>
                  <Avatar />
                </ListItemAvatar>
                <ListItemText
                  primary={friend.name}
                  secondary={
                    <Chip
                      size="small"
                      label={`Nível ${friend.level ?? 1}`}
                      color="primary"
                      variant="outlined"
                    />
                  }
                />
              </ListItem>
            );
          })}
        </List>
      )}
    </Box>
  );
};

export default Friends;
