import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Button,
  Stack,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import type { AdvanceMode, GameConfig, GameStyle, ScoringMode } from "../../types/game";

interface RoomConfigFormProps {
  config: GameConfig;
  onSave: (config: GameConfig) => void;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest === 0 ? `${minutes}m` : `${minutes}m ${rest}s`;
}

/** Modal do líder para personalizar as regras da partida. */
const RoomConfigForm = ({ config, onSave, onClose }: RoomConfigFormProps) => {
  const [draft, setDraft] = useState<GameConfig>(config);

  function update<K extends keyof GameConfig>(key: K, value: GameConfig[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Regras da partida</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel id="game-style-label">Estilo de jogo</InputLabel>
            <Select
              labelId="game-style-label"
              label="Estilo de jogo"
              value={draft.gameStyle}
              onChange={(e: SelectChangeEvent) =>
                update("gameStyle", e.target.value as GameStyle)
              }
            >
              <MenuItem value="NORMAL">Normal</MenuItem>
              <MenuItem value="FUN">Diversão (poderes na partida)</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="scoring-mode-label">Pontuação</InputLabel>
            <Select
              labelId="scoring-mode-label"
              label="Pontuação"
              value={draft.scoringMode}
              onChange={(e: SelectChangeEvent) =>
                update("scoringMode", e.target.value as ScoringMode)
              }
            >
              <MenuItem value="SPEED">Por velocidade (estilo Kahoot)</MenuItem>
              <MenuItem value="FIXED">Pontos fixos por acerto</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="advance-mode-label">Avanço das questões</InputLabel>
            <Select
              labelId="advance-mode-label"
              label="Avanço das questões"
              value={draft.advanceMode}
              onChange={(e: SelectChangeEvent) =>
                update("advanceMode", e.target.value as AdvanceMode)
              }
            >
              <MenuItem value="HOST">Manual (o líder avança)</MenuItem>
              <MenuItem value="AUTO">Automático (após o tempo)</MenuItem>
            </Select>
          </FormControl>

          <div>
            <Typography gutterBottom>
              Tempo por questão: {formatTime(draft.questionTimeSeconds)}
            </Typography>
            <Slider
              min={5}
              max={300}
              step={5}
              value={draft.questionTimeSeconds}
              valueLabelDisplay="auto"
              valueLabelFormat={formatTime}
              onChange={(_e, value) =>
                update("questionTimeSeconds", value as number)
              }
            />
          </div>

          <div>
            <Typography gutterBottom>
              Número de questões: {draft.questionCount}
            </Typography>
            <Slider
              min={1}
              max={30}
              step={1}
              value={draft.questionCount}
              onChange={(_e, value) => update("questionCount", value as number)}
            />
          </div>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" color="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={() => onSave(draft)}>
          Salvar regras
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RoomConfigForm;
