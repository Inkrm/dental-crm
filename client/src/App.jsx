import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardLayout from "./pages/DashboardLayout.jsx";
import PatientsPage from "./pages/PatientsPage.jsx";
import AppointmentsPage from "./pages/AppointmentsPage.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import UsersPage from "./pages/UsersPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/patients" replace />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="users" element={<UsersPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
