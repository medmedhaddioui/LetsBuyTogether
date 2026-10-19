import { Navigate, Route, Routes } from "react-router-dom";
import { CompleteProfilePage } from "../features/auth/pages/CompleteProfilePage";
import { AuthPage } from "../features/auth/pages/AuthPage";
import { HomePage } from "../features/home/pages/HomePage";
import { BrowseProductsPage } from "../features/products/pages/BrowseProductsPage";
import { NewPostPage } from "../features/products/pages/NewPostPage";
import { ProfilePage } from "../features/profile/pages/ProfilePage";
import { MyActivityPage } from "../features/products/pages/MyActivityPage";
import { StartChoicePage } from "../features/onboarding/pages/StartChoicePage";
import { RequireAuth } from "../shared/routing/RequireAuth";

import { AppLayout } from "../shared/layout/AppLayout";

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="/complete-profile"
          element={
            <RequireAuth>
              <CompleteProfilePage />
            </RequireAuth>
          }
        />
        <Route path="/register" element={<AuthPage register />} />
        <Route path="/search" element={<BrowseProductsPage />} />
        <Route
          path="/get-started"
          element={
            <RequireAuth>
              <StartChoicePage />
            </RequireAuth>
          }
        />
        <Route path="/requests/new" element={<Navigate to="/search" replace />} />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route
          path="/posts/new"
          element={
            <RequireAuth>
              <NewPostPage />
            </RequireAuth>
          }
        />
        <Route
          path="/activity"
          element={
            <RequireAuth>
              <MyActivityPage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}
