import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { api, clearToken } from "../api.js";
import { applyThemeMode, clearStoredThemeMode } from "../theme.js";

function Item({ to, children }) {
  // element de navigare cu stil activ
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        "nav-item flex items-center gap-2 rounded-xl px-3 py-2 text-sm " +
        (isActive ? "is-active " : "") +
        (isActive ? "bg-white text-black" : "text-white/80 hover:bg-white/10")
      }
    >
      {children}
    </NavLink>
  );
}

export default function DashboardLayout() {
  // navigare programatica pentru redirect
  const nav = useNavigate();

  useEffect(() => {
    let active = true;
    async function loadMeTheme() {
      try {
        const me = await api("/users/me");
        if (!active) return;
        applyThemeMode(me.themeMode || "SYSTEM");
      } catch {
        // noop: fallback pe tema deja aplicata local
      }
    }
    loadMeTheme();
    return () => {
      active = false;
    };
  }, []);

  function logout() {
    // sterge tokenul si redirectioneaza la login
    clearToken();
    clearStoredThemeMode();
    applyThemeMode("SYSTEM");
    nav("/login");
  }

  return (
    <div className="app-shell min-h-screen text-white">
      <div className="mx-auto p-4 md:p-6 grid gap-4 md:grid-cols-[240px_1fr]">
        <aside className="panel rounded-2xl p-4">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="text-lg font-semibold">DENTAL CRM</div>
              <div className="text-xs text-white/50">Sistem de Management</div>
            </div>
          </div>

          <nav className="grid gap-2">
            <Item to="/patients">
              <span className="nav-icon inline-flex h-8 w-8 items-center justify-center rounded-md bg-white">
                <img src="/icons/customer.png" alt="" className="h-5 w-5" />
              </span>
              Pacienți
            </Item>

            <Item to="/appointments">
              <span className="nav-icon inline-flex h-8 w-8 items-center justify-center rounded-md bg-white">
                <img src="/icons/event.png" alt="" className="h-5 w-5" />
              </span>
              Programări
            </Item>

            <Item to="/users">
              <span className="nav-icon inline-flex h-8 w-8 items-center justify-center rounded-md bg-white">
                <img src="/icons/user.png" alt="" className="h-5 w-5" />
              </span>
              Utilizatori
            </Item>

            <Item to="/options">
              <span className="nav-icon inline-flex h-8 w-8 items-center justify-center rounded-md bg-white">
                <img src="/icons/setting.png" alt="" className="h-5 w-5" />
              </span>
              Setări
            </Item>
          </nav>

          <button
            onClick={logout}
            className="mt-6 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Ieșire
          </button>
        </aside>

        <main className="panel rounded-2xl p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
