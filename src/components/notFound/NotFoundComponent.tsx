import { Box, Paper, Typography } from "@mui/material";
import ImgNotFound from "../../assets/data-not-found.webp";

interface NotFoundComponentProps {
  title: string;
}

const NotFoundComponent = ({ title }: NotFoundComponentProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 3,
        my: 4,
      }}
    >
      <Paper
        elevation={2}
        sx={{
          textAlign: "center",
          wordBreak: "break-word",
          px: 3,
          py: 1,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" color="primary.main">
          {title}
        </Typography>
      </Paper>
      <Box
        component="img"
        src={ImgNotFound}
        alt="image-not-found"
        sx={{
          width: { xs: 200, sm: 250 },
          height: { xs: 200, sm: 250 },
          borderRadius: 2,
          boxShadow: 2,
        }}
      />
    </Box>
  );
};

export default NotFoundComponent;
