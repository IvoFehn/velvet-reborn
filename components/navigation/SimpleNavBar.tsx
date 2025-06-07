import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const PASSWORD = "Sexlust";
const COOKIE_NAME = "auth_token";
const COOKIE_EXPIRY = 10; // Minuten

const publicItems = [
  { text: "Home", link: "/" },
  { text: "Profile", link: "/profile" },
  { text: "Anträge", link: "/tickets" },
  { text: "Shop", link: "/shop" },
  { text: "Regeln", link: "/rules" },
  { text: "Wiki", link: "/wiki/lust-o-meter" },
];

const adminLink = { text: "Admin", link: "/admin" };

const SimpleNavBar = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setIsAuthenticated(document.cookie.includes(`${COOKIE_NAME}=`));
    }
  }, []);

  const isActive = (path: string) => router.pathname === path;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD) {
      if (typeof window !== "undefined") {
        const expiryDate = new Date(Date.now() + COOKIE_EXPIRY * 60 * 1000);
        document.cookie = `${COOKIE_NAME}=authenticated; expires=${expiryDate.toUTCString()}; path=/`;
      }
      setIsAuthenticated(true);
      setError("");
      setIsMenuOpen(false);
    } else {
      setError("Falsches Passwort");
    }
    setPassword("");
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    }
    setIsAuthenticated(false);
    setIsMenuOpen(false);
  };

  const closeMenu = () => setIsMenuOpen(false);

  const navStyles = {
    header: {
      background: 'var(--primary-bg, #0a0a0a)',
      color: 'var(--text-primary, #ededed)',
      padding: '0.8rem 0',
      position: 'sticky' as const,
      width: '100%',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    logo: {
      fontSize: '1.6rem',
      fontWeight: 600,
      textDecoration: 'none',
      color: 'var(--text-primary, #ededed)'
    },
    desktopNav: {
      display: 'flex',
      gap: '2rem',
      alignItems: 'center',
      flexGrow: 1
    },
    navLink: {
      color: 'var(--text-primary, #ededed)',
      textDecoration: 'none',
      fontSize: '0.8rem',
      padding: '0.3rem 0.6rem',
      borderRadius: '0.5rem'
    },
    authContainer: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      minWidth: '200px',
      justifyContent: 'flex-end'
    },
    loginForm: {
      display: 'flex',
      gap: '0.8rem',
      alignItems: 'center'
    },
    input: {
      padding: '0.7rem 0.9rem',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '0.5rem',
      background: 'var(--secondary-bg, #1a1a1a)',
      color: 'var(--text-primary, #ededed)',
      width: '140px'
    },
    loginButton: {
      background: 'var(--accent-color, #bfa26a)',
      padding: '0.7rem 1.2rem',
      borderRadius: '0.5rem',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      fontWeight: 500
    },
    logoutButton: {
      background: '#e63946',
      padding: '0.7rem 1.2rem',
      borderRadius: '0.5rem',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      fontWeight: 500
    },
    mobileButton: {
      background: 'none',
      border: 'none',
      color: 'var(--text-primary, #ededed)',
      fontSize: '2rem',
      cursor: 'pointer',
      display: 'none',
      padding: '0.5rem'
    },
    backdrop: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.5)',
      zIndex: 999,
      display: isMenuOpen ? 'block' : 'none'
    },
    mobileMenu: {
      position: 'fixed' as const,
      top: 0,
      right: isMenuOpen ? 0 : '-100%',
      height: '100vh',
      width: '85%',
      maxWidth: '320px',
      background: 'var(--secondary-bg, #1a1a1a)',
      transition: 'right 0.3s ease-in-out',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column' as const
    },
    error: {
      color: '#ff4444',
      fontSize: '0.8rem',
      margin: 0
    }
  };

  return (
    <header style={navStyles.header}>
      <nav>
        <div style={navStyles.container}>
          <Link href="/" style={navStyles.logo}>
            Velvet Reborn
          </Link>

          {/* Desktop Navigation */}
          <div style={navStyles.desktopNav}>
            {publicItems.map((item) => (
              <Link
                key={item.link}
                href={item.link}
                style={{
                  ...navStyles.navLink,
                  color: isActive(item.link) ? 'var(--accent-color, #bfa26a)' : 'var(--text-primary, #ededed)'
                }}
              >
                {item.text}
              </Link>
            ))}

            {/* Auth area */}
            <div style={navStyles.authContainer}>
              {mounted && isAuthenticated && (
                <>
                  <Link 
                    href={adminLink.link}
                    style={{
                      ...navStyles.navLink,
                      color: isActive(adminLink.link) ? 'var(--accent-color, #bfa26a)' : 'var(--text-primary, #ededed)'
                    }}
                  >
                    {adminLink.text}
                  </Link>
                  <button onClick={handleLogout} style={navStyles.logoutButton}>
                    Logout
                  </button>
                </>
              )}
              
              {mounted && !isAuthenticated && (
                <form onSubmit={handleLogin} style={navStyles.loginForm}>
                  <input
                    type="password"
                    placeholder="Passwort"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={navStyles.input}
                  />
                  <button type="submit" style={navStyles.loginButton}>
                    Login
                  </button>
                </form>
              )}

              {error && <p style={navStyles.error}>{error}</p>}
            </div>
          </div>

          {/* Mobile Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            style={navStyles.mobileButton}
            className="mobile-menu-btn"
          >
            ☰
          </button>

          {/* Mobile Menu Backdrop */}
          <div onClick={closeMenu} style={navStyles.backdrop} />

          {/* Mobile Navigation */}
          <div style={navStyles.mobileMenu}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1.2rem' }}>
              <button onClick={closeMenu} style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-primary, #ededed)',
                fontSize: '1.6rem',
                cursor: 'pointer',
                padding: '0.4rem'
              }}>
                ✕
              </button>
            </div>

            <div style={{
              padding: '0 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.2rem',
              overflowY: 'auto'
            }}>
              {publicItems.map((item) => (
                <Link
                  key={item.link}
                  href={item.link}
                  onClick={closeMenu}
                  style={{
                    color: isActive(item.link) ? 'var(--accent-color, #bfa26a)' : 'var(--text-primary, #ededed)',
                    textDecoration: 'none',
                    fontSize: '0.9rem',
                    padding: '0.6rem',
                    borderRadius: '0.5rem',
                    background: isActive(item.link) ? 'rgba(191, 162, 106, 0.1)' : 'transparent'
                  }}
                >
                  {item.text}
                </Link>
              ))}

              {/* Mobile auth area */}
              <div style={{ marginTop: '2rem' }}>
                {mounted && isAuthenticated && (
                  <>
                    <Link
                      href={adminLink.link}
                      onClick={closeMenu}
                      style={{
                        color: isActive(adminLink.link) ? 'var(--accent-color, #bfa26a)' : 'var(--text-primary, #ededed)',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        padding: '0.6rem',
                        borderRadius: '0.5rem',
                        background: isActive(adminLink.link) ? 'rgba(191, 162, 106, 0.1)' : 'transparent',
                        display: 'block',
                        marginBottom: '1rem'
                      }}
                    >
                      {adminLink.text}
                    </Link>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        padding: '0.9rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        background: '#e63946',
                        color: 'white',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      Logout
                    </button>
                  </>
                )}
                
                {mounted && !isAuthenticated && (
                  <form onSubmit={handleLogin} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.9rem'
                  }}>
                    <input
                      type="password"
                      placeholder="Passwort"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.9rem',
                        background: 'var(--primary-bg, #0a0a0a)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '0.5rem',
                        color: 'var(--text-primary, #ededed)',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        width: '100%',
                        padding: '0.9rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        background: 'var(--accent-color, #bfa26a)',
                        color: 'white',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      Login
                    </button>
                    {error && (
                      <p style={{
                        color: '#ff4444',
                        fontSize: '0.8rem',
                        textAlign: 'center',
                        margin: 0
                      }}>
                        {error}
                      </p>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <style jsx>{`
        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: block !important;
          }
          
          nav > div > div:first-of-type {
            display: none !important;
          }
        }
        
        @media (min-width: 769px) {
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};

export default SimpleNavBar;
export const checkAuth = () => {
  if (typeof window === "undefined") return false;
  return document.cookie.includes("auth_token=");
};