"use client";
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Lock, ExternalLink, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import NeoBrutalismButton from '../../components/ui/NeoBrutalismButton';
import { loginUser } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const router = useRouter();
  const { setUser } = useAuth();
  const savedEmail = typeof window !== 'undefined' ? (localStorage.getItem('rememberedEmail') || '') : '';
  const savedPassword = typeof window !== 'undefined' ? (localStorage.getItem('rememberedPassword') || '') : '';
  const [formData, setFormData] = useState({ email: savedEmail, password: savedPassword });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(!!savedEmail);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [isSuccessRedirect, setIsSuccessRedirect] = useState(false);
  const [redirectRole, setRedirectRole] = useState('');
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
      const data = await loginUser({
        ...formData,
        email: formData.email.trim().toLowerCase(),
        turnstileToken: turnstileToken
      });
      
      const storage = rememberMe ? localStorage : sessionStorage;
      
      storage.setItem('token', data.token);
      storage.setItem('user', JSON.stringify(data));
      setUser(data);

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

      const userRole = data.role?.toLowerCase();
      setRedirectRole(userRole);
      setIsSuccessRedirect(true);

      setTimeout(() => {
        if (userRole === 'admin') {
          router.push('/admin/dashboard');
        } else if (userRole === 'teacher') {
          router.push('/teacher/dashboard');
        } else {
          router.push('/student/dashboard');
        }
      }, 2000);

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
      {/* Success Redirect Overlay */}
      {isSuccessRedirect && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-6"
        >
          <motion.div 
            initial={{ scale: 0.85, rotate: -3 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="bg-[#00FF00] border-8 border-black p-8 md:p-12 text-center max-w-sm w-full relative"
            style={{ boxShadow: '12px 12px 0px #FF00FF' }}
          >
            {/* Bouncing Access Icon */}
            <div className="w-20 h-20 bg-black text-white border-4 border-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_#00FFFF] animate-bounce">
              <ShieldCheck className="w-10 h-10 text-[#00FF00]" strokeWidth={3} />
            </div>

            <h2 className="text-3xl font-black uppercase mb-1 leading-none text-black">
              ACCESS GRANTED!
            </h2>
            <p className="text-xs font-bold text-black uppercase tracking-wider bg-white border-2 border-black inline-block px-3 py-1 mt-2">
              Syncing credentials
            </p>

            {/* Custom Loading Bar */}
            <div className="h-6 bg-white border-4 border-black my-6 relative overflow-hidden">
              <motion.div 
                className="h-full bg-[#FF00FF]"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
              />
            </div>

            <p className="font-mono text-xs font-black text-black uppercase tracking-wider">
              Redirecting to {redirectRole} portal...
            </p>
          </motion.div>
        </motion.div>
      )}
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
          onClick={() => router.push('/')}
          className="mb-6 flex items-center gap-2 font-black uppercase text-base hover:-translate-x-2 transition-transform bg-white border-4 border-black px-4 py-2 cursor-pointer shadow-[4px_4px_0px_#000]"
        >
          <ArrowLeft strokeWidth={3} size={18} /> Back to Home
        </button>

        <div className="bg-white border-8 border-black p-6 md:p-8 transition-all duration-300 shadow-[16px_16px_0px_#000]">
          <motion.div
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.2 }}
             className="mb-8"
          >
            <h1 className="text-4xl font-black uppercase leading-none tracking-tight text-black">
              Welcome <br/> Back
            </h1>
            <p className="text-sm font-bold text-black uppercase tracking-wider bg-[#FFEB3B] inline-block px-3 py-1 border-2 border-black mt-3">
              Login to your account
            </p>
          </motion.div>

          {error && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#FF3B30] text-white font-black uppercase p-3 border-4 border-black mb-6 text-sm flex items-center gap-2"
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
              <label className="block text-sm font-black uppercase mb-2 text-black tracking-wider">Email</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black z-10">
                  <User strokeWidth={3} size={20} className="group-focus-within:text-[#FF00FF] transition-colors" />
                </div>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#F5F5F5] border-4 border-black pl-12 pr-4 py-3 text-base font-bold focus:outline-none focus:bg-white focus:shadow-[6px_6px_0px_#00FFFF] transition-all text-black"
                  placeholder="somesh@kiet.edu"
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
              <label className="block text-sm font-black uppercase mb-2 text-black tracking-wider">Password</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black z-10">
                  <Lock strokeWidth={3} size={20} className="group-focus-within:text-[#00FFFF] transition-colors" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-[#F5F5F5] border-4 border-black pl-12 pr-12 py-3 text-base font-bold focus:outline-none focus:bg-white focus:shadow-[6px_6px_0px_#FF00FF] transition-all text-black"
                  placeholder="••••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black text-white p-1.5 hover:bg-[#00FFFF] hover:text-black hover:scale-105 transition-all border-2 border-black cursor-pointer"
                >
                  {showPassword ? <EyeOff strokeWidth={3} size={16} /> : <Eye strokeWidth={3} size={16} />}
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
                    className="peer appearance-none w-5 h-5 border-4 border-black bg-white checked:bg-[#00FFFF] cursor-pointer transition-all hover:shadow-[2px_2px_0px_#000]"
                  />
                  <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black pointer-events-none opacity-0 peer-checked:opacity-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <label htmlFor="rememberMe" className="text-black font-black cursor-pointer text-xs uppercase tracking-wide">
                  Remember Me
                </label>
              </div>
              <button 
                type="button"
                onClick={() => router.push('/forgot-password')}
                className="text-black font-black hover:text-white hover:bg-black px-2 py-1 transition-colors text-xs uppercase border-2 border-transparent hover:border-black cursor-pointer"
              >
                Forgot?
              </button>
            </motion.div>

            {/* Cloudflare Turnstile Wrapper */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-[#FFEEAD] border-4 border-black p-4 flex flex-col items-center justify-center text-center relative mt-4"
              style={{ boxShadow: '4px 4px 0px #000' }}
            >
              <div className="absolute top-[-12px] bg-black text-[#FFEEAD] px-3 py-0.5 border-2 border-black text-2xs font-black uppercase tracking-wider">
                Security Check
              </div>
              <div className="mt-1">
                <Turnstile 
                  ref={turnstileRef}
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"} 
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                  onError={() => setError('Security check failed. Please refresh.')}
                />
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={!loading ? { scale: 1.01, x: -2, y: -2, boxShadow: '6px 6px 0px #000' } : {}}
              whileTap={!loading ? { scale: 0.99, x: 0, y: 0, boxShadow: '0px 0px 0px #000' } : {}}
              className={`w-full bg-[#00FF00] text-black font-black text-lg uppercase border-4 border-black py-4 mt-2 flex justify-center items-center gap-3 transition-all ${loading ? 'opacity-50 cursor-not-allowed bg-gray-300' : 'cursor-pointer hover:bg-[#FFEB3B]'}`}
              style={{ boxShadow: loading ? '0px 0px 0px #000' : '4px 4px 0px #000' }}
              type="submit"
              disabled={loading}
            >
              {loading ? 'Authenticating...' : (
                <>Sign In Let's Go <ExternalLink strokeWidth={4} size={22} className="animate-pulse" /></>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </section>
  );
};

export default Login;
