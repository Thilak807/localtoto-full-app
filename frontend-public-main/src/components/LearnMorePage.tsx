import React from 'react';
import { Shield, Leaf, Clock, Users, MapPin, Zap } from 'lucide-react';
import Erickshaw3D from './Erickshaw3D';
import { motion } from 'framer-motion';

const LearnMorePage: React.FC = () => {
  const features = [
    {
      icon: <Leaf className="w-12 h-12 text-green-600" />,
      title: 'Eco-Friendly Transportation',
      description: 'Our e-rickshaws are 100% electric, producing zero emissions and helping create a cleaner, greener environment for our cities.'
    },
    {
      icon: <Shield className="w-12 h-12 text-green-600" />,
      title: 'Safe & Reliable',
      description: 'All our drivers are thoroughly vetted and trained. We maintain strict safety standards and regular vehicle maintenance checks.'
    },
    {
      icon: <Clock className="w-12 h-12 text-green-600" />,
      title: '24/7 Service',
      description: 'Available round the clock, ensuring you can book a ride whenever you need it, day or night.'
    },
    {
      icon: <Users className="w-12 h-12 text-green-600" />,
      title: 'Community Impact',
      description: 'Creating employment opportunities for drivers while providing affordable transportation solutions for the community.'
    },
    {
      icon: <MapPin className="w-12 h-12 text-green-600" />,
      title: 'City-Wide Coverage',
      description: 'Extensive network covering all major areas of the city, ensuring you can reach your destination conveniently.'
    },
    {
      icon: <Zap className="w-12 h-12 text-green-600" />,
      title: 'Quick & Efficient',
      description: 'Fast pickup times and efficient routes to get you to your destination quickly and comfortably.'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const iconVariants = {
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-4 mt-[-100px]">
      {/* Hero Section */}
      <div className="bg-green-600 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="text-center lg:text-left">
                <div className="flex flex-col items-center mb-6">
                  <img 
                    src="/full_logo.png" 
                    alt="Local ToTo" 
                    className="h-16 md:h-20 object-contain mb-4"
                  />
                  <h1 className="text-4xl sm:text-5xl font-bold">About Us</h1>
                </div>
                <p className="text-xl opacity-90">
                  Revolutionizing urban transportation with eco-friendly e-rickshaws
                </p>
              </div>
              <div className="w-full h-[400px] bg-green-700 rounded-lg overflow-hidden">
                <Erickshaw3D />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-all duration-300"
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
                }}
              >
                <motion.div 
                  className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mb-6"
                  variants={iconVariants}
                  whileHover="hover"
                >
                  {feature.icon}
                </motion.div>
                <motion.h3 
                  className="text-xl font-semibold text-gray-900 mb-3"
                  whileHover={{ color: "#059669" }}
                >
                  {feature.title}
                </motion.h3>
                <motion.p 
                  className="text-gray-600"
                  whileHover={{ color: "#374151" }}
                >
                  {feature.description}
                </motion.p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-16">How It Works</h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  1
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Download Our App</h3>
                  <p className="text-gray-600">Get started by downloading our user-friendly mobile app from the App Store or Google Play Store.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  2
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Book Your Ride</h3>
                  <p className="text-gray-600">Enter your pickup and drop locations, choose your preferred ride type, and confirm your booking.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  3
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Track Your Ride</h3>
                  <p className="text-gray-600">Follow your driver's location in real-time and get notified when they arrive.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  4
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Enjoy Your Journey</h3>
                  <p className="text-gray-600">Hop in and enjoy a comfortable, eco-friendly ride to your destination.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-green-600 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex flex-col items-center mb-6">
              <img 
                src="/full_logo.png" 
                alt="Local ToTo" 
                className="h-12 md:h-14 object-contain mb-3 filter brightness-0 invert"
              />
              <h2 className="text-3xl font-bold">Ready to Experience?</h2>
            </div>
            <p className="text-xl opacity-90 mb-8">
              Join thousands of satisfied customers who have made the switch to eco-friendly transportation.
            </p>
            <button className="px-8 py-3 bg-white text-green-700 font-semibold rounded-full hover:bg-green-50 transition-all duration-300 hover:scale-105 transform">
              Download App Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnMorePage; 