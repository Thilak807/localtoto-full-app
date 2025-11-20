import React from 'react';
import { DollarSign, FileText, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HowToJoinDriverPage: React.FC = () => {
  const earnings = [
    { label: 'Average Daily Earnings', amount: '₹800-1,200' },
    { label: 'Weekly Earnings', amount: '₹5,600-8,400' },
    { label: 'Monthly Potential', amount: '₹24,000-36,000' }
  ];

  const requirements = [
    { title: 'Valid Driving License', description: 'Must have a valid driving license for auto-rickshaw' },
    { title: 'Vehicle Registration', description: 'Your vehicle must be registered and have valid documents' },
    { title: 'Phone Number', description: 'Active mobile number for OTP verification and app login' },
    { title: 'Bank Account', description: 'Bank account for earnings transfer' },
    { title: 'Age Requirement', description: 'Must be at least 21 years old' }
  ];

  const benefits = [
    'Flexible working hours',
    'Competitive earnings',
    'Weekly payouts',
    'No commission on first month',
    '24/7 support',
    'GPS tracking for safety'
  ];

  const steps = [
    { number: 1, title: 'Fill Application', description: 'Complete the online application form with your details' },
    { number: 2, title: 'Submit Documents', description: 'Upload required documents (License, RC, etc.)' },
    { number: 3, title: 'Verification', description: 'Our team will verify your documents (1-2 business days)' },
    { number: 4, title: 'Start Earning', description: 'Get approved and start accepting rides immediately!' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="container-classic">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex flex-col items-center mb-6">
              <img 
                src="/full_logo.png" 
                alt="Local ToTo" 
                className="h-16 md:h-20 object-contain mb-4"
              />
              <h1 className="text-4xl md:text-5xl font-bold">Join as a Driver</h1>
            </div>
            <p className="text-xl opacity-90 mb-8">
              Start earning with flexible hours. Be your own boss and make a difference in your city.
            </p>
            <Link
              to="/become-rider"
              className="inline-flex items-center gap-2 bg-white text-green-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors duration-300"
            >
              Apply Now
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Earnings Section */}
      <section className="py-16 bg-white">
        <div className="container-classic">
          <div className="text-center mb-12">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Much Can You Earn?</h2>
            <p className="text-lg text-gray-600">
              Competitive earnings with flexible working hours
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {earnings.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center border border-green-200">
                <div className="text-2xl font-bold text-green-700 mb-2">{item.amount}</div>
                <div className="text-gray-700">{item.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center text-gray-600 max-w-2xl mx-auto">
            <p className="text-sm">
              * Earnings may vary based on location, hours worked, and demand. These are estimated figures.
            </p>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-classic">
          <div className="text-center mb-12">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Requirements</h2>
            <p className="text-lg text-gray-600">
              Simple requirements to get started
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {requirements.map((req, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md">
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{req.title}</h3>
                <p className="text-gray-600">{req.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container-classic">
          <div className="text-center mb-12">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Join Local ToTo?</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 bg-gray-50 rounded-lg p-4">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Join Steps */}
      <section className="py-16 bg-gray-50">
        <div className="container-classic">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How to Join</h2>
            <p className="text-lg text-gray-600">
              Simple 4-step process to start earning
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="bg-green-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
                      {step.number}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="hidden md:block h-24 w-0.5 bg-green-200 mx-auto mt-2" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600 text-white">
        <div className="container-classic text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Earning?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of drivers already earning with Local ToTo
          </p>
          <Link
            to="/become-rider"
            className="inline-flex items-center gap-2 bg-white text-green-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors duration-300"
          >
            Apply Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HowToJoinDriverPage;

