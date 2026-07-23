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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
} from "@mui/material";
import { getGuestId, getGuestName, setGuestName } from "../../util/guest";
import { getStoredUser } from "../../util/storage";
import Loading from "../../components/loading/Loading";
import {
  useCreateTournamentMutation,
  useJoinTournamentMutation,
} from "../../query/useTournamentQueries";

const CreateJoinTournament = () => {
  const navigate = useNavigate();
  const createMutation = useCreateTournamentMutation();
  const joinMutation = useJoinTournamentMutation();

  const loggedUser = getStoredUser();
  const isLoggedIn = Boolean(localStorage.getItem("token") && loggedUser?.name);

  const [name, setName] = useState(isLoggedIn ? loggedUser.name : getGuestName());
  const [tournamentName, setTournamentName] = useState("");
  const [questionCount, setQuestionCount] = useState(10);
  const [questionTimeSeconds, setQuestionTimeSeconds] = useState(30);
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  // Chaveamento sem "bye": convidado joga com 4 ou 8; logado também pode 16.
  const capacityOptions = isLoggedIn ? [4, 8, 16] : [4, 8];

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

  async function createTournament() {
    setError("");
    if (!persistName()) return;
    if (!tournamentName.trim()) {
      setError("Digite um nome para o torneio.");
      return;
    }

    // O quiz não é mais escolhido aqui: o organizador define o quiz de cada
    // rodada no lobby, depois de travar as chaves.
    const response = await createMutation.mutateAsync({
      hostId: getGuestId(),
      hostName: name.trim(),
      name: tournamentName.trim(),
      themeId: null,
      questionCount,
      questionTimeSeconds,
      maxPlayers,
      hostUuid: loggedUser?.uuid ?? "",
    });

    if (!response.success) {
      setError(response.message || "Não foi possível criar o torneio.");
      return;
    }
    navigate(`/tournament/${response.data.code}`);
  }

  async function joinTournament() {
    setError("");
    if (!persistName()) return;

    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      setError("Digite o código do torneio.");
      return;
    }

    const response = await joinMutation.mutateAsync({
      code: normalized,
      playerId: getGuestId(),
      name: name.trim(),
      userUuid: loggedUser?.uuid ?? "",
    });

    if (!response.success) {
      setError(response.message || "Torneio não encontrado.");
      return;
    }
    navigate(`/tournament/${normalized}`);
  }

  const loading = createMutation.isPending || joinMutation.isPending;

  return (
    <Container
      sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}
    >
      <Card elevation={3} sx={{ width: "100%", maxWidth: 480 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" align="center" sx={{ mb: 3 }}>
            Torneio
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

          <TextField
            label="Nome do torneio"
            placeholder="Ex.: Torneio da Sexta"
            value={tournamentName}
            slotProps={{ htmlInput: { maxLength: 50 } }}
            onChange={(e) => setTournamentName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel id="question-count-label">Questões</InputLabel>
              <Select
                labelId="question-count-label"
                label="Questões"
                value={questionCount}
                onChange={(e: SelectChangeEvent<number>) => setQuestionCount(Number(e.target.value))}
              >
                {[5, 10].map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="question-time-label">Tempo/questão</InputLabel>
              <Select
                labelId="question-time-label"
                label="Tempo/questão"
                value={questionTimeSeconds}
                onChange={(e: SelectChangeEvent<number>) =>
                  setQuestionTimeSeconds(Number(e.target.value))
                }
              >
                {[15, 30, 45, 60].map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}s
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="tournament-capacity-label">Capacidade máxima (jogadores)</InputLabel>
            <Select
              labelId="tournament-capacity-label"
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

          <Box sx={{ display: "grid", mb: 3 }}>
            <Button variant="contained" size="large" onClick={createTournament}>
              Criar torneio
            </Button>
          </Box>

          <Typography align="center" color="text.secondary" sx={{ mb: 2 }}>
            ou entre em um torneio
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
            <Button variant="outlined" onClick={joinTournament} sx={{ flex: 5 }}>
              Entrar
            </Button>
          </Box>

          {loading && <Loading />}
        </CardContent>
      </Card>
    </Container>
  );
};

export default CreateJoinTournament;
