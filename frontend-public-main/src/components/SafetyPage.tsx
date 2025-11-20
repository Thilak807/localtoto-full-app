import React from 'react';
import { Shield, UserCheck, MapPin, Phone, Clock, AlertCircle } from 'lucide-react';

const SafetyPage: React.FC = () => {
  const safetyFeatures = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Verified Drivers',
      description: 'All our drivers undergo thorough background checks and verification processes.'
    },
    {
      icon: <UserCheck className="w-8 h-8" />,
      title: 'Driver Training',
      description: 'Comprehensive training programs ensure our drivers are well-equipped with safety protocols.'
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: 'Real-time Tracking',
      description: 'Track your ride in real-time and share your journey with loved ones.'
    },
    {
      icon: <Phone className="w-8 h-8" />,
      title: '24/7 Support',
      description: 'Our support team is available round the clock to assist you with any concerns.'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Regular Maintenance',
      description: 'All e-rickshaws undergo regular maintenance checks to ensure safe operation.'
    },
    {
      icon: <AlertCircle className="w-8 h-8" />,
      title: 'Emergency Response',
      description: 'Quick emergency response system in place for any unforeseen situations.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <div className="bg-green-600 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">Your Safety is Our Priority</h1>
            <p className="text-xl opacity-90">
              Comprehensive safety measures to ensure a secure and comfortable ride
            </p>
          </div>
        </div>
      </div>

      {/* Safety Features Grid */}
      <div className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {safetyFeatures.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                <div className="text-green-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safety Guidelines */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-16">Safety Guidelines</h2>
            
            <div className="space-y-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">For Riders</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Always verify the driver and vehicle details before boarding
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Share your ride details with friends or family
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Wear your seatbelt if available
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Report any safety concerns immediately
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">For Drivers</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Regular vehicle maintenance and safety checks
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Follow traffic rules and speed limits
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Maintain professional conduct with riders
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">•</span>
                    Report any incidents or concerns to support
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Emergency Contact</h2>
            <p className="text-lg text-gray-600 mb-8">
              In case of any emergency, our support team is available 24/7
            </p>
            <div className="bg-white rounded-xl p-8 shadow-md inline-block">
              <div className="text-2xl font-bold text-green-600 mb-2">1800-XXX-XXXX</div>
              <p className="text-gray-600">Available 24/7</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyPage; 