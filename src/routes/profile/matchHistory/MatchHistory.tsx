import { useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  Typography,
  Button,
} from "@mui/material";
import { BsJoystick, BsPeopleFill } from "react-icons/bs";
import {
  getMatchHistory,
  clearMatchHistory,
  type MatchHistoryEntry,
} from "../../../util/matchHistory";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

const MatchHistory = () => {
  const [history, setHistory] = useState<MatchHistoryEntry[]>(() =>
    getMatchHistory()
  );

  function handleClear() {
    clearMatchHistory();
    setHistory([]);
  }

  if (history.length === 0) {
    return (
      <Typography color="text.secondary">
        Nenhuma partida registrada neste navegador ainda.
      </Typography>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
        <Button size="small" color="error" onClick={handleClear}>
          Limpar histórico
        </Button>
      </Box>
      <List>
        {history.map((entry) => (
          <ListItem
            key={entry.id}
            divider
            secondaryAction={
              <Chip
                label={`${entry.score}/${entry.total}`}
                color={entry.score >= entry.total / 2 ? "success" : "default"}
              />
            }
          >
            <Box sx={{ mr: 1, color: "primary.main" }}>
              {entry.mode === "MULTIPLAYER" ? <BsPeopleFill /> : <BsJoystick />}
            </Box>
            <ListItemText
              primary={entry.themeName}
              secondary={`${entry.mode === "MULTIPLAYER" ? "Multiplayer" : "Solo"} · ${formatDate(entry.date)}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default MatchHistory;
