// api.js
// Все запросы к серверу через VITE_API_URL

export async function registerUser(name, email, password) {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Ошибка регистрации");

    return data;
  } catch (err) {
    console.error("Registration error:", err);
    alert(err.message);
  }
}

export async function loginUser(email, password) {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Ошибка входа");

    localStorage.setItem("token", data.token);
    return data;
  } catch (err) {
    console.error("Login error:", err);
    alert(err.message);
  }
}

export async function getCurrentUser() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": Bearer ${token}
      }
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Ошибка получения пользователя");

    return data;
  } catch (err) {
    console.error("Get user error:", err);
  }
}
