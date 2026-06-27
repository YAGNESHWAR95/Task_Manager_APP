import { useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://task-manager-app-lgfl.onrender.com';

function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { username, email, password, confirmPassword } = formData;

    // Validate inputs
    if (!email) {
      setError('Email address is required.');
      setLoading(false);
      return;
    }
    if (!password) {
      setError('Password is required.');
      setLoading(false);
      return;
    }

    if (!isLogin) {
      if (!username) {
        setError('Username is required for registration.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter them.');
        setLoading(false);
        return;
      }
    }

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin 
        ? { email, password } 
        : { username, email, password };

      const res = await axios.post(`${API_BASE}${endpoint}`, payload);
      
      const { token, user } = res.data;
      onAuthSuccess(token, user);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-xl transition-all duration-300">
        
        {/* Logo / Header */}
        <div className="text-center">
          <span className="px-3.5 py-1 text-[10px] uppercase tracking-widest font-extrabold text-blue-600 bg-blue-50 border border-blue-200 rounded-full">
            Secure Workspace
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-800 tracking-tight">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="mt-2 text-sm text-slate-450">
            {isLogin ? 'Sign in to access your personal dashboard' : 'Get started by creating your private workspace'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${isLogin ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-650'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${!isLogin ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-650'}`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 text-red-650 border border-red-150 p-4 rounded-xl text-xs font-semibold flex items-center gap-3 animate-fadeIn">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          
          {/* Username (Sign Up Only) */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-1">Username</label>
              <input
                type="text"
                name="username"
                autoComplete="username"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                placeholder="Enter your username (e.g. yagnesh95)"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-1">Email address</label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
              placeholder="Enter your email address (e.g. you@example.com)"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-1">Password</label>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
              placeholder="Enter your password (min 6 characters)"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {/* Confirm Password (Sign Up Only) */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-450 uppercase tracking-wider mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-205 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                placeholder="Re-enter your password to match"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] mt-6 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              isLogin ? 'Sign In' : 'Sign Up'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Auth;
