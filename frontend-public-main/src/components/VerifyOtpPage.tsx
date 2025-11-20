import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, RotateCcw, Phone } from 'lucide-react';
import api from '../services/api';

interface LocationState {
  mobile?: string;
}

const VerifyOtpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as LocationState;

  const [mobile, setMobile] = useState<string>(state.mobile || '');
  const [otp, setOtp] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    if (!state.mobile) {
      navigate('/signin', { replace: true });
    }
  }, [state.mobile, navigate]);

  useEffect(() => {
    let timer: number | undefined;
    if (countdown > 0) {
      timer = window.setTimeout(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [countdown]);

  const handleResend = async () => {
    if (!mobile) return;
    setIsResending(true);
    try {
      await api.post('/users/send-otp', { phoneNumber: mobile });
      setCountdown(30);
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) return;
    setIsVerifying(true);
    try {
      const res = await api.post('/users/verify-otp', { phoneNumber: mobile, otp });
      if (res.data?.isNewUser) {
        setIsNewUser(true);
      } else {
        if (res.data?.token) {
          localStorage.setItem('token', res.data.token);
        }
        if (res.data?.refreshToken) {
          localStorage.setItem('refreshToken', res.data.refreshToken);
        }
        try {
          if (sessionStorage.getItem('rideFlow') === 'active') {
            sessionStorage.removeItem('rideFlow');
            navigate('/booking-details', { replace: true });
          } else {
            navigate('/profile', { replace: true });
          }
        } catch {
          navigate('/profile', { replace: true });
        }
      }
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName) {
      alert('Please enter your name');
      return;
    }
    setIsVerifying(true);
    try {
      const res = await api.post('/users/complete-signup', {
        phoneNumber: mobile,
        firstName,
        lastName,
        email
      });
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
      }
      if (res.data?.refreshToken) {
        localStorage.setItem('refreshToken', res.data.refreshToken);
      }
      navigate('/profile', { replace: true });
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to complete signup');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center p-4 pt-20">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md flex flex-col items-center justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-10">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-2xl">🔐</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify OTP</h1>
          <p className="text-gray-600">Enter the code sent to your mobile number</p>
          {mobile && (
            <div className="mt-2 inline-flex items-center text-gray-700 text-sm">
              <Phone className="h-4 w-4 mr-1" />
              <span>+91 {mobile}</span>
            </div>
          )}
        </div>

        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <form onSubmit={isNewUser ? handleCompleteSignup : handleVerify} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                OTP Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MessageSquare className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-200 tracking-widest"
                  placeholder="Enter 6-digit OTP"
                />
              </div>
            </div>

            {isNewUser && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Email (optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {countdown > 0 ? `You can resend in ${countdown}s` : "Didn't receive OTP?"}
              </span>
              <motion.button
                type="button"
                onClick={handleResend}
                disabled={isResending || countdown > 0}
                className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors duration-200 flex items-center disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
              >
                {isResending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Resend OTP
                  </>
                )}
              </motion.button>
            </div>

            <motion.button
              type="submit"
              disabled={isVerifying}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isVerifying ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isNewUser ? 'Creating account...' : 'Verifying...'}
                </div>
              ) : (
                <>{isNewUser ? 'Complete Signup' : 'Verify and Continue'}</>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
          </div>
        </motion.div>

        <motion.div
          className="text-center mt-8 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VerifyOtpPage;


