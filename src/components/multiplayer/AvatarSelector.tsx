import { Box, Paper, IconButton, Typography } from "@mui/material";
import { AVATAR_OPTIONS } from "../../util/avatars";

interface AvatarSelectorProps {
  value: string;
  onChange: (avatar: string) => void;
  label?: string;
}

/** Grid inline (não popover) com todos os avatares disponíveis, sempre visível. */
const AvatarSelector = ({ value, onChange, label }: AvatarSelectorProps) => {
  return (
    <Box sx={{ mb: 2 }}>
      {label && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          {label}
        </Typography>
      )}
      <Paper
        elevation={1}
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(44px, 1fr))",
          gap: 0.5,
          p: 1.5,
          width: "100%",
          bgcolor: "background.paper",
        }}
      >
        {AVATAR_OPTIONS.map((avatar) => (
          <IconButton
            key={avatar}
            onClick={() => onChange(avatar)}
            sx={{
              fontSize: "1.4em",
              p: 0.5,
              border: "2px solid",
              borderColor: value === avatar ? "primary.main" : "transparent",
              borderRadius: 2,
              bgcolor: value === avatar ? "action.selected" : "transparent",
            }}
          >
            {avatar}
          </IconButton>
        ))}
      </Paper>
    </Box>
  );
};

export default AvatarSelector;
