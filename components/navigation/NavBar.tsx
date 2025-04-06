import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import styles from "./NavBar.module.css";

const PASSWORD = "Sexlust";
const COOKIE_NAME = "auth_token";
const COOKIE_EXPIRY = 10; // Minuten

// Nur ein Admin-Link für das Dashboard
const adminLink = { text: "Admin", link: "/admin" };

const publicItems = [
  { text: "Home", link: "/" },
  { text: "Profile", link: "/profile" },
  { text: "Anträge", link: "/tickets" },
  { text: "Shop", link: "/shop" },
  { text: "Regeln", link: "/rules" },
  { text: "Wiki", link: "/wiki/lust-o-meter" },
];

const checkAuth = () => {
  if (typeof window === "undefined") return false;
  return !!Cookies.get(COOKIE_NAME);
};

const Navigation = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setIsAuthenticated(checkAuth());
  }, []);

  const isActive = (path: string) => router.pathname === path;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD) {
      Cookies.set(COOKIE_NAME, "authenticated", {
        expires: COOKIE_EXPIRY / 1440,
      });
      setIsAuthenticated(true);
      setError("");
      setIsMenuOpen(false);
    } else {
      setError("Falsches Passwort");
    }
    setPassword("");
  };

  const handleLogout = () => {
    Cookies.remove(COOKIE_NAME);
    setIsAuthenticated(false);
    setIsMenuOpen(false);
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Velvet Reborn
        </Link>

        {/* Desktop Navigation */}
        <div className={styles.desktopLinks}>
          {publicItems.map((item) => (
            <Link
              key={item.link}
              href={item.link}
              className={`${styles.navLink} ${
                isActive(item.link) ? styles.active : ""
              }`}
            >
              {item.text}
            </Link>
          ))}

          {/* Admin Link, nur wenn authentifiziert */}
          {isAuthenticated && (
            <Link
              href={adminLink.link}
              className={`${styles.navLink} ${
                isActive(adminLink.link) ? styles.active : ""
              }`}
            >
              {adminLink.text}
            </Link>
          )}

          {isAuthenticated ? (
            <button className={styles.logoutButton} onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <div className={styles.loginContainer}>
              <form onSubmit={handleLogin} className={styles.loginForm}>
                <input
                  className={styles.passwordInput}
                  type="password"
                  placeholder="Passwort"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit" className={styles.loginButton}>
                  Login
                </button>
              </form>
              {error && <p className={styles.error}>{error}</p>}
            </div>
          )}
        </div>

        {/* Mobile Button */}
        <button
          className={styles.menuButton}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menü öffnen"
        >
          ☰
        </button>

        {/* Mobile Navigation Backdrop */}
        {isMenuOpen && <div className={styles.backdrop} onClick={closeMenu} />}

        {/* Mobile Navigation */}
        <div
          className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ""}`}
        >
          <div className={styles.mobileHeader}>
            <button className={styles.closeButton} onClick={closeMenu}>
              ✕
            </button>
          </div>

          <div className={styles.mobileContent}>
            {publicItems.map((item) => (
              <Link
                key={item.link}
                href={item.link}
                className={`${styles.mobileLink} ${
                  isActive(item.link) ? styles.active : ""
                }`}
                onClick={closeMenu}
              >
                {item.text}
              </Link>
            ))}

            {/* Admin Link in mobiler Ansicht, nur wenn authentifiziert */}
            {isAuthenticated && (
              <Link
                href={adminLink.link}
                className={`${styles.mobileLink} ${
                  isActive(adminLink.link) ? styles.active : ""
                }`}
                onClick={closeMenu}
              >
                {adminLink.text}
              </Link>
            )}

            {isAuthenticated ? (
              <button
                className={`${styles.mobileButton} ${styles.logoutButton}`}
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <form onSubmit={handleLogin} className={styles.mobileLogin}>
                <input
                  className={styles.mobileInput}
                  type="password"
                  placeholder="Passwort"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="submit"
                  className={`${styles.mobileButton} ${styles.loginButton}`}
                >
                  Login
                </button>
                {error && <p className={styles.error}>{error}</p>}
              </form>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
export { checkAuth };
