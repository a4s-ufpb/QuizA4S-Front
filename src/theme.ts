import { createTheme, type PaletteMode, type Theme } from "@mui/material/styles";

export function createAppTheme(mode: PaletteMode): Theme {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
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
        default: isDark ? "#0f1620" : "#78b9f2",
        paper: isDark ? "#1a2432" : "#ffffff",
      },
    },
    typography: {
      // Corpo/UI em Poppins; títulos em Unbounded para um visual gamificado.
      fontFamily: "'Poppins', sans-serif",
      h1: { fontFamily: "'Unbounded', 'Poppins', sans-serif", fontWeight: 800 },
      h2: { fontFamily: "'Unbounded', 'Poppins', sans-serif", fontWeight: 800 },
      h3: { fontFamily: "'Unbounded', 'Poppins', sans-serif", fontWeight: 700 },
      h4: { fontFamily: "'Unbounded', 'Poppins', sans-serif", fontWeight: 700 },
      h5: { fontFamily: "'Unbounded', 'Poppins', sans-serif", fontWeight: 600 },
      h6: { fontFamily: "'Unbounded', 'Poppins', sans-serif", fontWeight: 600 },
    },
    shape: {
      borderRadius: 10,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            minHeight: "100dvh",
            background: isDark
              ? "linear-gradient(160deg, #16202e 0%, #0a0f16 100%)"
              : "linear-gradient(160deg, #78b9f2 0%, #3f7fd6 100%)",
            backgroundAttachment: "fixed",
          },
        },
      },
    },
  });
}

const theme = createAppTheme("light");

export default theme;
