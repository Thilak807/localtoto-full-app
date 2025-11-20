import React from 'react';
import { Zap, Clock, CreditCard, Shield } from 'lucide-react';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: <Zap className="h-10 w-10 text-green-600" />,
      title: 'Eco-Friendly',
      description: 'Zero emissions, all-electric rickshaws for a greener city and cleaner air.'
    },
    {
      icon: <Clock className="h-10 w-10 text-green-600" />,
      title: 'Quick Pickup',
      description: 'Get picked up within minutes with our large network of e-rickshaws.'
    },
    {
      icon: <CreditCard className="h-10 w-10 text-green-600" />,
      title: 'Affordable Fares',
      description: 'Economical rides with transparent pricing and no hidden charges.'
    },
    {
      icon: <Shield className="h-10 w-10 text-green-600" />,
      title: 'Safe Rides',
      description: 'Verified drivers, GPS tracking, and 24/7 customer support for secure journeys.'
    }
  ];

  return (
    <section id="why-choose-localtoto" className="py-20 bg-gray-50">
      <div className="container-classic">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex flex-col items-center mb-4">
            <img 
              src="/full_logo.png" 
              alt="Local ToTo" 
              className="h-12 md:h-14 object-contain mb-3"
            />
            <h2 className="text-3xl font-bold text-gray-900">Why Choose Us</h2>
          </div>
          <p className="text-lg text-gray-600">
            Experience the future of urban commuting with our eco-friendly e-rickshaws
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="card p-8 hover:shadow-md transition-shadow duration-300"
            >
              <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mb-6 mx-auto">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center">{feature.title}</h3>
              <p className="text-gray-600 text-center">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;