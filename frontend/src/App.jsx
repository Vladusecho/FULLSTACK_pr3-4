import { useEffect, useMemo, useState } from "react";
import { 
  createProduct, 
  deleteProduct, 
  getProducts, 
  updateProduct 
} from "./api/productsApi";

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Состояния для формы
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState("");
  const [img, setImg] = useState("");

  // Валидация формы
  const canSubmit = useMemo(
    () => title.trim() !== "" && price !== "" && !isNaN(Number(price)) && Number(price) >= 0,
    [title, price]
  );

  // Загрузка продуктов
  async function load() {
    setError("");
    setLoading(true);
    try {
      console.log("Загружаем продукты...");
      const data = await getProducts();
      console.log("Получены продукты:", data);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Обработка ошибок
  function handleError(err) {
    console.error("Ошибка:", err);
    
    if (err.code === 'ERR_NETWORK') {
      setError(
        "Не удалось подключиться к серверу.\n" +
        "Проверьте:\n" +
        "1. Запущен ли сервер (node server.js)\n" +
        "2. Правильный ли порт (3000)\n" +
        "3. Нет ли ошибок CORS"
      );
    } else if (err.response) {
      setError(`Ошибка сервера: ${err.response.status} - ${err.response.data?.error || err.response.statusText}`);
    } else {
      setError(`Ошибка: ${err.message}`);
    }
  }

  // Добавление продукта
  async function onAdd(e) {
    e.preventDefault();
    if (!canSubmit) return;

    setError("");
    try {
      const productData = {
        title: title.trim(),
        price: Number(price),
        category: category.trim() || "Без категории",
        description: description.trim() || "",
        stock: stock ? Number(stock) : 0,
        imageUrl: img
      };
      
      console.log("Создаем продукт:", productData);
      await createProduct(productData);

      // Очищаем форму
      setTitle("");
      setPrice("");
      setCategory("");
      setDescription("");
      setStock("");
      setImg("");

      await load();
    } catch (err) {
      handleError(err);
    }
  }

  // Удаление продукта
  async function onDelete(id) {
    if (!window.confirm("Удалить этот товар?")) return;

    setError("");
    try {
      console.log("Удаляем продукт:", id);
      await deleteProduct(id);
      await load();
    } catch (err) {
      handleError(err);
    }
  }

  // Увеличение цены
  async function onPricePlus(id, currentPrice) {
    setError("");
    try {
      console.log("Обновляем цену продукта:", id);
      await updateProduct(id, { price: Number(currentPrice) + 10 });
      await load();
    } catch (err) {
      handleError(err);
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📦 Управление товарами</h1>

      {/* Статус подключения */}
      <div style={styles.statusBar}>
        <span>🔌 Сервер: {loading ? '⏳' : error ? '❌' : '✅'}</span>
        <span>📊 Товаров: {items.length}</span>
        <button onClick={load} style={styles.refreshButton}>🔄 Обновить</button>
      </div>

      {/* Форма добавления */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>➕ Добавить товар</h2>
        
        <form onSubmit={onAdd} style={styles.form}>
          <div style={styles.row}>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Название *"
              style={styles.input}
              disabled={loading}
            />
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Цена *"
              type="number"
              min="0"
              step="0.01"
              style={{...styles.input, width: '120px'}}
              disabled={loading}
            />
            <input
              value={img}
              onChange={(e) => setImg(e.target.value)}
              placeholder="Ссылка на изображение *"
              type="text"
              style={{...styles.input, width: '120px'}}
              disabled={loading}
            />
          </div>

          <div style={styles.row}>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Категория"
              style={styles.input}
              disabled={loading}
            />
            <input
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Количество"
              type="number"
              min="0"
              style={{...styles.input, width: '120px'}}
              disabled={loading}
            />
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание"
            style={styles.textarea}
            rows="3"
            disabled={loading}
          />

          <button 
            type="submit" 
            disabled={!canSubmit || loading}
            style={{
              ...styles.button,
              ...styles.primaryButton,
              opacity: (!canSubmit || loading) ? 0.5 : 1
            }}
          >
            {loading ? 'Добавление...' : 'Добавить товар'}
          </button>
        </form>
      </section>

      {/* Ошибки */}
      {error && (
        <div style={styles.error}>
          <strong>❌ Ошибка:</strong>
          <pre style={styles.errorText}>{error}</pre>
        </div>
      )}

      {/* Загрузка */}
      {loading && (
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Загрузка...</p>
        </div>
      )}

      {/* Список товаров */}
      {!loading && !error && (
        <>
          {items.length === 0 ? (
            <div style={styles.empty}>
              <p>📭 Товаров пока нет. Добавьте первый товар!</p>
            </div>
          ) : (
            <div style={styles.grid}>
              {items.map((product) => (
                <div key={product.id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>{product.title}</h3>
                    <span style={styles.cardCategory}>
                      {product.category || 'Без категории'}
                    </span>
                  </div>
                  <img  style={styles.img} src={product.imageUrl}/>
                  <div style={styles.cardBody}>
                    <p style={styles.cardDescription}>
                      {product.description || 'Нет описания'}
                    </p>
                    
                    <div style={styles.cardMeta}>
                      <span style={styles.cardPrice}>
                        💰 {product.price} ₽
                      </span>
                      <span style={styles.cardStock}>
                        📦 {product.stock || 0} шт.
                      </span>
                    </div>
                  </div>
                  
                  <div style={styles.cardActions}>
                    <button type="button"
                      onClick={() => onPricePlus(product.id, product.price)}
                      style={{...styles.actionButton, ...styles.plusButton}}
                      disabled={loading}
                    >
                      +10 ₽
                    </button>
                    <button type="button"
                      onClick={() => onDelete(product.id)}
                      style={{...styles.actionButton, ...styles.deleteButton}}
                      disabled={loading}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Стили
const styles = {
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: 24,
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  img: {
    objectFit: "cover",
    width: "100%",
    height: 300
  },
  title: {
    fontSize: "2rem",
    color: "#333",
    marginBottom: 32,
    textAlign: "center",
  },
  statusBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 24,
    fontSize: "0.9rem",
  },
  refreshButton: {
    padding: "6px 12px",
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: 4,
    cursor: "pointer",
  },
  section: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    marginBottom: 32,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    fontSize: "1.5rem",
    color: "#444",
    marginBottom: 20,
    marginTop: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  row: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
  },
  input: {
    flex: 1,
    padding: 12,
    border: "2px solid #e0e0e0",
    borderRadius: 8,
    fontSize: "1rem",
    outline: "none",
    ":focus": {
      borderColor: "#4CAF50",
    },
  },
  textarea: {
    width: "100%",
    padding: 12,
    border: "2px solid #e0e0e0",
    borderRadius: 8,
    fontSize: "1rem",
    fontFamily: "inherit",
    resize: "vertical",
    outline: "none",
  },
  button: {
    padding: "12px 24px",
    border: "none",
    borderRadius: 8,
    fontSize: "1rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.3s",
  },
  primaryButton: {
    backgroundColor: "#4CAF50",
    color: "white",
    ":hover:not(:disabled)": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    },
  },
  error: {
    backgroundColor: "#ffebee",
    color: "#c62828",
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    whiteSpace: "pre-wrap",
    margin: "10px 0",
    fontFamily: "monospace",
  },
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: 48,
    color: "#666",
  },
  spinner: {
    width: 40,
    height: 40,
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #4CAF50",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    marginBottom: 16,
  },
  empty: {
    textAlign: "center",
    padding: 48,
    color: "#999",
    fontSize: "1.1rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 20,
  },
  card: {
    border: "1px solid #e0e0e0",
    borderRadius: 12,
    overflow: "hidden",
    transition: "transform 0.3s, boxShadow 0.3s",
    ":hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    },
  },
  cardHeader: {
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderBottom: "1px solid #e0e0e0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    margin: 0,
    fontSize: "1.1rem",
    color: "#333",
  },
  cardCategory: {
    fontSize: "0.8rem",
    color: "#666",
    backgroundColor: "#e0e0e0",
    padding: "4px 8px",
    borderRadius: 4,
  },
  cardBody: {
    padding: 16,
  },
  cardDescription: {
    margin: "0 0 12px 0",
    color: "#666",
    fontSize: "0.9rem",
    lineHeight: 1.5,
  },
  cardMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardPrice: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    color: "#2c3e50",
  },
  cardStock: {
    fontSize: "0.9rem",
    color: "#27ae60",
  },
  cardActions: {
    padding: 16,
    borderTop: "1px solid #e0e0e0",
    display: "flex",
    gap: 8,
  },
  actionButton: {
    padding: "8px 16px",
    border: "none",
    borderRadius: 6,
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "all 0.2s",
    flex: 1,
    ":hover:not(:disabled)": {
      opacity: 0.9,
    },
    ":disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
    },
  },
  plusButton: {
    backgroundColor: "#3498db",
    color: "white",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    color: "white",
  },
};

// Добавляем анимацию спиннера
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);