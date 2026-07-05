import { Box, Card, CardContent, Typography, Grid } from "@mui/material";
import { BsAwardFill, BsLockFill } from "react-icons/bs";
import { useMyAchievementsQuery } from "../../../query/useMatchHistoryQueries";

const Achievements = () => {
  const achievementsQuery = useMyAchievementsQuery();
  const achievements = achievementsQuery.data?.success
    ? achievementsQuery.data.data
    : [];

  return (
    <Grid container spacing={2}>
      {achievements.map((a) => (
        <Grid key={a.code} size={{ xs: 12, sm: 6, md: 4 }}>
          <Card
            elevation={2}
            sx={{
              opacity: a.unlocked ? 1 : 0.5,
              textAlign: "center",
              height: "100%",
            }}
          >
            <CardContent>
              <Box sx={{ fontSize: 40, color: a.unlocked ? "gold" : "text.disabled" }}>
                {a.unlocked ? <BsAwardFill /> : <BsLockFill />}
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", mt: 1 }}>
                {a.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {a.description}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default Achievements;
