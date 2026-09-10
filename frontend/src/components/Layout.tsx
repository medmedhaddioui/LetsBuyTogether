import {
  ArrowUpRight,
  Bell,
  Menu,
  Moon,
  ShoppingBag,
  Sun,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import { api, unwrap } from "../lib/api";
import type { Notification } from "../lib/types";

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
      /* Theme still works when storage is unavailable. */
    }
  }, [theme]);
  const { data = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => unwrap<Notification[]>(api.get("/notifications")),
    enabled: !!user,
    refetchInterval: 30000,
  });
  const links = [
    ...(location.pathname === "/" ? [] : [["Explore", "/promotions"]]),
    ...(user
      ? [
          ["Dashboard", "/dashboard"],
          ["My groups", "/groups"],
          ["Favorites", "/favorites"],
        ]
      : []),
  ];
  const unread = data.filter((n) => !n.read).length;
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container-page flex h-20 items-center justify-between gap-4">
          <Link to="/" className="wordmark">
            <span className="brand-mark">
              <ShoppingBag size={20} strokeWidth={2} />
            </span>
            LetsBuyTogether
          </Link>
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-7 lg:flex"
          >
            {links.map(([name, to]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                {name}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="theme-toggle"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <div className="hidden items-center gap-3 lg:flex">
              {user ? (
                <>
                  <Link
                    className="theme-toggle relative"
                    to="/notifications"
                    aria-label={`Notifications, ${unread} unread`}
                  >
                    <Bell size={19} />
                    {unread > 0 && <span className="notification-dot" />}
                  </Link>
                  {user.role === "ADMIN" && (
                    <Link className="nav-link" to="/admin">
                      Admin
                    </Link>
                  )}
                  <Link className="nav-link" to="/settings">
                    {user.firstName}
                  </Link>
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
                  <Link className="btn-primary gap-2" to="/register">
                    Get started <ArrowUpRight size={17} />
                  </Link>
                </>
              )}
            </div>
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
        {open && (
          <nav
            id="mobile-menu"
            aria-label="Mobile navigation"
            className="container-page grid gap-3 border-t border-slate-200 py-5 lg:hidden"
          >
            {links.map(([name, to]) => (
              <Link className="nav-link py-2" key={to} to={to}>
                {name}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/settings">Account settings</Link>
                <Link to="/notifications">Notifications</Link>
                {user.role === "ADMIN" && <Link to="/admin">Admin</Link>}
                <button
                  className="btn-secondary"
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
                <Link className="btn-secondary" to="/login">
                  Log in
                </Link>
                <Link className="btn-primary" to="/register">
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
          <div className="flex gap-6">
            <Link to="/promotions">Explore products</Link>
            <Link
              to={
                user ? "/create-promotion" : "/register?next=/create-promotion"
              }
            >
              Post a product <ArrowUpRight size={13} className="inline" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
