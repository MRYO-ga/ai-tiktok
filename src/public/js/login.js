document.addEventListener('DOMContentLoaded', () => {
  const loginBtn = document.getElementById('loginBtn');
  const loginForm = document.getElementById('loginForm');
  const submitLogin = document.getElementById('submitLogin');
  const loginMessage = document.getElementById('loginMessage');

  loginBtn.addEventListener('click', () => {
    loginForm.style.display = loginForm.style.display === 'none' ? 'block' : 'none';
  });

  submitLogin.addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        loginMessage.textContent = '登录成功';
        loginMessage.style.color = 'green';
        loginForm.style.display = 'none';
        loginBtn.textContent = '已登录';
        loginBtn.disabled = true;
      } else {
        const errorData = await response.json();
        loginMessage.textContent = errorData.message;
        loginMessage.style.color = 'red';
      }
    } catch (error) {
      console.error('登录错误:', error);
      loginMessage.textContent = '登录失败,请稍后重试';
      loginMessage.style.color = 'red';
    }
  });
});