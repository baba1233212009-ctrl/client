import { useState } from "react";
import { registerUser, loginUser, getCurrentUser } from "./api";

function App() {
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [currentUser, setCurrentUser] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    const user = await registerUser(regName, regEmail, regPassword);
    if (user) alert(`Пользователь ${user.name} зарегистрирован!`);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const data = await loginUser(loginEmail, loginPassword);
    if (data) {
      alert("Вход успешен!");
      const me = await getCurrentUser();
      setCurrentUser(me);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      <h1>Регистрация</h1>
      <form onSubmit={handleRegister}>
        <input placeholder="Имя" value={regName} onChange={e => setRegName(e.target.value)} />
        <input placeholder="Email" value={regEmail} onChange={e => setRegEmail(e.target.value)} />
        <input type="password" placeholder="Пароль" value={regPassword} onChange={e => setRegPassword(e.target.value)} />
        <button type="submit">Зарегистрироваться</button>
      </form>

      <h1>Вход</h1>
      <form onSubmit={handleLogin}>
        <input placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
        <input type="password" placeholder="Пароль" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} />
        <button type="submit">Войти</button>
      </form>

      {currentUser && (
        <div>
          <h2>Текущий пользователь:</h2>
          <p>Имя: {currentUser.name}</p>
          <p>Email: {currentUser.email}</p>
        </div>
      )}
    </div>
  );
}

export default App;
