import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    role: 'Daily Commuter',
    message: 'Local ToTo has made my daily commute so much easier and affordable. I love that I\'m helping the environment while getting to work on time!',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    rating: 5
  },
  {
    id: 2,
    name: 'Rahul Verma',
    role: 'College Student',
    message: 'The shared ride option is perfect for students like me. I save money and meet interesting people on my way to college. Highly recommended!',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    rating: 4
  },
  {
    id: 3,
    name: 'Meera Patel',
    role: 'Small Business Owner',
    message: 'I use Local ToTo to deliver small packages to my customers. It\'s quick, reliable, and the drivers are always professional and friendly.',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    rating: 5
  }
];

const Testimonials: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="container-classic">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Riders Say</h2>
          <p className="text-lg text-gray-600">
            Thousands of happy customers rely on us daily for their transportation needs
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="card rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-5">
              <div className="hidden md:block md:col-span-2 bg-green-600 relative">
                <img 
                  src={testimonials[currentIndex].avatar}
                  alt={testimonials[currentIndex].name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/70 via-green-800/30 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <div className="flex mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-5 h-5 mr-1" 
                        fill={i < testimonials[currentIndex].rating ? "currentColor" : "none"} 
                      />
                    ))}
                  </div>
                  <h3 className="text-xl font-bold">{testimonials[currentIndex].name}</h3>
                  <p className="opacity-90">{testimonials[currentIndex].role}</p>
                </div>
              </div>
              
              <div className="p-8 md:p-12 md:col-span-3 flex flex-col justify-between">
                {/* Mobile avatar - only visible on mobile */}
                <div className="flex items-center mb-6 md:hidden">
                  <img 
                    src={testimonials[currentIndex].avatar}
                    alt={testimonials[currentIndex].name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="ml-4">
                    <h3 className="text-xl font-bold">{testimonials[currentIndex].name}</h3>
                    <p className="text-gray-600">{testimonials[currentIndex].role}</p>
                    <div className="flex mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 mr-1 ${i < testimonials[currentIndex].rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill={i < testimonials[currentIndex].rating ? "currentColor" : "none"} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <blockquote>
                  <svg className="w-10 h-10 text-gray-200 mb-4" fill="currentColor" viewBox="0 0 32 32">
                    <path d="M10,8.5c-1.7,0-3.2,0.6-4.4,1.8C4.4,11.5,3.8,13,3.8,14.8c0,1.7,0.6,3.2,1.8,4.4c1.2,1.2,2.7,1.8,4.4,1.8h0.8
                      c0.1,0,0.2,0,0.3,0.1c0.1,0.1,0.1,0.2,0.1,0.3v3.5c0,0.1,0,0.2-0.1,0.3c-0.1,0.1-0.2,0.1-0.3,0.1H10c-2.7,0-5.1-1-7-2.9
                      C1,20.3,0,18,0,15.1c0-2.8,1-5.1,2.9-7C4.9,6.1,7.2,5.1,10,5.1h0.8c0.1,0,0.2,0,0.3,0.1c0.1,0.1,0.1,0.2,0.1,0.3V9
                      c0,0.1,0,0.2-0.1,0.3c-0.1,0.1-0.2,0.1-0.3,0.1H10L10,8.5z M21.9,8.5c-1.7,0-3.2,0.6-4.4,1.8c-1.2,1.2-1.8,2.7-1.8,4.4
                      c0,1.7,0.6,3.2,1.8,4.4c1.2,1.2,2.7,1.8,4.4,1.8h0.8c0.1,0,0.2,0,0.3,0.1c0.1,0.1,0.1,0.2,0.1,0.3v3.5c0,0.1,0,0.2-0.1,0.3
                      c-0.1,0.1-0.2,0.1-0.3,0.1h-0.8c-2.7,0-5.1-1-7-2.9c-1.9-1.9-2.9-4.3-2.9-7.1c0-2.8,1-5.1,2.9-7c1.9-1.9,4.3-2.9,7-2.9h0.8
                      c0.1,0,0.2,0,0.3,0.1c0.1,0.1,0.1,0.2,0.1,0.3V9c0,0.1,0,0.2-0.1,0.3c-0.1,0.1-0.2,0.1-0.3,0.1H21.9z"/>
                  </svg>
                  <p className="text-xl leading-relaxed text-gray-700 mb-8">
                    {testimonials[currentIndex].message}
                  </p>
                </blockquote>
                
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {currentIndex + 1} of {testimonials.length}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button onClick={prevTestimonial} className="p-2 rounded-full btn btn-secondary border border-gray-300">
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <button onClick={nextTestimonial} className="p-2 rounded-full btn btn-secondary border border-gray-300">
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;