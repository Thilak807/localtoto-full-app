import React from 'react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Book Your Ride',
      description: 'Enter your pickup and drop locations in the app or website to book your e-rickshaw.'
    },
    {
      number: '02',
      title: 'Get Picked Up',
      description: 'A nearby driver will accept your request and arrive at your location within minutes.'
    },
    {
      number: '03',
      title: 'Enjoy The Journey',
      description: 'Hop in and enjoy a comfortable, eco-friendly ride to your destination.'
    },
    {
      number: '04',
      title: 'Pay & Rate',
      description: 'Pay via cash or in-app payment methods and rate your experience.'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex flex-col items-center mb-4">
            <img 
              src="/full_logo.png" 
              alt="Local ToTo" 
              className="h-12 md:h-14 object-contain mb-3"
            />
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
          </div>
          <p className="text-lg text-gray-600">
            Simple, quick, and convenient - get from point A to B in just a few taps
          </p>
        </div>
        
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-green-200 -translate-y-1/2 z-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="bg-white w-16 h-16 rounded-full border-2 border-green-500 flex items-center justify-center mb-6 font-bold text-xl text-green-600">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">{step.title}</h3>
                <p className="text-gray-600 text-center">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <button className="px-8 py-3 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-colors duration-300">
            Book Your First Ride
          </button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;