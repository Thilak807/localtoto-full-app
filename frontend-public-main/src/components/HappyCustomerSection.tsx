import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, Users } from 'lucide-react';

const HappyCustomerSection: React.FC = () => {
  const testimonials = [
    {
      name: "Rahul Sharma",
      role: "Regular Commuter",
      rating: 5,
      text: "The e-rickshaw service has made my daily commute so much easier. The drivers are professional and the rides are always comfortable.",
      image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      name: "Priya Patel",
      role: "Business Professional",
      rating: 5,
      text: "I love how eco-friendly and affordable the service is. The app makes booking rides super convenient, and the drivers are always on time.",
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      name: "Amit Kumar",
      role: "Student",
      rating: 5,
      text: "As a student, I appreciate the affordable rates. The service is reliable and the drivers are very friendly. Highly recommended!",
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const cardVariants = {
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
    },
    hover: {
      y: -10,
      rotateX: 5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const starVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: (i: number) => ({
      scale: 1,
      rotate: 0,
      transition: {
        delay: i * 0.1,
        type: "spring",
        stiffness: 200,
        damping: 10
      }
    })
  };

  const quoteVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10
      }
    }
  };

  const statsCardVariants = {
    hidden: { 
      opacity: 0,
      x: 100,
      rotateY: -45,
      scale: 0.8
    },
    visible: { 
      opacity: 1,
      x: 0,
      rotateY: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        delay: 0.5
      }
    },
    hover: {
      rotateY: 10,
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const progressBarVariants = {
    hidden: { width: 0 },
    visible: {
      width: "80%",
      transition: {
        duration: 1.5,
        ease: "easeOut",
        delay: 1
      }
    }
  };

  return (
    <section className="py-20 bg-gray-50 relative">
      <motion.div 
        className="absolute -top-10 -right-10 bg-white rounded-lg shadow-lg p-4 w-44 transform perspective-1000"
        variants={statsCardVariants}
        initial="hidden"
        whileInView="visible"
        whileHover="hover"
        viewport={{ once: true }}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-gray-500 text-sm">Happy Customers</p>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            <p className="text-2xl font-bold text-green-600">50,000+</p>
          </div>
        </motion.div>
        <div className="mt-1 w-full bg-gray-200 h-1 rounded-full overflow-hidden">
          <motion.div 
            className="bg-green-500 h-full"
            variants={progressBarVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          />
        </div>
      </motion.div>

      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold mb-4">Happy Customers</h2>
          <p className="text-xl text-gray-600">What our customers say about us</p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl shadow-lg overflow-hidden transform perspective-1000"
              variants={cardVariants}
              whileHover="hover"
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <motion.div 
                    className="w-16 h-16 rounded-full overflow-hidden mr-4"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  >
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-semibold">{testimonial.name}</h3>
                    <p className="text-gray-600">{testimonial.role}</p>
                  </div>
                </div>

                <motion.div 
                  className="flex mb-4"
                  variants={containerVariants}
                >
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      custom={i}
                      variants={starVariants}
                    >
                      <Star className="w-5 h-5 text-yellow-400" fill="currentColor" />
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div 
                  className="relative"
                  variants={quoteVariants}
                >
                  <Quote className="w-8 h-8 text-green-500 opacity-20 absolute -top-2 -left-2" />
                  <p className="text-gray-700 relative z-10">{testimonial.text}</p>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HappyCustomerSection; 