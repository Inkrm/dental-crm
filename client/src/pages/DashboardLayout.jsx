import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { clearToken } from "../api.js";

function Item({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        "block rounded-xl px-3 py-2 text-sm " +
        (isActive ? "bg-white text-black" : "text-white/80 hover:bg-white/10")
      }
    >
      {children}
    </NavLink>
  );
}

export default function DashboardLayout() {
  const nav = useNavigate();

  function logout() {
    clearToken();
    nav("/login");
  }

  return (
    <div className="min-h-screen bg-[#31314a] text-white">
      <div className="mx-auto max-w-6xl p-4 md:p-6 grid gap-4 md:grid-cols-[240px_1fr]">
        <aside className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-4">
            <div className="text-lg font-semibold">DENTAL CRM</div>
            <div className="text-xs text-white/50">Admin / Recepție / Doctor</div>
          </div>

          <nav className="grid gap-2">
            <Item to="/patients">Pacienți</Item>
            <Item to="/appointments">Programări</Item>
            <Item to="/users">Utilizatori</Item>
          </nav>

          <button
            onClick={logout}
            className="mt-6 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Logout
          </button>
        </aside>

        <main className="rounded-2xl border border-white/10 bg-white/5 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
