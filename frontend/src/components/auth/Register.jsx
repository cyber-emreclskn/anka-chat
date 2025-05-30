import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, selectAuthStatus, selectAuthError, resetAuthStatus } from '../../features/auth/authSlice';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  useEffect(() => {
    // Reset auth status when component mounts
    dispatch(resetAuthStatus());
    
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate('/');
    }
  }, [dispatch, isAuthenticated, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate password match
    if (password !== confirmPassword) {
      setPasswordError('Şifreler eşleşmiyor');
      return;
    }
    
    setPasswordError('');
    
    // Register user
    dispatch(register({ username, email, password }));
  };

  useEffect(() => {
    if (status === 'succeeded') {
      navigate('/login');
    }
  }, [status, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-discord-dark">
      <div className="w-full max-w-md p-6 bg-discord-sidebar rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-white mb-6">AnkaChat'e Kayıt Ol</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-500 bg-opacity-25 border border-red-700 text-red-100 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-discord-lightest mb-1">
              Kullanıcı Adı
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="input-field w-full"
              placeholder="Kullanıcı adınızı girin"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-discord-lightest mb-1">
              E-posta
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-field w-full"
              placeholder="E-posta adresinizi girin"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-discord-lightest mb-1">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field w-full"
              placeholder="Şifrenizi girin"
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-discord-lightest mb-1">
              Şifreyi Doğrula
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="input-field w-full"
              placeholder="Şifrenizi tekrar girin"
            />
            {passwordError && (
              <p className="mt-1 text-sm text-red-400">{passwordError}</p>
            )}
          </div>
          
          <div>
            <button
              type="submit"
              disabled={status === 'loading'}
              className="btn-primary w-full"
            >
              {status === 'loading' ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}
            </button>
          </div>
        </form>
        
        <div className="mt-4 text-center text-discord-lightest">
          <p>
            Zaten hesabınız var mı?{' '}
            <Link to="/login" className="text-discord-accent hover:underline">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
