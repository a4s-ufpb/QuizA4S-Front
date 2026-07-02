import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { GameService } from "../../service/GameService";
import { getGuestId, getGuestName, setGuestName } from "../../util/guest";
import Loading from "../../components/loading/Loading";

const Multiplayer = () => {
  const gameService = new GameService();
  const navigate = useNavigate();

  const [name, setName] = useState(getGuestName());
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function persistName(): boolean {
    if (name.trim().length < 2) {
      setError("Digite um nome com pelo menos 2 caracteres.");
      return false;
    }
    setGuestName(name.trim());
    return true;
  }

  async function createRoom() {
    setError("");
    if (!persistName()) return;

    setLoading(true);
    const response = await gameService.createRoom({
      hostId: getGuestId(),
      hostName: name.trim(),
    });
    setLoading(false);

    if (!response.success) {
      setError(response.message || "Não foi possível criar a sala.");
      return;
    }
    navigate(`/room/${response.data.code}`);
  }

  async function joinRoom() {
    setError("");
    if (!persistName()) return;

    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      setError("Digite o código da sala.");
      return;
    }

    setLoading(true);
    const response = await gameService.findRoomByCode(normalized);
    setLoading(false);

    if (!response.success) {
      setError("Sala não encontrada.");
      return;
    }
    navigate(`/room/${normalized}`);
  }

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
          <Typography variant="h4" align="center" sx={{ mb: 3 }}>
            Quiz Multiplayer
          </Typography>

          {error && (
            <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="Seu nome"
            placeholder="Como quer ser chamado?"
            value={name}
            slotProps={{ htmlInput: { maxLength: 30 } }}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: "grid", mb: 3 }}>
            <Button variant="contained" size="large" onClick={createRoom}>
              Criar sala
            </Button>
          </Box>

          <Typography align="center" color="text.secondary" sx={{ mb: 2 }}>
            ou entre em uma sala
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              placeholder="Código"
              value={code}
              slotProps={{
                htmlInput: {
                  maxLength: 6,
                  style: { textTransform: "uppercase", letterSpacing: "2px" },
                },
              }}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              sx={{ flex: 7 }}
            />
            <Button
              variant="outlined"
              onClick={joinRoom}
              sx={{ flex: 5 }}
            >
              Entrar
            </Button>
          </Box>

          {loading && <Loading />}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Multiplayer;
