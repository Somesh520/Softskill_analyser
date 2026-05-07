import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Lock, ExternalLink, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import NeoBrutalismButton from '../../components/ui/NeoBrutalismButton';
import { loginUser } from '../../api/authApi';

const Login = () => {
  const navigate = useNavigate();
  const savedEmail = localStorage.getItem('rememberedEmail') || '';
  const savedPassword = localStorage.getItem('rememberedPassword') || '';
  const [formData, setFormData] = useState({ email: savedEmail, password: savedPassword });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(!!savedEmail);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const turnstileRef = useRef();
  const isSubmitting = useRef(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isSubmitting.current) return;
    
    if (!turnstileToken) {
      setError('Please complete the security check.');
      return;
    }

    setError(null);
    setLoading(true);
    isSubmitting.current = true;

    try {
      // Ensure email is correctly formatted (case-insensitive login)
      const data = await loginUser({
        ...formData,
        email: formData.email.trim().toLowerCase(),
        turnstileToken: turnstileToken
      });
      
      // Select storage mechanism based on 'Remember Me'
      const storage = rememberMe ? localStorage : sessionStorage;
      
      // Save token and user info (Stateless authentication)
      storage.setItem('token', data.token);
      storage.setItem('user', JSON.stringify(data));

      // Clear the other storage to prevent conflicts
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email.trim().toLowerCase());
        localStorage.setItem('rememberedPassword', formData.password);
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }

      // Redirect based on the role the backend provided
      const userRole = data.role?.toLowerCase();
      
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else if (userRole === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }

    } catch (err) {
      setError(err.message || 'Invalid credentials or server error.');
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <section className="min-h-screen bg-[#F0F0F0] flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Dynamic Background Decor */}
      <motion.div 
        className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-[#FFEB3B] border-[12px] border-black rounded-full" 
        style={{ boxShadow: '20px 20px 0px #000' }}
        animate={{ 
          rotate: 360,
          scale: [1, 1.05, 1] 
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-[#00FFFF] border-[12px] border-black" 
        style={{ boxShadow: '-20px -20px 0px #000' }}
        animate={{ 
          y: [0, -30, 0],
          rotate: [0, -5, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-[20%] right-[10%] w-32 h-32 bg-[#FF00FF] border-8 border-black z-0 hidden lg:block hover:bg-black" 
        style={{ boxShadow: '12px 12px 0px #000' }}
        animate={{ 
          x: [0, 40, 0],
          y: [0, -20, 0]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "backInOut" }}
      />
      <motion.div 
        className="absolute bottom-[20%] left-[10%] w-24 h-24 bg-[#00FF00] border-8 border-black z-0 rounded-full hidden lg:block" 
        style={{ boxShadow: '8px 8px 0px #000' }}
        animate={{ 
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div 
        initial={{ y: 50, opacity: 0, rotate: -2 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <button 
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 font-black uppercase text-xl hover:translate-x-[-8px] transition-transform bg-white border-4 border-black px-4 py-2"
          style={{ boxShadow: '6px 6px 0px #000' }}
        >
          <ArrowLeft strokeWidth={3} /> Back
        </button>

        <div className="bg-white border-8 border-black p-6 md:p-8 transition-all duration-300 hover:translate-y-[-4px]" style={{ boxShadow: '20px 20px 0px #000' }}>
          <motion.div
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.2 }}
          >
            <h1 className="text-4xl font-black uppercase mb-1 leading-none tracking-tight">Welcome <br/> Back</h1>
            <p className="text-base font-bold mb-6 text-black uppercase tracking-widest text-opacity-60 bg-[#FFEB3B] inline-block px-2 border-2 border-black mt-2">Login to your account</p>
          </motion.div>

          {error && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#FF0000] text-black font-black uppercase p-3 border-4 border-black mb-6 text-sm flex items-center gap-2"
              style={{ boxShadow: '4px 4px 0px #000' }}
            >
              <Lock size={16} /> {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
            >
              <label className="block text-lg font-black uppercase mb-3 text-black tracking-wider">Email</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black z-10">
                  <User strokeWidth={3} size={24} className="group-focus-within:text-[#FF00FF] transition-colors" />
                </div>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#f8f8f8] border-4 border-black pl-14 pr-4 py-3 text-lg font-bold focus:outline-none focus:bg-white focus:-translate-y-1 focus:translate-x-1 transition-all"
                  style={{ boxShadow: 'inset 4px 4px 0px rgba(0,0,0,0.05)' }}
                  placeholder="name@kiet.edu"
                  required
                />
              </div>
            </motion.div>

            {/* Password Input */}
            <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.4 }}
            >
              <label className="block text-lg font-black uppercase mb-3 text-black tracking-wider">Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black z-10">
                  <Lock strokeWidth={3} size={24} className="group-focus-within:text-[#00FFFF] transition-colors" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-[#f8f8f8] border-4 border-black pl-14 pr-14 py-3 text-lg font-bold focus:outline-none focus:bg-white focus:-translate-y-1 focus:translate-x-1 transition-all"
                  style={{ boxShadow: 'inset 4px 4px 0px rgba(0,0,0,0.05)' }}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black text-white p-1 hover:bg-[#00FFFF] hover:text-black hover:scale-110 transition-all border-2 border-transparent hover:border-black"
                >
                  {showPassword ? <EyeOff strokeWidth={3} size={20} /> : <Eye strokeWidth={3} size={20} />}
                </button>
              </div>
            </motion.div>

            {/* Remember Me Checkbox */}
            <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.5 }}
               className="flex items-center justify-between pt-4 border-t-4 border-black border-dashed mt-2"
            >
              <div className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer appearance-none w-6 h-6 border-4 border-black bg-white checked:bg-[#00FFFF] cursor-pointer transition-all hover:shadow-[2px_2px_0px_#000]"
                  />
                  <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-black pointer-events-none opacity-0 peer-checked:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <label htmlFor="rememberMe" className="text-black font-black cursor-pointer text-sm uppercase tracking-wide">
                  Remember Me
                </label>
              </div>
              <button 
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-black font-black hover:text-white hover:bg-black px-2 py-1 transition-colors text-sm uppercase border-2 border-transparent hover:border-black"
              >
                Forgot?
              </button>
            </motion.div>

            {/* Cloudflare Turnstile Invisible Widget */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center py-2"
            >
              <Turnstile 
                ref={turnstileRef}
                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"} 
                onSuccess={(token) => setTurnstileToken(token)}
                onExpire={() => setTurnstileToken(null)}
                onError={() => setError('Security check failed. Please refresh.')}
              />
            </motion.div>

            {/* Submit Button */}
            <motion.button 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={!loading ? { scale: 1.02, x: -4, y: -4, boxShadow: '8px 8px 0px #000' } : {}}
              whileTap={!loading ? { scale: 0.98, x: 0, y: 0, boxShadow: '0px 0px 0px #000' } : {}}
              className={`w-full bg-[#00FF00] text-black font-black text-xl uppercase border-4 border-black py-4 mt-2 flex justify-center items-center gap-3 transition-all ${loading ? 'opacity-50 cursor-not-allowed bg-gray-300' : 'cursor-pointer hover:bg-[#FFEB3B]'}`}
              style={{ boxShadow: loading ? '0px 0px 0px #000' : '6px 6px 0px #000' }}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : (
                <>Sign In Let's Go <ExternalLink strokeWidth={4} size={28} className="animate-pulse" /></>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </section>
  );
};

export default Login;
