import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

const AnimatedForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const formVariants = {
    hidden: { 
      opacity: 0,
      rotateX: -10,
      y: 20
    },
    visible: { 
      opacity: 1,
      rotateX: 0,
      y: 0,
      transition: {
        duration: 0.5
      }
    },
    exit: {
      opacity: 0,
      rotateX: 10,
      y: -20,
      transition: {
        duration: 0.3
      }
    }
  };

  const inputVariants = {
    focus: {
      scale: 1.02,
      transition: {
        duration: 0.2
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      rotateY: 5,
      transition: {
        duration: 0.2
      }
    },
    tap: {
      scale: 0.95
    }
  };

  const stepIndicatorVariants = {
    active: {
      scale: 1.1,
      backgroundColor: "#059669",
      color: "white",
      transition: {
        duration: 0.3
      }
    },
    inactive: {
      scale: 1,
      backgroundColor: "#E5E7EB",
      color: "#4B5563"
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          className="bg-white rounded-xl shadow-lg p-8"
          initial="hidden"
          animate="visible"
          variants={formVariants}
        >
          {/* Step Indicator */}
          <div className="flex justify-center mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <motion.div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  variants={stepIndicatorVariants}
                  animate={currentStep >= step ? "active" : "inactive"}
                >
                  {step}
                </motion.div>
                {step < 3 && (
                  <motion.div 
                    className="w-16 h-1"
                    animate={{
                      backgroundColor: currentStep > step ? "#059669" : "#E5E7EB"
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form 
              key={currentStep}
              className="space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Personal Information */}
              <motion.div 
                className="space-y-4 block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Personal Information</h2>
                
                <motion.div 
                  className="relative"
                  whileFocus="focus"
                  variants={inputVariants}
                >
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </motion.div>

                <motion.div 
                  className="relative"
                  whileFocus="focus"
                  variants={inputVariants}
                >
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </motion.div>

                <motion.div 
                  className="relative"
                  whileFocus="focus"
                  variants={inputVariants}
                >
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </motion.div>

                <motion.div 
                  className="relative"
                  whileFocus="focus"
                  variants={inputVariants}
                >
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="address"
                    placeholder="Full Address"
                    required
                    rows={3}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </motion.div>
              </motion.div>

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <motion.button
                  type="button"
                  className="flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-300 ml-auto"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setCurrentStep(currentStep + 1)}
                >
                  Next
                  <ArrowRight className="w-5 h-5 ml-2" />
                </motion.button>
              </div>
            </motion.form>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default AnimatedForm; 