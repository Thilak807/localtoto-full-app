import React from 'react';
import { Users, Award, Heart, Globe } from 'lucide-react';

const AboutPage: React.FC = () => {
  const stats = [
    { number: '50K+', label: 'Happy Customers', icon: <Users className="w-8 h-8" /> },
    { number: '1000+', label: 'Active Drivers', icon: <Award className="w-8 h-8" /> },
    { number: '95%', label: 'Customer Satisfaction', icon: <Heart className="w-8 h-8" /> },
    { number: '10+', label: 'Cities Covered', icon: <Globe className="w-8 h-8" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <div className="bg-green-600 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
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
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600">
              At Local ToTo, we're committed to providing affordable, eco-friendly, and convenient transportation solutions. 
              Our goal is to reduce carbon emissions while making urban travel accessible to everyone.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-md text-center">
                <div className="text-green-600 mb-4 flex justify-center">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* CEO Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Leadership</h2>
            <div className="max-w-3xl mx-auto bg-white rounded-xl p-8 shadow-lg">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-48 h-48 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-6xl font-bold text-green-600">AB</span>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Anmo Bharti</h3>
                  <p className="text-xl text-green-600 mb-4">Chief Executive Officer</p>
                  <p className="text-gray-600">
                    Anmo Bharti is the visionary CEO behind Local ToTo, driving innovation in sustainable transportation. 
                    With a passion for environmental conservation and community service, Anmo has led Local ToTo from 
                    a small startup to a trusted name in eco-friendly urban mobility. Under Anmo's leadership, the company 
                    has expanded across multiple cities, connecting thousands of drivers with passengers while reducing 
                    carbon emissions and creating economic opportunities.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Developer Team Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Developer Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-xl p-6 shadow-md text-center">
                <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl font-bold text-green-600">RP</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Rishav Prakash</h3>
                <p className="text-gray-600">Full Stack Developer</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md text-center">
                <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl font-bold text-green-600">PS</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Priyanshu Singh</h3>
                <p className="text-gray-600">Full Stack Developer</p>
              </div>
            </div>
          </div>

          {/* Story Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Story</h3>
              <p className="text-gray-600 mb-4">
                Local ToTo was founded in 2023 with a vision to transform urban transportation. 
                We recognized the need for sustainable mobility solutions that could serve both 
                the environment and the community.
              </p>
              <p className="text-gray-600 mb-4">
                Starting with just 10 e-rickshaws in one city, we've grown to become a trusted 
                name in eco-friendly transportation across multiple cities.
              </p>
              <p className="text-gray-600">
                Today, we continue to innovate and expand our services while staying true to 
                our core values of sustainability, affordability, and customer satisfaction.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-w-16 aspect-h-9 rounded-xl overflow-hidden bg-white p-8 shadow-lg">
                <svg 
                  viewBox="0 0 400 300" 
                  className="w-full h-full"
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* E-rickshaw body */}
                  <path 
                    d="M100 150C100 122.386 122.386 100 150 100H250C277.614 100 300 122.386 300 150V200C300 227.614 277.614 250 250 250H150C122.386 250 100 227.614 100 200V150Z" 
                    fill="#16A34A"
                  />
                  
                  {/* E-rickshaw top */}
                  <path 
                    d="M150 120C134.536 120 122 132.536 122 148V202C122 217.464 134.536 230 150 230H250C265.464 230 278 217.464 278 202V148C278 132.536 265.464 120 250 120H150Z" 
                    fill="white"
                  />
                  
                  {/* E-rickshaw wheels */}
                  <circle cx="150" cy="200" r="20" fill="#16A34A"/>
                  <circle cx="250" cy="200" r="20" fill="#16A34A"/>
                  <circle cx="150" cy="200" r="10" fill="white"/>
                  <circle cx="250" cy="200" r="10" fill="white"/>
                  
                  {/* E-rickshaw handle */}
                  <path 
                    d="M200 120V80" 
                    stroke="#16A34A" 
                    strokeWidth="8" 
                    strokeLinecap="round"
                  />
                  
                  {/* E-rickshaw seat */}
                  <path 
                    d="M150 180H250" 
                    stroke="#16A34A" 
                    strokeWidth="8" 
                    strokeLinecap="round"
                  />
                  
                  {/* E-rickshaw headlight */}
                  <circle cx="280" cy="150" r="10" fill="#FFD700"/>
                  
                  {/* E-rickshaw details */}
                  <path 
                    d="M150 150H250" 
                    stroke="#16A34A" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                  />
                  <path 
                    d="M170 130H230" 
                    stroke="#16A34A" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-16">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Sustainability</h3>
              <p className="text-gray-600">
                We're committed to reducing carbon emissions and promoting eco-friendly transportation.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Community</h3>
              <p className="text-gray-600">
                We believe in creating opportunities for drivers and serving our communities.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Excellence</h3>
              <p className="text-gray-600">
                We strive for excellence in service quality and customer satisfaction.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 