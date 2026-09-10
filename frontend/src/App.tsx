import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Layout } from "./components/Layout";
import { useAuth } from "./contexts/AuthContext";
import { Home } from "./pages/Home";
import { AuthPage } from "./pages/Auth";
import { Promotions } from "./pages/Promotions";
import { PromotionDetail } from "./pages/PromotionDetail";
import { GroupDetail } from "./pages/GroupDetail";
import {
  Dashboard,
  Favorites,
  Groups,
  Notifications,
  Settings,
} from "./pages/AccountPages";
import { CreatePromotion } from "./pages/CreatePromotion";
import { Admin } from "./pages/Admin";
import { ProfilePage, StorePage } from "./pages/PublicProfiles";
import { Loading } from "./components/ui";
function Protected({
  children,
  admin = false,
}: {
  children: React.ReactNode;
  admin?: boolean;
}) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loading />;
  if (!user)
    return (
      <Navigate
        to={
          location.pathname === "/create-promotion"
            ? "/register?next=/create-promotion"
            : "/login"
        }
        replace
      />
    );
  if (admin && user.role !== "ADMIN")
    return <Navigate to="/dashboard" replace />;
  return children;
}
export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage register />} />
        <Route path="/promotions" element={<Promotions />} />
        <Route path="/promotions/:id" element={<PromotionDetail />} />
        <Route path="/stores/:id" element={<StorePage />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route
          path="/dashboard"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />
        <Route
          path="/groups"
          element={
            <Protected>
              <Groups />
            </Protected>
          }
        />
        <Route path="/groups/:id" element={<GroupDetail />} />
        <Route
          path="/create-promotion"
          element={
            <Protected>
              <CreatePromotion />
            </Protected>
          }
        />
        <Route
          path="/favorites"
          element={
            <Protected>
              <Favorites />
            </Protected>
          }
        />
        <Route
          path="/notifications"
          element={
            <Protected>
              <Notifications />
            </Protected>
          }
        />
        <Route
          path="/settings"
          element={
            <Protected>
              <Settings />
            </Protected>
          }
        />
        <Route
          path="/admin/*"
          element={
            <Protected admin>
              <Admin />
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}
