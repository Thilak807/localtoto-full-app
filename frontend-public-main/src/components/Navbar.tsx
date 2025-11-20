import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Link } from './Link';
import { isAllowedAdmin } from './admin/adminConfig';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const location = useLocation();
  const currentPath = location.pathname;
  const adminPhone = (typeof window !== 'undefined') ? localStorage.getItem('adminPhone') : null;
  const canSeeAdmin = isAllowedAdmin(adminPhone ?? undefined);
  const isUserLoggedIn = (typeof window !== 'undefined') ? !!localStorage.getItem('token') : false;

  // Close mobile menu on route change
  useEffect(() => {
    if (isOpen) setIsOpen(false);
  }, [currentPath]);

  const isRideFlowPage = currentPath === '/ride-initiate' || currentPath === '/booking-details';
  const isHomePage = currentPath === '/';
  const isSolid = isScrolled || !isHomePage;

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isSolid ? 'bg-white shadow-sm py-2 border-b border-gray-100' : 'bg-transparent py-4'
      }`}
    >
      <div className="container-classic">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <RouterLink to="/" className="flex items-center">
              <img 
                src={isSolid ? "/full_logo.png" : "/white_logo.png"} 
                alt="Local ToTo" 
                className="h-10 md:h-12 object-contain"
              />
            </RouterLink>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {isHomePage && (
              <RouterLink
                to="/"
                className={`font-medium transition-colors duration-200 ${
                  isSolid ? 'text-gray-700 hover:text-green-600' : 'text-white hover:text-green-300'
                }`}
              >
                Home
              </RouterLink>
            )}
            {canSeeAdmin && (
              <RouterLink
                to="/admin"
                className={`font-medium transition-colors duration-200 ${
                  isSolid ? 'text-gray-700 hover:text-green-600' : 'text-white hover:text-green-300'
                }`}
              >
                Admin
              </RouterLink>
            )}
            {isHomePage && (
              <RouterLink
                to="/rides"
                className={`font-medium transition-colors duration-200 ${
                  isSolid ? 'text-gray-700 hover:text-green-600' : 'text-white hover:text-green-300'
                }`}
              >
                Rides
              </RouterLink>
            )}
            {isHomePage && (
              <RouterLink
                to="/safety"
                className={`font-medium transition-colors duration-200 ${
                  isSolid ? 'text-gray-700 hover:text-green-600' : 'text-white hover:text-green-300'
                }`}
              >
                Safety
              </RouterLink>
            )}
            {/* Profile link removed across pages per requirement */}
            <RouterLink
              to="/about"
              className={`font-medium transition-colors duration-200 ${
                isScrolled ? 'text-gray-700 hover:text-green-600' : 'text-white hover:text-green-300'
              }`}
            >
              About
            </RouterLink>
            <RouterLink
              to="/become-rider"
              className={`font-medium transition-colors duration-200 ${
                isScrolled ? 'text-gray-700 hover:text-green-600' : 'text-white hover:text-green-300'
              }`}
            >
              Become a Rider
            </RouterLink>
            <div className="relative group">
              <button 
                className={`flex items-center font-medium transition-colors duration-200 ${
                  isSolid ? 'text-gray-700 hover:text-green-600' : 'text-white hover:text-green-300'
                }`}
              >
                More <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <Link to="#faq" className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600">
                  FAQs
                </Link>
                <Link to="#careers" className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600">
                  Careers
                </Link>
                <Link to="#contact" className="block px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600">
                  Contact Us
                </Link>
              </div>
            </div>
            {/* Right-side CTA logic */}
            {(isRideFlowPage || isHomePage) ? (
              isUserLoggedIn ? (
                <RouterLink to="/profile" className="btn btn-primary rounded-full">Profile</RouterLink>
              ) : (
                <RouterLink to="/signin" className="btn btn-secondary rounded-full">Sign In</RouterLink>
              )
            ) : (
              <RouterLink to="/become-rider" className="btn btn-primary rounded-full">Become a Driver</RouterLink>
            )}
          </div>
          
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`${isSolid ? 'text-gray-800' : 'text-white'} focus:outline-none`}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-3 bg-white px-4 py-5 rounded-lg shadow-lg">
              {isHomePage && (
                <RouterLink
                  to="/"
                  className="text-gray-700 hover:text-green-600 font-medium"
                >
                  Home
                </RouterLink>
              )}
              {isHomePage && (
                <RouterLink
                  to="/rides"
                  className="text-gray-700 hover:text-green-600 font-medium"
                >
                  Rides
                </RouterLink>
              )}
              {isHomePage && (
                <RouterLink
                  to="/safety"
                  className="text-gray-700 hover:text-green-600 font-medium"
                >
                  Safety
                </RouterLink>
              )}
              {/* Profile link removed across pages per requirement */}
              <RouterLink
                to="/about"
                className="text-gray-700 hover:text-green-600 font-medium"
              >
                About
              </RouterLink>
              {canSeeAdmin && (
                <RouterLink
                  to="/admin"
                  className="text-gray-700 hover:text-green-600 font-medium"
                >
                  Admin
                </RouterLink>
              )}
              <RouterLink
                to="/become-rider"
                className="text-gray-700 hover:text-green-600 font-medium"
              >
                Become a Rider
              </RouterLink>
              <Link to="#faq" className="text-gray-700 hover:text-green-600 font-medium">
                FAQs
              </Link>
              <Link to="#careers" className="text-gray-700 hover:text-green-600 font-medium">
                Careers
              </Link>
              <Link to="#contact" className="text-gray-700 hover:text-green-600 font-medium">
                Contact Us
              </Link>
              {/* Mobile CTA logic */}
              {(isRideFlowPage || isHomePage) ? (
                isUserLoggedIn ? (
                  <RouterLink
                    to="/profile"
                    className="px-4 py-2 font-medium text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors duration-200 text-center"
                  >
                    Profile
                  </RouterLink>
                ) : (
                  <RouterLink
                    to="/signin"
                    className="px-4 py-2 font-medium text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors duration-200 text-center"
                  >
                    Sign In
                  </RouterLink>
                )
              ) : (
                <RouterLink
                  to="/become-rider"
                  className="px-4 py-2 font-medium text-white bg-green-600 rounded-full hover:bg-green-700 transition-colors duration-200 text-center"
                >
                  Become a Driver
                </RouterLink>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;