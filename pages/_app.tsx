import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ConfirmProvider } from "material-ui-confirm";
import dynamic from "next/dynamic";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import HomePageWrapper from "@/components/HomePageWrapper/HomePageWrapper";

// Dynamic import to prevent SSR hydration issues
const NavBar = dynamic(() => import("@/components/navigation/SimpleNavBar"), {
  ssr: false,
  loading: () => (
    <header style={{
      background: 'var(--primary-bg, #0a0a0a)',
      color: 'var(--text-primary, #ededed)',
      padding: '0.8rem 0',
      position: 'sticky',
      width: '100%',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
      height: '64px'
    }}>
      <nav>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '100%'
        }}>
          <div style={{
            fontSize: '1.6rem',
            fontWeight: 600,
            color: 'var(--text-primary, #ededed)'
          }}>
            Velvet Reborn
          </div>
        </div>
      </nav>
    </header>
  )
});

const theme = createTheme({
  // Hier kannst du dein individuelles Theme konfigurieren
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ConfirmProvider>
        <NavBar />
        <HomePageWrapper>
          <Component {...pageProps} />
        </HomePageWrapper>
      </ConfirmProvider>
    </ThemeProvider>
  );
}
