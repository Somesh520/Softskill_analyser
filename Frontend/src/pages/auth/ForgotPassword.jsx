import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, KeyRound } from 'lucide-react';
import { forgotPassword, resetPassword } from '../../api/authApi';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Verify & Reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      setMessage(res.message);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await resetPassword(email, otp, newPassword);
      setMessage(res.message);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-[#F0F0F0] flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <motion.div 
        className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-[#00FFFF] border-[8px] border-black rounded-full" 
        style={{ boxShadow: '12px 12px 0px #000' }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="absolute bottom-[10%] left-[-50px] w-48 h-48 bg-[#FF00FF] border-[8px] border-black" 
        style={{ boxShadow: '-12px 12px 0px #000' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <button 
          onClick={() => navigate('/login')}
          className="mb-8 flex items-center gap-2 font-black uppercase text-xl bg-white border-4 border-black px-4 py-2 hover:-translate-y-1 hover:translate-x-1 transition-transform"
          style={{ boxShadow: '4px 4px 0px #000' }}
        >
          <ArrowLeft strokeWidth={3} /> Login
        </button>

        <div className="bg-white border-8 border-black p-6 md:p-8 hover:translate-y-[-4px] transition-all" style={{ boxShadow: '16px 16px 0px #000' }}>
          <h1 className="text-4xl font-black uppercase tracking-tight mb-2">
            {step === 1 ? 'Forgot Password?' : 'Reset Password'}
          </h1>
          <p className="text-sm font-bold mb-6 text-black uppercase bg-[#FFEB3B] inline-block px-2 border-2 border-black">
            {step === 1 ? "Don't panic! We'll send you an OTP." : "Enter your OTP and new password."}
          </p>

          {error && (
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#FF0000] text-white font-black uppercase p-3 border-4 border-black mb-6 text-sm flex items-center gap-2" style={{ boxShadow: '4px 4px 0px #000' }}>
               <Lock size={16} /> {error}
             </motion.div>
          )}

          {message && (
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#00FF00] text-black font-black uppercase p-3 border-4 border-black mb-6 text-sm flex items-center gap-2" style={{ boxShadow: '4px 4px 0px #000' }}>
               {message}
             </motion.div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestOTP} className="space-y-6">
              <div>
                <label className="block text-lg font-black uppercase mb-3 text-black">Your Email</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black z-10"><Mail strokeWidth={3} size={24} /></div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#f8f8f8] border-4 border-black pl-14 pr-4 py-3 text-lg font-bold focus:outline-none focus:bg-white focus:-translate-y-1 focus:translate-x-1 transition-all"
                    style={{ boxShadow: 'inset 4px 4px 0px rgba(0,0,0,0.05)', ':focus': { boxShadow: '-6px 6px 0px #000' } }}
                    placeholder="student@kiet.edu"
                    required
                  />
                </div>
              </div>

              <motion.button 
                whileHover={!loading ? { scale: 1.02, x: -4, y: -4, boxShadow: '8px 8px 0px #000' } : {}}
                whileTap={!loading ? { scale: 0.98, x: 0, y: 0, boxShadow: '0px 0px 0px #000' } : {}}
                className={`w-full bg-[#FF00FF] text-white font-black text-xl uppercase border-4 border-black py-4 mt-6 ${loading ? 'opacity-50 cursor-not-allowed bg-gray-500 text-black' : 'cursor-pointer hover:bg-black hover:text-[#FF00FF]'}`}
                style={{ boxShadow: loading ? '0px 0px 0px #000' : '6px 6px 0px #000' }}
                type="submit"
                disabled={loading}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </motion.button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <p className="text-sm font-bold -mt-4 mb-4">We sent an OTP to <strong>{email}</strong></p>
              
              <div>
                <label className="block text-lg font-black uppercase mb-3 text-black">OTP Code</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black z-10"><KeyRound strokeWidth={3} size={24} /></div>
                  <input 
                    type="text" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-[#f8f8f8] border-4 border-black pl-14 pr-4 py-3 text-lg font-bold focus:outline-none focus:bg-white focus:-translate-y-1 focus:translate-x-1 transition-all tracking-widest text-center"
                    style={{ boxShadow: 'inset 4px 4px 0px rgba(0,0,0,0.05)', ':focus': { boxShadow: '-6px 6px 0px #000' } }}
                    placeholder="123456"
                    required
                    maxLength="6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-lg font-black uppercase mb-3 text-black">New Password</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black z-10"><Lock strokeWidth={3} size={24} /></div>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#f8f8f8] border-4 border-black pl-14 pr-4 py-3 text-lg font-bold focus:outline-none focus:bg-white focus:-translate-y-1 focus:translate-x-1 transition-all"
                    style={{ boxShadow: 'inset 4px 4px 0px rgba(0,0,0,0.05)', ':focus': { boxShadow: '-6px 6px 0px #000' } }}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <motion.button 
                whileHover={!loading ? { scale: 1.02, x: -4, y: -4, boxShadow: '8px 8px 0px #000' } : {}}
                whileTap={!loading ? { scale: 0.98, x: 0, y: 0, boxShadow: '0px 0px 0px #000' } : {}}
                className={`w-full bg-[#00FF00] text-black font-black text-xl uppercase border-4 border-black py-4 mt-6 ${loading ? 'opacity-50 cursor-not-allowed bg-gray-500' : 'cursor-pointer hover:bg-[#FFEB3B]'}`}
                style={{ boxShadow: loading ? '0px 0px 0px #000' : '6px 6px 0px #000' }}
                type="submit"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Reset Password'}
              </motion.button>
            </form>
          )}
        </div>
      </motion.div>
    </section>
  );
};

export default ForgotPassword;