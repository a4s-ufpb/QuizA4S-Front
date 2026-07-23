import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Box,
  Container,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Typography,
} from "@mui/material";
import { getGuestName, setGuestName } from "../../util/guest";
import { getStoredUser } from "../../util/storage";
import AvatarSelector from "../../components/multiplayer/AvatarSelector";
import RoomConnected from "../../components/multiplayer/RoomConnected";

/**
 * Portão de nome + avatar. Só monta a conexão da sala depois que o jogador
 * confirmou nome (se convidado) e escolheu um avatar — sempre exibido, mesmo
 * entrando direto por link, garantindo estado consistente (ex.: botão de
 * "pronto" no lobby) antes do `join` ser enviado.
 */
const Room = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tournamentCode = searchParams.get("tournament") ?? undefined;

  const loggedUser = getStoredUser();
  const isLoggedIn = Boolean(
    localStorage.getItem("token") && loggedUser?.name
  );

  const [name, setName] = useState(
    isLoggedIn ? loggedUser.name : getGuestName()
  );
  const [avatar, setAvatar] = useState("");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  if (!code) {
    navigate("/multiplayer");
    return null;
  }

  function confirmEntry() {
    if (!isLoggedIn && name.trim().length < 2) {
      setError("Digite um nome com pelo menos 2 caracteres.");
      return;
    }
    if (!avatar) {
      setError("Escolha um avatar para entrar na sala.");
      return;
    }
    setGuestName(isLoggedIn ? loggedUser.name : name.trim());
    setReady(true);
  }

  if (!ready) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Card elevation={3} sx={{ width: "100%", maxWidth: 460 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" align="center" sx={{ mb: 3 }}>
              Entrar na sala {code}
            </Typography>

            {error && (
              <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {isLoggedIn ? (
              <Typography align="center" sx={{ mb: 3 }}>
                Jogando como <strong>{loggedUser.name}</strong>
              </Typography>
            ) : (
              <TextField
                label="Seu nome"
                value={name}
                slotProps={{ htmlInput: { maxLength: 30 } }}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                sx={{ mb: 3 }}
              />
            )}

            <AvatarSelector
              label="Escolha seu avatar"
              value={avatar}
              onChange={setAvatar}
            />

            <Box sx={{ display: "grid" }}>
              <Button variant="contained" onClick={confirmEntry}>
                Entrar
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return <RoomConnected code={code} avatar={avatar} tournamentCode={tournamentCode} />;
};

export default Room;
