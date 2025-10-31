import { useState } from "react";
import { registerUser } from "../api";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = await registerUser(name, email, password);
    if (user) alert(`Пользователь ${user.name} зарегистрирован!`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Имя" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit">Регистрация</button>
    </form>
  );
}
