import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts, deleteProduct } from "../api/productsApi";

export default function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadProducts();
    const userStr = localStorage.getItem("user");
    if (userStr) setUser(JSON.parse(userStr));
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Удалить товар?")) {
      try {
        await deleteProduct(id);
        setProducts(products.filter(p => p.id !== id));
      } catch (err) {
        alert("Ошибка удаления");
      }
    }
  };

  if (loading) return <div className="text-center mt-10">Загрузка...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Товары</h1>
        <div className="flex space-x-4">
          {user && user.role === 'admin' && (
            <Link to="/users" className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
              Управление пользователями
            </Link>
          )}
          {user && ['seller', 'admin'].includes(user.role?.toLowerCase()) && (
            <Link to="/products/new" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Добавить товар
            </Link>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-white/95 p-5 rounded-2xl shadow-xl border border-white/30 transition hover:-translate-y-1 hover:shadow-2xl">
            <h2 className="text-xl font-semibold mb-2 text-slate-900">{product.title}</h2>
            <p className="text-gray-600 mb-2">{product.category}</p>
            <p className="text-gray-800 mb-2">{product.description}</p>
            <p className="text-lg font-bold text-green-600">${product.price}</p>
            <div className="flex space-x-2 mt-4">
              <Link to={`/products/${product.id}`} className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600">
                Просмотр
              </Link>
              {user && (user.role === 'seller' || user.role === 'admin') && (
                <Link to={`/products/${product.id}/edit`} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">
                  Редактировать
                </Link>
              )}
              {user && user.role === 'admin' && (
                <button onClick={() => handleDelete(product.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                  Удалить
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}