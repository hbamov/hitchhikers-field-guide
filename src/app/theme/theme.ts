import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#f2c14e", contrastText: "#18212a" },
    secondary: { main: "#62b6a5" },
    background: { default: "#101a24", paper: "#1a2835" },
    text: { primary: "#f1f3f3", secondary: "#b2bec7" },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    h1: { fontWeight: 750, letterSpacing: "-0.04em" },
    h2: { fontWeight: 700, letterSpacing: "-0.03em" },
    button: { fontWeight: 700, textTransform: "none" },
  },
  components: {
    MuiButton: {
      styleOverrides: { root: { borderRadius: 10, paddingInline: 18 } },
    },
    MuiCard: {
      styleOverrides: { root: { border: "1px solid rgba(255,255,255,0.08)" } },
    },
  },
});
