import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, updateUser } from "../api/usersApi";

export default function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    role: "user",
    isBlocked: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [id]);

  const loadUser = async () => {
    try {
      const data = await getUserById(id);
      setForm({
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role,
        isBlocked: data.isBlocked,
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser(id, form);
      navigate("/users");
    } catch (err) {
      alert("Ошибка обновления");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  if (loading) return <div className="text-center mt-10">Загрузка...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Редактировать пользователя</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Имя</label>
          <input
            type="text"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Фамилия</label>
          <input
            type="text"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Роль</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="user">Пользователь</option>
            <option value="seller">Продавец</option>
            <option value="admin">Администратор</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isBlocked"
              checked={form.isBlocked}
              onChange={handleChange}
              className="mr-2"
            />
            Заблокирован
          </label>
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
          Сохранить
        </button>
      </form>
    </div>
  );
}