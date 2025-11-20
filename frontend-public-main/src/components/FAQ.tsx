import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: 'How do I book an e-rickshaw ride?',
      answer: 'You can book a ride through our mobile app, website, or by calling our customer service. Simply enter your pickup and drop locations, select the type of ride, and confirm your booking.'
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept cash, credit/debit cards, UPI, and mobile wallets. You can choose your preferred payment method while booking or at the end of your ride.'
    },
    {
      question: 'Is Local ToTo available 24/7?',
      answer: 'Yes, Local ToTo services are available 24/7 in most cities. However, availability might vary depending on your location and the number of active drivers nearby.'
    },
    {
      question: 'How can I become a Local ToTo driver?',
      answer: 'To become a driver partner, you need to have a valid driver\'s license, vehicle registration, and insurance. Visit our "Become a Driver" page or download the driver app to start the registration process.'
    },
    {
      question: 'Are there any cancellation charges?',
      answer: 'We have a flexible cancellation policy. Cancellations made within 1 minute of booking are free. After that, a nominal cancellation fee may apply depending on the driver\'s distance traveled.'
    },
    {
      question: 'How is the fare calculated?',
      answer: 'Our fares are calculated based on the distance traveled, time taken, and the current demand. Base fare + Distance fare + Time fare + Any applicable taxes or fees = Total fare.'
    }
  ];

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container-classic">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-gray-600">
            Find answers to the most common questions about our services
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="mb-4 card overflow-hidden transition-all duration-300"
            >
              <button
                className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition-colors duration-300"
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-medium text-lg text-gray-900">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              
              <div 
                className={`px-5 bg-gray-50 transition-all duration-300 overflow-hidden ${
                  openIndex === index ? 'max-h-96 py-5' : 'max-h-0 py-0'
                }`}
              >
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <a href="#contact" className="inline-flex items-center px-6 py-3 btn btn-primary rounded-full">
            Contact Support
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;