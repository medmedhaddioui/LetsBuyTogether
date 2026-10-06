import { Menu, Moon, Search, ShoppingBag, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(() =>
    document.documentElement.dataset.theme === "light" ? "light" : "dark",
  );
  const nav = useNavigate();
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("jme3na-theme", theme);
    } catch {
      /* storage unavailable */
    }
  }, [theme]);

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container-page flex h-20 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="wordmark">
            <span className="brand-mark">
              <ShoppingBag size={20} strokeWidth={2} />
            </span>
            LetsBuyTogether
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main navigation" className="hidden items-center gap-7 lg:flex">
            <NavLink
              to="/search"
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              Browse deals
            </NavLink>
          </nav>

          {/* Right side controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme toggle */}
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            {/* Auth buttons — desktop */}
            <div className="hidden items-center gap-3 lg:flex">
              {user ? (
                <>
                  <Link to="/search" className="nav-link">
                    <Search size={15} className="inline mr-1" />
                    Browse
                  </Link>
                  <span className="nav-link px-2 opacity-60">
                    Hi, {user.firstName}
                  </span>
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      logout();
                      nav("/");
                    }}
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link className="nav-link px-3" to="/login">
                    Log in
                  </Link>
                  <Link className="btn-primary" to="/register">
                    Get started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              className="theme-toggle lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <nav
            id="mobile-menu"
            aria-label="Mobile navigation"
            className="container-page grid gap-3 border-t border-slate-200 py-5 lg:hidden"
          >
            <Link className="nav-link py-2" to="/search">
              Browse deals
            </Link>
            {user ? (
              <>
                <span className="nav-link py-2 opacity-60">
                  Logged in as {user.firstName}
                </span>
                <button
                  className="btn-secondary w-full"
                  onClick={() => {
                    logout();
                    setOpen(false);
                    nav("/");
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link className="btn-secondary w-full text-center py-3" to="/login">
                  Log in
                </Link>
                <Link className="btn-primary w-full text-center py-3" to="/register">
                  Get started
                </Link>
              </>
            )}
          </nav>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="site-footer">
        <div className="container-page flex flex-wrap items-center justify-between gap-5">
          <Link to="/" className="wordmark text-lg">
            LetsBuyTogether
          </Link>
          <p>A good thing, shared.</p>
          <Link to="/search">Browse deals</Link>
        </div>
      </footer>
    </div>
  );
}
