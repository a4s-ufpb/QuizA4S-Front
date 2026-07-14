import type { ReactNode } from "react";
import { Box, Button, Typography } from "@mui/material";
import { BsBoxArrowRight } from "react-icons/bs";
import "./multiplayer.css";

interface RoomExitScreenProps {
  icon: ReactNode;
  title: string;
  message: string;
  onBack: () => void;
  /** Cor de destaque do ícone/halo (default: azul da marca). */
  accent?: string;
}

/**
 * Tela cheia gamificada exibida quando o jogador sai da partida (sala
 * encerrada, removido pelo líder). Segue o visual do modo multiplayer:
 * fundo em gradiente, card translúcido e animação de entrada.
 */
const RoomExitScreen = ({
  icon,
  title,
  message,
  onBack,
  accent = "#3f7fd6",
}: RoomExitScreenProps) => {
  return (
    <div className="mp-exit-screen">
      <Box className="mp-exit-card mp-pop">
        <Box className="mp-exit-icon" sx={{ color: accent }}>
          {icon}
        </Box>
        <Typography variant="h4" sx={{ color: "#fff", fontWeight: "bold", mb: 1 }}>
          {title}
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.85)", mb: 3 }}>
          {message}
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<BsBoxArrowRight />}
          onClick={onBack}
          sx={{ borderRadius: 50, px: 4, fontWeight: "bold" }}
        >
          Voltar ao início
        </Button>
      </Box>
    </div>
  );
};

export default RoomExitScreen;
