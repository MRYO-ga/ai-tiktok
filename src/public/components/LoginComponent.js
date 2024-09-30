const LoginComponent = ({ isLoggedIn, setIsLoggedIn, username, setUsername }) => {
  const [showForm, setShowForm] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
    try {
      console.log('Sending auth request to:', endpoint);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log('Auth response:', data);

      if (response.ok) {
        if (!isRegistering) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('username', data.username);
          setIsLoggedIn(true);
          setUsername(data.username);
          setMessage('登录成功');
        } else {
          setMessage('注册成功,请登录');
          setIsRegistering(false);
        }
        setShowForm(false);
      } else {
        setMessage(data.message || '操作失败');
        console.error('Auth error:', data);
      }
    } catch (error) {
      console.error('认证错误:', error);
      setMessage('操作失败,请稍后重试');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUsername('');
    setMessage('已登出');
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  const handleGitHubLogin = () => {
    window.location.href = '/api/auth/github';
  };

  // 添加一个新的 useEffect 来处理 OAuth 回调
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      setIsLoggedIn(true);
      // 这里你可能需要解析 JWT 来获取用户名
      // 或者发送一个请求到服务器来获取用户信息
      setUsername('OAuth User');
      // 清除 URL 中的 token
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  return (
    <div className="login-section p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md m-4">
      {!isLoggedIn ? (
        <>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            {showForm ? '关闭' : (isRegistering ? '注册' : '登录')}
          </button>
          {showForm && (
            <form onSubmit={handleAuth} className="mt-4 space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">用户名</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">密码</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <button 
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isRegistering ? '注册' : '登录'}
              </button>
              <button 
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="w-full text-center py-2 px-4 text-sm text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
              >
                {isRegistering ? '已有账号? 登录' : '没有账号? 注册'}
              </button>
              <div className="flex flex-col space-y-2">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {isLoading ? '登录中...' : '使用 Google 登录'}
                </button>
                <button
                  type="button"
                  onClick={handleGitHubLogin}
                  className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" fill="currentColor"/>
                  </svg>
                  使用 GitHub 登录
                </button>
              </div>
            </form>
          )}
        </>
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-green-500 font-semibold">欢迎, {username}!</span>
          <button 
            onClick={handleLogout}
            className="ml-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            登出
          </button>
        </div>
      )}
      {message && (
        <div className={`mt-2 p-2 rounded-md ${message.includes('成功') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

window.LoginComponent = LoginComponent;