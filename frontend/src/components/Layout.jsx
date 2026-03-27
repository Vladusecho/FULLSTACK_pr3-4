import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Layout({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-cyan-700 text-slate-100">
      <header className="border-b border-white/20 bg-white/10 backdrop-blur-sm shadow-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/30 flex items-center justify-center text-lg font-bold text-indigo-900">S</div>
            <div>
              <h1 className="text-lg font-bold text-white">ShopStudio</h1>
              <p className="text-xs text-white/70">Управление товарами и пользователями</p>
            </div>
          </div>

          <nav className="flex items-center gap-3 text-sm md:gap-4">
            <Link className="rounded-lg px-3 py-2 font-medium text-white hover:bg-white/20" to="/">Товары</Link>
            <Link className="rounded-lg px-3 py-2 font-medium text-white hover:bg-white/20" to="/products/new">Новый товар</Link>
            {user?.role === "admin" && (
              <Link className="rounded-lg px-3 py-2 font-medium text-white hover:bg-white/20" to="/users">Пользователи</Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="text-right text-xs leading-tight">
                  <div className="font-semibold text-white">{user.first_name} {user.last_name}</div>
                  <div className="text-white/70">{user.role}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-red-400"
                >
                  Выйти
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="rounded-lg bg-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/30"
              >
                Войти
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">{children}</main>
    </div>
  );
}
