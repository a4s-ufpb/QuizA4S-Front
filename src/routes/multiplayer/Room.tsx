import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import RoomConnected from "../../components/multiplayer/RoomConnected";

/**
 * Portão de nome + código. Só monta a conexão da sala depois que há um nome,
 * garantindo que jogadores convidados se identifiquem antes de entrar.
 */
const Room = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState(getGuestName());
  const [ready, setReady] = useState(getGuestName().trim().length >= 2);

  if (!code) {
    navigate("/multiplayer");
    return null;
  }

  function confirmName() {
    if (name.trim().length < 2) return;
    setGuestName(name.trim());
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
        <Card elevation={3} sx={{ width: "100%", maxWidth: 420 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" align="center" sx={{ mb: 3 }}>
              Entrar na sala {code}
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Escolha um nome para participar.
            </Alert>
            <TextField
              label="Seu nome"
              value={name}
              slotProps={{ htmlInput: { maxLength: 30 } }}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              sx={{ mb: 3 }}
            />
            <Box sx={{ display: "grid" }}>
              <Button variant="contained" onClick={confirmName}>
                Entrar
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return <RoomConnected code={code} />;
};

export default Room;
