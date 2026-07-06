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
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
} from "@mui/material";
import { GameService } from "../../service/GameService";
import { getGuestId, getGuestName, setGuestName } from "../../util/guest";
import { getStoredUser } from "../../util/storage";
import { useIsAdminQuery } from "../../query/useUserQueries";
import Loading from "../../components/loading/Loading";
import type { RoomMode } from "../../types/game";

const Multiplayer = () => {
  const gameService = new GameService();
  const navigate = useNavigate();

  const loggedUser = getStoredUser();
  const isLoggedIn = Boolean(
    localStorage.getItem("token") && loggedUser?.name
  );
  const isAdminQuery = useIsAdminQuery(loggedUser?.uuid ?? "", isLoggedIn);
  const isAdmin = isAdminQuery.data?.data.isAdmin ?? false;

  // Capacidade e tamanho de equipe permitidos por papel:
  //  convidado: 12 / 2  ·  logado: 12,24 / 2,3  ·  admin: 12,24,48 / 2,3,4
  const capacityOptions = isAdmin ? [12, 24, 48] : isLoggedIn ? [12, 24] : [12];
  const teamSizeOptions = isAdmin ? [2, 3, 4] : isLoggedIn ? [2, 3] : [2];

  const [name, setName] = useState(
    isLoggedIn ? loggedUser.name : getGuestName()
  );
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [roomMode, setRoomMode] = useState<RoomMode>("INDIVIDUAL");
  const [maxPlayersPerTeam, setMaxPlayersPerTeam] = useState(2);
  const [maxPlayers, setMaxPlayers] = useState(12);

  function persistName(): boolean {
    if (isLoggedIn) {
      setGuestName(loggedUser.name);
      return true;
    }
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
      config: {
        roomMode,
        scoringMode: "SPEED",
        advanceMode: "HOST",
        questionTimeSeconds: 120,
        questionCount: 10,
        maxPlayersPerTeam: roomMode === "TEAM" ? maxPlayersPerTeam : null,
        gameStyle: "NORMAL",
        maxPlayers,
      },
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

          {isLoggedIn ? (
            <Typography align="center" sx={{ mb: 3 }}>
              Jogando como <strong>{name}</strong>
            </Typography>
          ) : (
            <TextField
              label="Seu nome"
              placeholder="Como quer ser chamado?"
              value={name}
              slotProps={{ htmlInput: { maxLength: 30 } }}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              sx={{ mb: 3 }}
            />
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Modo da sala
          </Typography>
          <ToggleButtonGroup
            exclusive
            fullWidth
            value={roomMode}
            onChange={(_e, newMode) => newMode && setRoomMode(newMode)}
            sx={{ mb: 2 }}
          >
            <ToggleButton value="INDIVIDUAL">Todos contra todos</ToggleButton>
            <ToggleButton value="TEAM">Equipes</ToggleButton>
          </ToggleButtonGroup>

          <FormControl fullWidth sx={{ mb: roomMode === "TEAM" ? 2 : 3 }}>
            <InputLabel id="capacity-label">Capacidade máxima (jogadores)</InputLabel>
            <Select
              labelId="capacity-label"
              label="Capacidade máxima (jogadores)"
              value={maxPlayers}
              onChange={(e: SelectChangeEvent<number>) => setMaxPlayers(Number(e.target.value))}
            >
              {capacityOptions.map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {roomMode === "TEAM" && (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="team-size-label">
                Jogadores por equipe
              </InputLabel>
              <Select
                labelId="team-size-label"
                label="Jogadores por equipe"
                value={maxPlayersPerTeam}
                onChange={(e: SelectChangeEvent<number>) =>
                  setMaxPlayersPerTeam(Number(e.target.value))
                }
              >
                {teamSizeOptions.map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

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
