import { useState, type Dispatch, type SetStateAction } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Slider,
  Switch,
  FormControlLabel,
  Stack,
} from "@mui/material";
import { BsVolumeUpFill, BsVolumeMuteFill } from "react-icons/bs";
import {
  getSoundVolume,
  getSoundMuted,
  setSoundVolume,
  setSoundMuted,
  playSound,
} from "../../util/sound";
import correctSoundFile from "../../assets/sounds/alternative-success.mp3";

interface SettingsModalProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const SettingsModal = ({ open, setOpen }: SettingsModalProps) => {
  const [volume, setVolume] = useState(getSoundVolume());
  const [muted, setMuted] = useState(getSoundMuted());

  function handleVolumeChange(_: Event, value: number | number[]) {
    const next = Array.isArray(value) ? value[0] : value;
    setVolume(next);
    setSoundVolume(next);
  }

  function handleMutedChange(_: unknown, checked: boolean) {
    setMuted(checked);
    setSoundMuted(checked);
  }

  function handleTestSound() {
    playSound(correctSoundFile);
  }

  return (
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
      <DialogTitle>Configurações de som</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControlLabel
            control={<Switch checked={muted} onChange={handleMutedChange} />}
            label="Silenciar sons do quiz"
          />

          <Box>
            <Typography
              variant="body2"
              sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}
            >
              {muted ? <BsVolumeMuteFill /> : <BsVolumeUpFill />}
              Volume: {Math.round(volume * 100)}%
            </Typography>
            <Slider
              value={volume}
              onChange={handleVolumeChange}
              min={0}
              max={1}
              step={0.05}
              disabled={muted}
            />
          </Box>

          <Button variant="outlined" onClick={handleTestSound} disabled={muted}>
            Testar som
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsModal;
