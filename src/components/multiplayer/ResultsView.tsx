import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  CardHeader,
  Button,
  List,
  ListItem,
  Chip,
  Box,
  Typography,
} from "@mui/material";
import { BsTrophyFill } from "react-icons/bs";
import type { UseGameRoom } from "../../hooks/useGameRoom";
import "./multiplayer.css";

interface ResultsViewProps {
  room: UseGameRoom;
}

/** Tela final: ranking dos jogadores (e das equipes no modo TEAM). */
const ResultsView = ({ room }: ResultsViewProps) => {
  const navigate = useNavigate();
  const state = room.state!;
  const isTeam = state.config.roomMode === "TEAM";

  const players = [...state.players]
    .filter((p) => !p.host || state.players.length === 1)
    .sort((a, b) => b.score - a.score);
  const teams = [...state.teams].sort((a, b) => b.score - a.score);

  return (
    <Container sx={{ py: 5, maxWidth: "640px" }}>
      <Box className="mp-pop" sx={{ textAlign: "center", mb: 4 }}>
        <BsTrophyFill color="gold" size={56} />
        <Typography variant="h4" sx={{ mt: 2, color: "#fff" }}>
          Fim de jogo!
        </Typography>
      </Box>

      {isTeam && (
        <Card elevation={2} sx={{ mb: 4 }}>
          <CardHeader title="Equipes" />
          <List disablePadding>
            {teams.map((t, i) => (
              <ListItem
                key={t.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>
                  {i === 0 && (
                    <Chip label="1º" color="warning" size="small" sx={{ mr: 1 }} />
                  )}
                  {t.name}
                </span>
                <strong>{t.score}</strong>
              </ListItem>
            ))}
          </List>
        </Card>
      )}

      <Card elevation={2} sx={{ mb: 4 }}>
        <CardHeader title="Jogadores" />
        <List disablePadding>
          {players.map((p, i) => (
            <ListItem
              key={p.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>
                <strong style={{ marginRight: 8 }}>{i + 1}º</strong>
                {p.name}
                {p.id === room.playerId && " (você)"}
              </span>
              <strong>{p.score}</strong>
            </ListItem>
          ))}
        </List>
      </Card>

      <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
        <Button variant="outlined" color="secondary" onClick={() => navigate("/multiplayer")}>
          Sair
        </Button>
      </Box>
    </Container>
  );
};

export default ResultsView;
