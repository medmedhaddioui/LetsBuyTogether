import {
  Menu,
  Moon,
  ShoppingBag,
  Sun,
  X,
  LayoutDashboard,
  UserRound,
  PackagePlus,
  ListFilter,
  Activity,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../features/auth/hooks/use-auth";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [theme, setTheme] = useState(() =>
    document.documentElement.dataset.theme === "light" ? "light" : "dark",
  );
  const nav = useNavigate();
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("letsbuytogether-theme", theme);
    } catch {
      /* storage unavailable */
    }
  }, [theme]);

  const handleLogout = async () => {
    try {
      setLogoutError("");
      await logout();
      setOpen(false);
      nav("/");
    } catch {
      setLogoutError("Unable to log out. Please try again.");
    }
  };

  return (
    <div className="portal-shell">
      <header className="portal-mobile-header">
        <Link to="/" className="wordmark">
          <ShoppingBag size={20} />
          LetsBuyTogether
        </Link>
        <button
          type="button"
          className="theme-toggle"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="dashboard-sidebar"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>
      <aside id="dashboard-sidebar" className={`portal-sidebar ${open ? "is-open" : ""}`}>
        <Link to="/" className="wordmark portal-brand">
          <span className="brand-mark">
            <ShoppingBag size={19} />
          </span>
          <span>LetsBuyTogether</span>
        </Link>
        <div className="portal-nav-label">WORKSPACE</div>
        <nav aria-label="Dashboard navigation" className="portal-nav">
          <NavLink to="/" end>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/search">
            <ListFilter size={18} />
            <span>Browse products</span>
          </NavLink>

          <NavLink to="/posts/new">
            <PackagePlus size={18} />
            <span>Post a product</span>
          </NavLink>
          {user && (
            <NavLink to="/activity">
              <Activity size={18} />
              <span>My activity</span>
            </NavLink>
          )}
          {user && (
            <NavLink to="/profile">
              <UserRound size={18} />
              <span>My profile</span>
            </NavLink>
          )}
        </nav>
        <div className="portal-sidebar-bottom">
          <button
            type="button"
            className="portal-setting"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            <span>{theme === "dark" ? "Light appearance" : "Dark appearance"}</span>
          </button>
          {user ? (
            <>
              <Link to="/profile" className="portal-account">
                <span className="portal-avatar">
                  {user.photoUrl ? (
                    <img src={user.photoUrl} alt="" />
                  ) : (
                    user.username.slice(0, 1).toUpperCase()
                  )}
                </span>
                <div>
                  <strong>{user.username}</strong>
                  <small>View your profile</small>
                </div>
              </Link>
              <button type="button" className="portal-setting" onClick={handleLogout}>
                <LogOut size={18} />
                <span>Log out</span>
              </button>
            </>
          ) : (
            <div className="portal-auth">
              <Link to="/login">Log in</Link>
              <Link to="/register">Create account</Link>
            </div>
          )}
          {logoutError && (
            <p role="alert" className="portal-logout-error">
              {logoutError}
            </p>
          )}
        </div>
      </aside>
      <main className="portal-main" id="main-content">
        {children}
      </main>
    </div>
  );
}
