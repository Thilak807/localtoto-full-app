import { DollarSign, Clock, Users, Shield } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const DriverCTA: React.FC = () => {

  const benefits = [
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: 'Earn More',
      description: 'Competitive earnings with flexible working hours'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Flexible Hours',
      description: 'Work when you want, as much as you want'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Safe & Secure',
      description: 'Insurance coverage and 24/7 support'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Growing Community',
      description: 'Join thousands of successful drivers'
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

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.2, 0.65, 0.3, 0.9]
      }
    }
  };

  const iconVariants: Variants = {
    hover: {
      scale: 1.2,
      rotate: 360,
      transition: {
        duration: 0.3,
        ease: [0.2, 0.65, 0.3, 0.9]
      }
    }
  };

  const formContainerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };
  const formItemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.2, 0.65, 0.3, 0.9] } }
  };

  return (
    <section id="driver-partner" className="py-20 bg-gray-900 text-white relative overflow-hidden">
      {/* Background decoration */}
      <motion.div 
        className="absolute inset-0 opacity-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute top-0 left-0 w-full h-full">
          <motion.svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 1000 1000" 
            className="w-full h-full text-white/5 opacity-20"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <path d="M0,0v1000h1000V0H0z M381.4,258.3l-95.1,164.8l-95.1-164.8H381.4z M879.5,879.5H120.5V120.5h379.7l-154.5,267.5
              l154.5,267.5H879.5V879.5z" fill="currentColor"/>
          </motion.svg>
        </div>
      </motion.div>
      
      <div className="container-classic relative z-10">
        <motion.div 
          className="text-center max-w-2xl mx-auto mb-16"
          initial={{ y: -20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-4">Become a Driver Partner</h2>
          <p className="text-xl opacity-80">
            Join our network of drivers and start earning with your e-rickshaw
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {benefits.map((benefit, index) => (
            <motion.div 
              key={index} 
              className="bg-gray-800 rounded-xl p-6 text-center hover:bg-gray-700 transition-colors duration-300"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div 
                className="flex justify-center mb-4"
                variants={iconVariants}
                whileHover="hover"
              >
                {benefit.icon}
              </motion.div>
              <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
              <p className="text-gray-400">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          className="bg-green-600 rounded-xl overflow-hidden shadow-xl p-8 text-center"
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-2xl font-bold mb-3">Ready to Start?</h3>
          <p className="text-lg mb-6 opacity-90">Submit your application and we’ll reach out within 24 hours.</p>
          <a href="/become-rider" className="inline-flex items-center justify-center px-6 py-3 bg-white text-green-700 rounded-xl font-semibold hover:bg-green-50">
                  Submit Application
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default DriverCTA;