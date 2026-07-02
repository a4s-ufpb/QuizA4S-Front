import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#3f7fd6",
      dark: "#0055cc",
    },
    secondary: {
      main: "rgb(76, 76, 250)",
    },
    error: {
      main: "rgb(194, 0, 0)",
    },
    background: {
      default: "#78b9f2",
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minHeight: "100dvh",
          background: "linear-gradient(160deg, #78b9f2 0%, #3f7fd6 100%)",
          backgroundAttachment: "fixed",
        },
      },
    },
  },
});

export default theme;
