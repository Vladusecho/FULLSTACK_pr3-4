import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUsers, blockUser } from "../api/usersApi";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUsers();
    const userStr = localStorage.getItem("user");
    if (userStr) setUser(JSON.parse(userStr));
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async (id) => {
    if (window.confirm("Заблокировать пользователя?")) {
      try {
        await blockUser(id);
        setUsers(users.map(u => u.id === id ? { ...u, isBlocked: true } : u));
      } catch (err) {
        alert("Ошибка блокировки");
      }
    }
  };

  if (loading) return <div className="text-center mt-10">Загрузка...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <h1 className="text-3xl font-bold mb-6">Пользователи</h1>
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">ID</th>
            <th className="border border-gray-300 px-4 py-2">Email</th>
            <th className="border border-gray-300 px-4 py-2">Имя</th>
            <th className="border border-gray-300 px-4 py-2">Фамилия</th>
            <th className="border border-gray-300 px-4 py-2">Роль</th>
            <th className="border border-gray-300 px-4 py-2">Заблокирован</th>
            <th className="border border-gray-300 px-4 py-2">Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td className="border border-gray-300 px-4 py-2">{u.id}</td>
              <td className="border border-gray-300 px-4 py-2">{u.email}</td>
              <td className="border border-gray-300 px-4 py-2">{u.first_name}</td>
              <td className="border border-gray-300 px-4 py-2">{u.last_name}</td>
              <td className="border border-gray-300 px-4 py-2">{u.role}</td>
              <td className="border border-gray-300 px-4 py-2">{u.isBlocked ? 'Да' : 'Нет'}</td>
              <td className="border border-gray-300 px-4 py-2">
                <Link to={`/users/${u.id}/edit`} className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-2">
                  Редактировать
                </Link>
                {!u.isBlocked && (
                  <button onClick={() => handleBlock(u.id)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
                    Заблокировать
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}