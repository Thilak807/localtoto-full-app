import React, { useState } from 'react';
import { Send, Mail, PhoneCall, HelpCircle } from 'lucide-react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const DriverSupportPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    issue: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await api.post('/adminapi/contact', {
        ...formData,
        email: `driver-${formData.phone}@localtoto.org`,
        subject: `Driver Support: ${formData.issue}`
      });
      setSubmitStatus('success');
      setFormData({ name: '', phone: '', issue: '', message: '' });
    } catch (error: any) {
      console.error('Driver support form error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-classic py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Driver Support</h1>
            <p className="text-lg text-gray-600">
              Need help? We're here for you. Get support with your driver account, earnings, or any other questions.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label htmlFor="issue" className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Type *
                </label>
                <select
                  id="issue"
                  name="issue"
                  required
                  value={formData.issue}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select issue type</option>
                  <option value="account">Account Issues</option>
                  <option value="earnings">Earnings & Payments</option>
                  <option value="app">App Problems</option>
                  <option value="booking">Booking Issues</option>
                  <option value="document">Document Verification</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Describe Your Issue *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Tell us about your issue..."
                />
              </div>
              
              {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                  Thank you! We've received your message and will get back to you soon.
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                  Something went wrong. Please try again or contact us directly.
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/how-to-join-driver" className="block text-green-600 hover:text-green-700">
                → How to Join as a Driver
              </Link>
              <Link to="/become-rider" className="block text-green-600 hover:text-green-700">
                → Apply to Become a Driver
              </Link>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-xl shadow-md p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Support</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="tel:+919876543210" className="flex items-center gap-2 text-gray-600 hover:text-green-600">
                <PhoneCall className="w-5 h-5" />
                +91 98765 43210
              </a>
              <a href="mailto:info@localtoto.org" className="flex items-center gap-2 text-gray-600 hover:text-green-600">
                <Mail className="w-5 h-5" />
                info@localtoto.org
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverSupportPage;



