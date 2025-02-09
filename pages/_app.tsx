import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ConfirmProvider } from "material-ui-confirm";
import NavBar from "@/components/navigation/NavBar";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
  // Hier kannst du dein individuelles Theme konfigurieren
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ConfirmProvider>
        <NavBar />
        <Component {...pageProps} />
      </ConfirmProvider>
    </ThemeProvider>
  );
}
