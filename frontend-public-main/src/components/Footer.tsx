import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { PhoneCall, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleSectionLink = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          window.scrollTo({
            top: element.getBoundingClientRect().top + window.scrollY - 100,
            behavior: 'smooth'
          });
        }
      }, 100);
    } else {
      const element = document.querySelector(hash);
      if (element) {
        window.scrollTo({
          top: element.getBoundingClientRect().top + window.scrollY - 100,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="container-classic">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="text-2xl font-bold flex items-center mb-6">
              <span className="bg-green-600 text-white p-1 rounded mr-1">Local</span>
              <span>ToTo</span>
            </div>
            <p className="text-gray-400 mb-6">
              Affordable, eco-friendly e-rickshaw rides at your fingertips. Connecting riders with drivers for a greener tomorrow.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors duration-300">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors duration-300">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <RouterLink to="/about" className="text-gray-400 hover:text-white transition-colors duration-300">
                  About Us
                </RouterLink>
              </li>
              <li>
                <a 
                  href="#why-choose-localtoto" 
                  onClick={(e) => handleSectionLink(e, '#why-choose-localtoto')}
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Why Us
                </a>
              </li>
              <li>
                <a 
                  href="#how-it-works" 
                  onClick={(e) => handleSectionLink(e, '#how-it-works')}
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a 
                  href="#faq" 
                  onClick={(e) => handleSectionLink(e, '#faq')}
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  FAQs
                </a>
              </li>
              <li>
                <a 
                  href="#testimonials" 
                  onClick={(e) => handleSectionLink(e, '#testimonials')}
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  Testimonials
                </a>
              </li>
              <li>
                <RouterLink to="/contact" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Contact Us
                </RouterLink>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6">For Drivers</h3>
            <ul className="space-y-3">
              <li>
                <RouterLink to="/how-to-join-driver" className="text-gray-400 hover:text-white transition-colors duration-300">
                  How to Join
                </RouterLink>
              </li>
              <li>
                <RouterLink to="/driver-support" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Driver Support
                </RouterLink>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-400">Haveli Appartment, Rukanpura, Patna-800014</span>
              </li>
              <li className="flex items-center">
                <PhoneCall className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-400">+91 98765 43210</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-400">info@localtoto.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-800 text-center sm:flex sm:justify-between sm:text-left">
          <p className="text-gray-400">© 2025 Local ToTo. All rights reserved.</p>
          <div className="mt-4 sm:mt-0">
            <RouterLink to="/privacy-policy" className="text-gray-400 hover:text-white mr-4 transition-colors duration-300">
              Privacy Policy
            </RouterLink>
            <RouterLink to="/terms-conditions" className="text-gray-400 hover:text-white transition-colors duration-300">
              Terms & Conditions
            </RouterLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;