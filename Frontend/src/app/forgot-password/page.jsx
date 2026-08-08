"use client";
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Lock, KeyRound } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import { forgotPassword, resetPassword } from '../../api/authApi';

const ForgotPassword = () => {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Verify & Reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const turnstileRef = useRef();
  const isSubmitting = useRef(false);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (isSubmitting.current) return;
    
    if (!turnstileToken) {
      setError('Please complete the security check.');
      return;
    }

    setError(null);
    setMessage(null);
    setLoading(true);
    isSubmitting.current = true;

    try {
      const res = await forgotPassword(email, turnstileToken);
      setMessage(res.message);
      setStep(2);
      setTurnstileToken(null); // Reset token for the next step
      turnstileRef.current?.reset();
    } catch (err) {
      setError(err.message || 'Failed to request OTP');
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (isSubmitting.current) return;
    
    if (!turnstileToken) {
      setError('Please complete the security check.');
      return;
    }

    setError(null);
    setMessage(null);
    setLoading(true);
    isSubmitting.current = true;

    try {
      const res = await resetPassword(email, otp, newPassword, turnstileToken);
      setMessage(res.message);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <section className="min-h-screen bg-background flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <motion.div 
        className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-cyan-100 text-cyan-800 border-[8px] border-black rounded-full" 
        
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
      <motion.div 
        className="absolute bottom-[10%] left-[-50px] w-48 h-48 bg-purple-100 text-purple-800 border-[8px] border-black" 
        
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <button 
          onClick={() => router.push('/login')}
          className="mb-8 flex items-center gap-2 font-bold uppercase text-xl bg-white border border-border rounded-lg shadow-sm px-4 py-2 hover:-translate-y-1 hover:translate-x-1 transition-transform cursor-pointer"
          
        >
          <ArrowLeft strokeWidth={3} /> Login
        </button>

        <div className="bg-white border border-border rounded-xl shadow-md p-6 md:p-8 hover:translate-y-[-4px] transition-all" >
          <h1 className="text-4xl font-bold uppercase tracking-tight mb-2 text-black">
            {step === 1 ? 'Forgot Password?' : 'Reset Password'}
          </h1>
          <p className="text-sm font-bold mb-6 text-black uppercase bg-yellow-100 text-yellow-800 inline-block px-2 border border-border rounded-md">
            {step === 1 ? "Don't panic! We'll send you an OTP." : "Enter your OTP and new password."}
          </p>

          {error && (
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[#FF0000] text-white font-bold uppercase p-3 border border-border rounded-lg shadow-sm mb-6 text-sm flex items-center gap-2" >
               <Lock size={16} /> {error}
             </motion.div>
          )}

          {message && (
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-green-100 text-green-800 text-black font-bold uppercase p-3 border border-border rounded-lg shadow-sm mb-6 text-sm flex items-center gap-2" >
               {message}
             </motion.div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestOTP} className="space-y-6">
              <div>
                <label className="block text-lg font-bold uppercase mb-3 text-black">Your Email</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black z-10"><Mail strokeWidth={3} size={24} /></div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#f8f8f8] border border-border rounded-lg shadow-sm pl-14 pr-4 py-3 text-lg font-bold focus:outline-none focus:bg-white focus:-translate-y-1 focus:translate-x-1 transition-all text-black"
                    
                    placeholder="student@kiet.edu"
                    required
                  />
                </div>
              </div>

              {/* Turnstile for Step 1 */}
              <div className="flex justify-center py-2">
                <Turnstile 
                  ref={turnstileRef}
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"} 
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                />
              </div>

              <motion.button 
                whileHover={!loading ? { scale: 1.02, x: -4, y: -4 } : {}}
                whileTap={!loading ? { scale: 0.98, x: 0, y: 0 } : {}}
                className={`w-full bg-purple-100 text-purple-800 text-white font-bold text-xl uppercase border border-border rounded-lg shadow-sm py-4 mt-6 ${loading ? 'opacity-50 cursor-not-allowed bg-gray-500 text-black' : 'cursor-pointer hover:bg-black hover:text-[#FF00FF]'}`}
                style={{ boxShadow: loading ? '0px 0px 0px #000' : '6px 6px 0px #000' }}
                type="submit"
                disabled={loading}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </motion.button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <p className="text-sm font-bold -mt-4 mb-4 text-black">We sent an OTP to <strong>{email}</strong></p>
              
              <div>
                <label className="block text-lg font-bold uppercase mb-3 text-black">OTP Code</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black z-10"><KeyRound strokeWidth={3} size={24} /></div>
                  <input 
                    type="text" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-[#f8f8f8] border border-border rounded-lg shadow-sm pl-14 pr-4 py-3 text-lg font-bold focus:outline-none focus:bg-white focus:-translate-y-1 focus:translate-x-1 transition-all tracking-widest text-center text-black"
                    
                    placeholder="123456"
                    required
                    maxLength="6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-lg font-bold uppercase mb-3 text-black">New Password</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black z-10"><Lock strokeWidth={3} size={24} /></div>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#f8f8f8] border border-border rounded-lg shadow-sm pl-14 pr-4 py-3 text-lg font-bold focus:outline-none focus:bg-white focus:-translate-y-1 focus:translate-x-1 transition-all text-black"
                    
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Turnstile for Step 2 */}
              <div className="flex justify-center py-2">
                <Turnstile 
                  ref={turnstileRef}
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"} 
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                />
              </div>

              <motion.button 
                whileHover={!loading ? { scale: 1.02, x: -4, y: -4 } : {}}
                whileTap={!loading ? { scale: 0.98, x: 0, y: 0 } : {}}
                className={`w-full bg-green-100 text-green-800 text-black font-bold text-xl uppercase border border-border rounded-lg shadow-sm py-4 mt-6 ${loading ? 'opacity-50 cursor-not-allowed bg-gray-500' : 'cursor-pointer hover:bg-yellow-100 text-yellow-800'}`}
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
