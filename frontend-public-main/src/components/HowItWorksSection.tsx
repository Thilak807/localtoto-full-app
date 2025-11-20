import React from 'react';
import { motion, Variants } from 'framer-motion';
import { MapPin, Car, Smile, CreditCard } from 'lucide-react';

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: "01",
      title: "Book Your Ride",
      description: "Enter your pickup and drop locations in the app or website to book your e-rickshaw.",
      icon: <MapPin className="w-6 h-6" />
    },
    {
      number: "02",
      title: "Get Picked Up",
      description: "A nearby driver will accept your request and arrive at your location within minutes.",
      icon: <Car className="w-6 h-6" />
    },
    {
      number: "03",
      title: "Enjoy The Journey",
      description: "Hop in and enjoy a comfortable, eco-friendly ride to your destination.",
      icon: <Smile className="w-6 h-6" />
    },
    {
      number: "04",
      title: "Pay & Rate",
      description: "Pay via cash or in-app payment methods and rate your experience.",
      icon: <CreditCard className="w-6 h-6" />
    }
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const stepVariants: Variants = {
    hidden: { 
      opacity: 0,
      y: 50,
      rotateX: -15
    },
    visible: { 
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.5,
        ease: [0.2, 0.65, 0.3, 0.9]
      }
    },
    hover: {
      y: -10,
      rotateX: 5,
      transition: {
        duration: 0.25,
        ease: [0.2, 0.65, 0.3, 0.9]
      }
    }
  };

  const numberCircleVariants: Variants = {
    hidden: { 
      scale: 0,
      rotate: -180
    },
    visible: { 
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.4,
        ease: [0.2, 0.65, 0.3, 0.9]
      }
    },
    hover: {
      scale: 1.1,
      rotate: 360,
      transition: {
        duration: 0.3,
        ease: [0.2, 0.65, 0.3, 0.9]
      }
    }
  };

  const lineVariants: Variants = {
    hidden: { scaleX: 0 },
    visible: { 
      scaleX: 1,
      transition: {
        duration: 1,
        ease: [0.42, 0, 0.58, 1],
        delay: 0.5
      }
    }
  };

  return (
    <section id="how-it-works" className="py-20 bg-white">
    <div className="container-classic">
      <motion.div 
        className="text-center max-w-2xl mx-auto mb-16"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center mb-4">
          <img 
            src="/full_logo.png" 
            alt="Local ToTo" 
            className="h-12 md:h-14 object-contain mb-3"
          />
          <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
        </div>
        <p className="text-lg text-gray-600">Simple, quick, and convenient - get from point A to B in just a few taps</p>
      </motion.div>

      <div className="relative">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-green-500 opacity-30"></div>
          <div className="absolute bottom-16 -left-8 w-40 h-40 rounded-full bg-green-700 opacity-20"></div>
        </div>
        <motion.div 
          className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-green-200 -translate-y-1/2 z-0"
          variants={lineVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        />

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center transform perspective-1000"
              variants={stepVariants}
              whileHover="hover"
            >
              <motion.div 
                className="bg-white w-16 h-16 rounded-full border-2 border-green-500 flex items-center justify-center mb-6 font-bold text-xl text-green-600"
                variants={numberCircleVariants}
                whileHover="hover"
              >
                {step.number}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 * index }}
                className="text-center"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.div 
        className="mt-16 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
      >
        <motion.button 
          className="btn btn-primary rounded-full"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Book Your First Ride
        </motion.button>
      </motion.div>
    </div>
    </section>
  );
};

export default HowItWorksSection; 