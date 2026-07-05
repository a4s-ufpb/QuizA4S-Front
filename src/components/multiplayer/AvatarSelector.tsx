import { useState } from "react";
import { Box, Paper, IconButton, Typography, Chip, Stack, Tooltip } from "@mui/material";
import { BsLockFill } from "react-icons/bs";
import {
  AVATAR_CATEGORIES,
  AVATAR_CATEGORY_UNLOCK_LEVEL,
} from "../../util/avatars";
import { useFindUserQuery } from "../../query/useUserQueries";

interface AvatarSelectorProps {
  value: string;
  onChange: (avatar: string) => void;
  label?: string;
}

const CATEGORY_NAMES = Object.keys(AVATAR_CATEGORIES);

/** Grid inline (não popover) com todos os avatares disponíveis, agrupados por categoria. */
const AvatarSelector = ({ value, onChange, label }: AvatarSelectorProps) => {
  const isLoggedIn = Boolean(localStorage.getItem("token"));
  const findUserQuery = useFindUserQuery(isLoggedIn);
  const myLevel = isLoggedIn && findUserQuery.data?.success
    ? findUserQuery.data.data.level ?? 1
    : 1;

  const [category, setCategory] = useState(
    () =>
      CATEGORY_NAMES.find((name) => AVATAR_CATEGORIES[name].includes(value)) ??
      CATEGORY_NAMES[0]
  );

  const isUnlocked = (name: string) => myLevel >= AVATAR_CATEGORY_UNLOCK_LEVEL[name];

  return (
    <Box sx={{ mb: 2 }}>
      {label && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          {label}
        </Typography>
      )}

      <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap", gap: 1 }}>
        {CATEGORY_NAMES.map((name) => {
          const unlocked = isUnlocked(name);
          const chip = (
            <Chip
              key={name}
              label={name}
              size="small"
              icon={unlocked ? undefined : <BsLockFill />}
              color={category === name ? "primary" : "default"}
              onClick={() => unlocked && setCategory(name)}
              sx={{ opacity: unlocked ? 1 : 0.6 }}
            />
          );
          return unlocked ? (
            chip
          ) : (
            <Tooltip
              key={name}
              title={`Desbloqueia no nível ${AVATAR_CATEGORY_UNLOCK_LEVEL[name]}`}
            >
              {chip}
            </Tooltip>
          );
        })}
      </Stack>

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
        {AVATAR_CATEGORIES[category].map((avatar) => (
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
