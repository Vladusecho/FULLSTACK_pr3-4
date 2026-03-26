import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductById } from "../api/productsApi";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadProduct();
    const userStr = localStorage.getItem("user");
    if (userStr) setUser(JSON.parse(userStr));
  }, [id]);

  const loadProduct = async () => {
    try {
      const data = await getProductById(id);
      setProduct(data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-10">Загрузка...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
  if (!product) return <div className="text-center mt-10">Товар не найден</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4">{product.title}</h1>
      <p className="text-gray-600 mb-2">Категория: {product.category}</p>
      <p className="text-gray-800 mb-4">{product.description}</p>
      <p className="text-2xl font-bold text-green-600 mb-6">${product.price}</p>
      <div className="flex space-x-4">
        {user && (user.role === 'seller' || user.role === 'admin') && (
          <Link to={`/products/${id}/edit`} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
            Редактировать
          </Link>
        )}
        <Link to="/" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
          Назад к списку
        </Link>
      </div>
    </div>
  );
}