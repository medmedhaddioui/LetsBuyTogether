import { Navigate, Route, Routes } from "react-router-dom";
import { AuthPage } from "../features/auth/pages/AuthPage";
import { HomePage } from "../features/home/pages/HomePage";
import { SearchPage } from "../features/promotions/pages/SearchPage";

import { AppLayout } from "../shared/layout/AppLayout";

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage register />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}
