// pages/auth.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const AuthPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    try {
      const endpoint = isLogin ? '/api/login' : '/api/registration';
      const response = await axios.post(endpoint, { username, password });

      if (response.status === 200) {
        // Set the 'username' cookie with the logged-in or registered username
        document.cookie = `username=${username}; path=/;`;

        // Redirect to the '/parsing' page after successful login or registration
        router.push('/parsing');
       
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError(isLogin ? 'Ошибка при входе' : 'Ошибка при регистрации');
      console.error('Error during authentication:', error);
    }
  };

  return (

    <main>

    <header className="navbar">
    <div className="navbar-inner">
      <div className="navbar-inner-logo">Sortnum</div>
      <a href="/">
        <button className="navbar-inner-content">
          <h2>Перейти Домой</h2>
          <img src="./images/arrow.png" alt="arrow" />
        </button>
      </a>
    </div>
  </header>
  <div className="auth-container">
        <h1 className="auth-title">{isLogin ? 'Авторизация' : 'Регистрация'}</h1>
        {error && <div className="auth-error">{error}</div>}
        <div>
          <label className="auth-label">Имя пользователя:</label>
          <input
            className="auth-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label className="auth-label">Пароль:</label>
          <input
            className="auth-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="auth-button" onClick={handleAuth}>
          {isLogin ? 'Войти' : 'Зарегистрироваться'}
        </button>
        <div className="auth-switch">
          {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
          <button className="auth-switch-button" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </div>
      </div>
      <footer className="footer" style={{width: '100%', position: 'fixed', bottom: '0'}}>
        <div className="footer-content">
          <div className="footer-content-icons">
            <a href="https://wa.me/+79187301076">
              <img src="./images/social/img5.svg" alt="social5" />
            </a>
            <a href="https://t.me/sortnum">
              <img src="./images/social/img3.svg" alt="social3" />
            </a>
          </div>
          <div className="footer-content-logo">Sortnum</div>
        </div>
      </footer>
    </main>

  );
};

export default AuthPage;
