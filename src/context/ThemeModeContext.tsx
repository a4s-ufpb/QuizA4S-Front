import {
  createContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PaletteMode } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { createAppTheme } from "../theme";

const STORAGE_KEY = "themeMode";

interface ThemeModeContextValue {
  mode: PaletteMode;
  toggleMode: () => void;
}

export const ThemeModeContext = createContext<ThemeModeContextValue>({
  mode: "light",
  toggleMode: () => {},
});

function getInitialMode(): PaletteMode {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "dark" ? "dark" : "light";
}

interface ThemeModeProviderProps {
  children: ReactNode;
}

export const ThemeModeProvider = ({ children }: ThemeModeProviderProps) => {
  const [mode, setMode] = useState<PaletteMode>(getInitialMode);

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  };

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  // Expõe o modo atual num atributo do <html> pra que CSS puro (fora do
  // sistema de tema do MUI, ex. backgrounds construídos em .css comuns)
  // também consiga reagir ao dark mode via seletor de atributo.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
  }, [mode]);

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};
