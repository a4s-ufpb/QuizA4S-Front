import { useParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Grid,
} from "@mui/material";
import { BsPersonCircle, BsHandThumbsUpFill, BsAwardFill, BsLockFill } from "react-icons/bs";
import Loading from "../../components/loading/Loading";
import NotFoundComponent from "../../components/notFound/NotFoundComponent";
import { usePublicProfileQuery } from "../../query/useUserQueries";
import { TitleBadge, FramedAvatar, bannerClassName } from "../../components/cosmetics/Cosmetic";

const PublicProfile = () => {
  const { id } = useParams<{ id: string }>();
  const profileQuery = usePublicProfileQuery(id ?? "");

  if (profileQuery.isLoading) return <Loading />;

  if (!profileQuery.data?.success) {
    return <NotFoundComponent title="Perfil não encontrado" />;
  }

  const profile = profileQuery.data.data;
  const xpIntoLevel = profile.xp % 100;

  return (
    <Box sx={{ py: 4, minHeight: "100vh" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "3fr 9fr" },
          gap: 3,
        }}
      >
        <Card elevation={2} sx={{ alignSelf: "start", height: "fit-content" }}>
          {profile.equippedBanner && (
            <Box className={bannerClassName(profile.equippedBanner)} sx={{ height: 48 }} />
          )}
          <CardContent
            sx={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              mt: profile.equippedBanner ? -6 : 0,
            }}
          >
            <FramedAvatar code={profile.equippedFrame} size={96}>
              <BsPersonCircle size={80} color="#3f7fd6" />
            </FramedAvatar>
            <Typography variant="h6">{profile.name}</Typography>
            {profile.equippedTitle && <TitleBadge code={profile.equippedTitle} />}
            <Typography
              sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "primary.main", fontWeight: "bold" }}
            >
              Curtidas: {profile.likes} <BsHandThumbsUpFill />
            </Typography>
            <Box sx={{ width: "100%" }}>
              <Typography variant="body2" sx={{ fontWeight: "bold", color: "primary.main" }}>
                Nível {profile.level}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={xpIntoLevel}
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="caption" color="text.secondary">
                {xpIntoLevel}/100 XP
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card elevation={2}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 2 }}>
              Conquistas
            </Typography>
            <Grid container spacing={2}>
              {profile.achievements.map((a) => (
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
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default PublicProfile;
