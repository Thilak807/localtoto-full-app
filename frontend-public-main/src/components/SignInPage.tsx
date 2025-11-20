import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageSquare, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const SignInPage: React.FC = () => {
  const [formData, setFormData] = useState({
    mobile: '',
    otp: '',
  });
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendOtp = async () => {
    if (!formData.mobile || formData.mobile.length < 10) {
      alert('Please enter a valid mobile number');
      return;
    }
    
    setIsOtpLoading(true);
    try {
      await api.post('/users/send-otp', { phoneNumber: formData.mobile });
      setOtpSent(true);
      navigate('/verify-otp', { state: { mobile: formData.mobile } });
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      await handleSendOtp();
      return;
    }
    
    setIsLoading(true);
    try {
      // When OTP already sent, navigate to verify screen
      if (otpSent) {
        navigate('/verify-otp', { state: { mobile: formData.mobile } });
      } else {
        await handleSendOtp();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  const formVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        delay: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center p-4 pt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md flex flex-col items-center justify-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-2xl">🛺</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h1>
          <p className="text-gray-600">Use your mobile number to continue</p>
        </div>

        {/* Sign In Form */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mobile Number Field */}
            <motion.div
              className="space-y-2"
              whileFocus={{ scale: 1.02 }}
            >
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                  maxLength={10}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your mobile number"
                />
              </div>
            </motion.div>

            {/* OTP Field */}
            {otpSent && (
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                whileFocus={{ scale: 1.02 }}
              >
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
                    value={formData.otp}
                    onChange={handleInputChange}
                    required
                    maxLength={6}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-200"
                    placeholder="Enter 6-digit OTP"
                  />
                </div>
              </motion.div>
            )}

            {/* Resend OTP */}
            {otpSent && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Didn't receive OTP?
                </span>
                <motion.button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isOtpLoading}
                  className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors duration-200 flex items-center disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                >
                  {isOtpLoading ? (
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
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading || isOtpLoading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {otpSent ? 'Signing in...' : 'Sending OTP...'}
                </div>
              ) : isOtpLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending OTP...
                </div>
              ) : (
                <>
                  {otpSent ? 'Sign In' : 'Send OTP'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* No social or signup; phone-only sign in */}
        </motion.div>

        {/* Back to Home */}
        <motion.div
          className="text-center mt-8 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignInPage;
