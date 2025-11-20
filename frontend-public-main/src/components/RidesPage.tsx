import React from 'react';
import { MapPin, Clock, Users, CreditCard, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const RidesPage: React.FC = () => {
  const rideTypes = [
    {
      title: 'Standard Ride',
      description: 'Perfect for everyday travel with comfortable seating and reliable service.',
      features: ['Up to 3 passengers', 'Standard pricing', 'Regular e-rickshaw'],
      icon: <Users className="w-8 h-8" />
    },
    {
      title: 'Premium Ride',
      description: 'Enhanced comfort with premium e-rickshaws and experienced drivers.',
      features: ['Up to 3 passengers', 'Premium pricing', 'Luxury e-rickshaw'],
      icon: <Star className="w-8 h-8" />
    },
    {
      title: 'Express Ride',
      description: 'Quick and efficient service for time-sensitive travel needs.',
      features: ['Priority pickup', 'Fastest route', 'Experienced drivers'],
      icon: <Zap className="w-8 h-8" />
    }
  ];

  const rideFeatures = [
    {
      icon: <MapPin className="w-8 h-8" />,
      title: 'Easy Booking',
      description: 'Book your ride in seconds through our app or website'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Quick Pickup',
      description: 'Get picked up within minutes of booking'
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: 'Multiple Payment Options',
      description: 'Pay via cash, card, or digital wallets'
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
    hidden: { 
      opacity: 0,
      y: 20,
      rotateX: -45
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const iconVariants = {
    hover: {
      scale: 1.2,
      rotate: 360,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <div className="bg-green-600 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          >
            <motion.h1 
              className="text-4xl sm:text-5xl font-bold mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5,
                type: "spring",
                stiffness: 200,
                damping: 20
              }}
              whileHover={{ 
                scale: 1.05,
                transition: { type: "spring", stiffness: 400, damping: 10 }
              }}
            >
              Book Your Ride
            </motion.h1>
            <motion.p 
              className="text-xl opacity-90"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5,
                delay: 0.3,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                scale: 1.05,
                opacity: 1,
                transition: { type: "spring", stiffness: 300, damping: 10 }
              }}
            >
              Choose from our range of eco-friendly e-rickshaw services
            </motion.p>
          </motion.div>
        </div>
      </div>

      {/* Ride Types Section */}
      <div className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-3xl font-bold text-gray-900 text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Our Ride Options
          </motion.h2>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2
                }
              }
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {rideTypes.map((ride, index) => (
              <motion.div 
                key={index} 
                className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300 perspective-1000"
                variants={{
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
                      type: "spring",
                      stiffness: 100,
                      damping: 15
                    }
                  }
                }}
                whileHover={{ 
                  scale: 1.02,
                  rotateY: 5,
                  transition: { type: "spring", stiffness: 300, damping: 10 }
                }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <motion.div 
                  className="text-green-600 mb-4"
                  whileHover={{ 
                    scale: 1.2,
                    rotate: 360,
                    transition: { type: "spring", stiffness: 200, damping: 10 }
                  }}
                >
                  {ride.icon}
                </motion.div>
                <motion.h3 
                  className="text-xl font-semibold text-gray-900 mb-3"
                  whileHover={{ scale: 1.05 }}
                >
                  {ride.title}
                </motion.h3>
                <motion.p 
                  className="text-gray-600 mb-4"
                  whileHover={{ scale: 1.02 }}
                >
                  {ride.description}
                </motion.p>
                <motion.ul 
                  className="space-y-2"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1
                      }
                    }
                  }}
                >
                  {ride.features.map((feature, featureIndex) => (
                    <motion.li 
                      key={featureIndex} 
                      className="flex items-center text-gray-600"
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { 
                          opacity: 1, 
                          x: 0,
                          transition: { type: "spring", stiffness: 100 }
                        }
                      }}
                      whileHover={{ 
                        x: 10,
                        transition: { type: "spring", stiffness: 400, damping: 10 }
                      }}
                    >
                      <motion.span 
                        className="text-green-600 mr-2"
                        whileHover={{ scale: 1.5 }}
                      >
                        •
                      </motion.span>
                      {feature}
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Features Section with 3D Animations */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-3xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <motion.h2 
              className="text-3xl font-bold text-gray-900 text-center mb-16"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col items-center">
                <img 
                  src="/full_logo.png" 
                  alt="Local ToTo" 
                  className="h-12 md:h-14 object-contain mb-3"
                />
                <span>Why Choose Us</span>
              </div>
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {rideFeatures.map((feature, index) => (
                <motion.div 
                  key={index} 
                  className="text-center perspective-1000"
                  variants={itemVariants}
                >
                  <motion.div 
                    className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                    whileHover="hover"
                    variants={iconVariants}
                  >
                    <motion.div 
                      className="text-green-600"
                      whileHover={{ scale: 1.1 }}
                    >
                      {feature.icon}
                    </motion.div>
                  </motion.div>
                  <motion.h3 
                    className="text-xl font-semibold text-gray-900 mb-4"
                    whileHover={{ scale: 1.05 }}
                  >
                    {feature.title}
                  </motion.h3>
                  <motion.p 
                    className="text-gray-600"
                    whileHover={{ scale: 1.02 }}
                  >
                    {feature.description}
                  </motion.p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <motion.h2 
              className="text-3xl font-bold text-gray-900 text-center mb-16"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ 
                type: "spring",
                stiffness: 100,
                damping: 10,
                delay: 0.2
              }}
            >
              Transparent Pricing
            </motion.h2>
            <motion.div 
              className="bg-white rounded-xl p-8 shadow-md"
              initial={{ opacity: 0, rotateX: -15 }}
              whileInView={{ opacity: 1, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ 
                type: "spring",
                stiffness: 100,
                damping: 15,
                delay: 0.3
              }}
              whileHover={{ 
                scale: 1.02,
                transition: { type: "spring", stiffness: 300, damping: 10 }
              }}
              style={{ transformStyle: "preserve-3d" }}
            >
              <motion.div 
                className="space-y-6"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.2
                    }
                  }
                }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.div 
                  className="flex justify-between items-center border-b border-gray-200 pb-4"
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { 
                      opacity: 1, 
                      x: 0,
                      transition: { type: "spring", stiffness: 100 }
                    }
                  }}
                  whileHover={{ 
                    x: 10,
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                  }}
                >
                  <div>
                    <motion.h3 
                      className="text-lg font-semibold text-gray-900"
                      whileHover={{ scale: 1.05 }}
                    >
                      Base Fare
                    </motion.h3>
                    <motion.p 
                      className="text-gray-600"
                      whileHover={{ scale: 1.02 }}
                    >
                      Starting price for all rides
                    </motion.p>
                  </div>
                  <motion.span 
                    className="text-xl font-bold text-green-600"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      type: "spring",
                      stiffness: 200,
                      damping: 10,
                      delay: 0.5
                    }}
                    whileHover={{ 
                      scale: 1.2,
                      rotate: [0, -10, 10, -10, 0],
                      transition: { duration: 0.5 }
                    }}
                  >
                    ₹30
                  </motion.span>
                </motion.div>

                <motion.div 
                  className="flex justify-between items-center border-b border-gray-200 pb-4"
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { 
                      opacity: 1, 
                      x: 0,
                      transition: { type: "spring", stiffness: 100, delay: 0.2 }
                    }
                  }}
                  whileHover={{ 
                    x: 10,
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                  }}
                >
                  <div>
                    <motion.h3 
                      className="text-lg font-semibold text-gray-900"
                      whileHover={{ scale: 1.05 }}
                    >
                      Per Kilometer Rate
                    </motion.h3>
                    <motion.p 
                      className="text-gray-600"
                      whileHover={{ scale: 1.02 }}
                    >
                      Charged based on distance traveled
                    </motion.p>
                  </div>
                  <motion.span 
                    className="text-xl font-bold text-green-600"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      type: "spring",
                      stiffness: 200,
                      damping: 10,
                      delay: 0.7
                    }}
                    whileHover={{ 
                      scale: 1.2,
                      rotate: [0, -10, 10, -10, 0],
                      transition: { duration: 0.5 }
                    }}
                  >
                    ₹10/km
                  </motion.span>
                </motion.div>

                <motion.div 
                  className="flex justify-between items-center"
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { 
                      opacity: 1, 
                      x: 0,
                      transition: { type: "spring", stiffness: 100, delay: 0.4 }
                    }
                  }}
                  whileHover={{ 
                    x: 10,
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                  }}
                >
                  <div>
                    <motion.h3 
                      className="text-lg font-semibold text-gray-900"
                      whileHover={{ scale: 1.05 }}
                    >
                      Waiting Time
                    </motion.h3>
                    <motion.p 
                      className="text-gray-600"
                      whileHover={{ scale: 1.02 }}
                    >
                      Charged per minute of waiting
                    </motion.p>
                  </div>
                  <motion.span 
                    className="text-xl font-bold text-green-600"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      type: "spring",
                      stiffness: 200,
                      damping: 10,
                      delay: 0.9
                    }}
                    whileHover={{ 
                      scale: 1.2,
                      rotate: [0, -10, 10, -10, 0],
                      transition: { duration: 0.5 }
                    }}
                  >
                    ₹1/min
                  </motion.span>
                </motion.div>
              </motion.div>
              <motion.div 
                className="mt-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1.2 }}
              >
                <motion.p 
                  className="text-gray-600"
                  whileHover={{ scale: 1.05 }}
                >
                  *Prices may vary based on demand, time of day, and special events
                </motion.p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-green-600 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Ride?</h2>
            <p className="text-xl opacity-90 mb-8">
              Download our app and book your first ride today
            </p>
            <button className="px-8 py-3 bg-white text-green-600 font-semibold rounded-full hover:bg-green-50 transition-colors duration-300">
              Download App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RidesPage; 