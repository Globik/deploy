import React, { useState } from "react";
import axios from "axios";

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post("/api/loginAdmin", { username, password });
      if (response.status === 200) {
        // Вход успешен, перенаправьте на страницу админ-панели
        window.location.href = "/admin";
      }
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Произошла ошибка при входе");
      }
    }
  };
  

  return (
    <div>
      <h2>Вход для администратора</h2>
      <div>
        <label>Имя пользователя:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label>Пароль:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <button onClick={handleLogin}>Войти</button>
      </div>
      {errorMessage && <p>{errorMessage}</p>}
    </div>
  );
};

export default AdminLogin;
