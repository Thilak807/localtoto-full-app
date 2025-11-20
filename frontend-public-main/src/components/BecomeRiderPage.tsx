import React, { useState } from 'react';
import api from '../services/api';
import { CheckCircle } from 'lucide-react';
import { User, Mail, Phone, MapPin, Car, FileText, ArrowRight, ArrowLeft } from 'lucide-react';

const BecomeRiderPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    vehicleType: '',
    vehicleNumber: '',
    experience: '',
    documents: null as File | null,
    panCard: null as File | null,
    aadhaarCard: null as File | null
  });
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [resendIn, setResendIn] = useState<number>(0)
  const resendTimerRef = React.useRef<number | null>(null)
  const [otpMessage, setOtpMessage] = useState<string>('')
  const [submitMessage, setSubmitMessage] = useState<string>('')
  const [phoneVerified, setPhoneVerified] = useState<boolean>(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Reset phone-related state when phone changes
    if (name === 'phone') {
      setPhoneVerified(false)
      setOtpSent(false)
      setOtp('')
      setOtpMessage('')
      try { if (resendTimerRef.current) { window.clearInterval(resendTimerRef.current); resendTimerRef.current = null } } catch {}
      setResendIn(0)
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMessage('')
    setSubmitting(true)
    const doSubmit = async () => {
      try {
        console.log('[BecomeRider] Starting form submission...')
        const startTime = Date.now()
        
        const form = new FormData()
        form.append('fullName', formData.fullName)
        form.append('email', formData.email)
        form.append('phone', formData.phone)
        form.append('address', formData.address)
        form.append('vehicleType', formData.vehicleType)
        form.append('vehicleNumber', formData.vehicleNumber)
        form.append('experience', String(formData.experience||''))
        // @ts-ignore
        if (formData.panCard) {
          console.log('[BecomeRider] Adding PAN card:', formData.panCard.name, formData.panCard.size, 'bytes')
          form.append('panCard', formData.panCard)
        }
        // @ts-ignore
        if (formData.aadhaarCard) {
          console.log('[BecomeRider] Adding Aadhaar card:', formData.aadhaarCard.name, formData.aadhaarCard.size, 'bytes')
          form.append('aadhaarCard', formData.aadhaarCard)
        }
        // @ts-ignore
        if ((formData as any).dob) form.append('dob', (formData as any).dob)
        
        console.log('[BecomeRider] Submitting form to /riders/applications...')
        const res = await api.post('/riders/applications', form, { 
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 120000 // 2 minutes for file uploads
        })
        
        const endTime = Date.now()
        console.log(`[BecomeRider] Form submission completed in ${endTime - startTime}ms`)
        console.log('[BecomeRider] Response:', res.data)
        
        setSubmitted(true)
      } catch (e: any) {
        console.error('[BecomeRider] Form submission error:', e)
        console.error('[BecomeRider] Error response:', e?.response)
        console.error('[BecomeRider] Error code:', e?.code)
        console.error('[BecomeRider] Error message:', e?.message)
        
        // Handle timeout errors
        if (e?.code === 'ECONNABORTED' || e?.message?.includes('timeout')) {
          setSubmitMessage('Request timed out. The files may be too large. Please try again with smaller images.')
        } else if (e?.response?.data?.message) {
          setSubmitMessage(e.response.data.message)
        } else if (e?.message) {
          setSubmitMessage(e.message)
        } else {
          setSubmitMessage('Failed to submit application. Please check your connection and try again.')
        }
      } finally {
        setSubmitting(false)
      }
    }
    doSubmit()
  };

  const sendOtp = async () => {
    const digits = formData.phone ? formData.phone.replace(/\D/g,'') : ''
    if (!digits || digits.length < 10) {
      setOtpMessage('Enter a valid 10-digit phone number')
      return
    }
    setOtpMessage('')
    setSending(true)
    try {
      const res = await api.post('/riders/send-otp', { phoneNumber: formData.phone })
      setOtpSent(true)
      setOtpMessage('OTP sent. Please check your messages.')
      // start resend cooldown (15s)
      try { if (resendTimerRef.current) window.clearInterval(resendTimerRef.current) } catch {}
      setResendIn(15)
      resendTimerRef.current = window.setInterval(() => {
        setResendIn(prev => {
          if (prev <= 1) { if (resendTimerRef.current) { window.clearInterval(resendTimerRef.current); resendTimerRef.current = null } return 0 }
          return prev - 1
        })
      }, 1000)
      // Do not show dev OTP in UI for production-like UX
      if (res.data?.devOtp) {
        // noop; optionally console.debug(res.data.devOtp)
      }
    } catch (e: any) {
      setOtpMessage(e?.response?.data?.message || 'Failed to send OTP')
    } finally {
      setSending(false)
    }
  }

  const verifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setOtpMessage('Enter 6-digit OTP')
      return
    }
    setVerifying(true)
    try {
      const res = await api.post('/riders/verify-otp', { phoneNumber: formData.phone, otp, context: 'application' })
      if (res.data?.success) {
        setPhoneVerified(true)
        setOtpMessage('Phone verified successfully.')
      } else {
        setOtpMessage(res.data?.message || 'Invalid OTP')
      }
    } catch (e: any) {
      setOtpMessage(e?.response?.data?.message || 'Failed to verify OTP')
    } finally {
      setVerifying(false)
    }
  }

  React.useEffect(() => {
    return () => { if (resendTimerRef.current) { window.clearInterval(resendTimerRef.current); resendTimerRef.current = null } }
  }, [])

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep === step
                ? 'bg-green-600 text-white'
                : currentStep > step
                ? 'bg-green-200 text-green-600'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {step}
          </div>
          {step < 3 && (
            <div
              className={`w-16 h-1 ${
                currentStep > step ? 'bg-green-600' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-green-700 to-green-500 py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45IDAtMTggOC4xLTE4IDE4czguMSAxOCAxOCAxOCAxOC04LjEgMTgtMTgtOC4xLTE4LTE4LTE4em0wIDJjOC44IDAgMTYgNy4yIDE2IDE2cy03LjIgMTYtMTYgMTYtMTYtNy4yLTE2LTE2IDcuMi0xNiAxNi0xNnoiIGZpbGw9IiNmZmZmZmYiLz48L2c+PC9zdmc+')]"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block mb-4">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-400 bg-opacity-20 text-white text-sm font-medium">
                <span className="w-2 h-2 mr-2 rounded-full bg-green-300 animate-pulse"></span>
                Join Our Growing Community
              </span>
            </div>
            <div className="flex flex-col items-center mb-6">
              <img 
                src="/full_logo.png" 
                alt="Local ToTo" 
                className="h-16 md:h-20 object-contain mb-4 filter brightness-0 invert"
              />
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Become a Rider
              </h1>
            </div>
            <p className="text-xl text-white text-opacity-90 mb-8 max-w-2xl mx-auto">
              Join our network of professional e-rickshaw drivers and start earning today
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white bg-opacity-10 rounded-lg px-6 py-4 backdrop-blur-sm">
                <div className="text-2xl font-bold text-white mb-1">₹15,000+</div>
                <div className="text-white text-opacity-80">Average Monthly Earnings</div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg px-6 py-4 backdrop-blur-sm">
                <div className="text-2xl font-bold text-white mb-1">24/7</div>
                <div className="text-white text-opacity-80">Support Available</div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg px-6 py-4 backdrop-blur-sm">
                <div className="text-2xl font-bold text-white mb-1">100+</div>
                <div className="text-white text-opacity-80">Active Riders</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </div>

      {/* Application Form */}
      <div className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              {submitted ? (
                <div className="text-center py-10 space-y-4">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                  <h2 className="text-2xl font-semibold text-gray-800">Application submitted successfully!</h2>
                  <p className="text-gray-600 max-w-md mx-auto">We will contact you soon. Use your mobile number for login.</p>
                </div>
              ) : (
                <>
                {renderStepIndicator()}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Step 1: Personal Information */}
                  <div className={`space-y-4 ${currentStep === 1 ? 'block' : 'hidden'}`}>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Personal Information</h2>
                    
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Full Name"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Email Address"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      />
                    </div>

                    {/* Address above phone verification */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Full Address"
                        required
                        rows={3}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="relative flex-1 min-w-0">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Phone Number"
                          required
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                          disabled={phoneVerified}
                        />
                      </div>
                      {!otpSent ? (
                        <button type="button" onClick={sendOtp} disabled={sending || phoneVerified} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 whitespace-nowrap shrink-0 basis-full sm:basis-auto">
                          {sending ? 'Sending...' : 'Send OTP'}
                        </button>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2 shrink-0 basis-full sm:basis-auto">
                          <input value={otp} onChange={(e)=>setOtp(e.target.value)} placeholder="Enter OTP" className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 w-full sm:w-32" maxLength={6} disabled={phoneVerified} />
                          <button type="button" onClick={verifyOtp} disabled={verifying || !otp || phoneVerified} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap shrink-0 w-full sm:w-auto">
                            {verifying ? 'Verifying...' : 'Verify'}
                          </button>
                          <button type="button" onClick={sendOtp} disabled={sending || resendIn>0 || phoneVerified} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 disabled:opacity-50 whitespace-nowrap shrink-0 w-full sm:w-auto">
                            {resendIn>0 ? `Resend in ${resendIn}s` : 'Resend OTP'}
                          </button>
                        </div>
                      )}
                      {otpMessage && (
                        <div className="w-full text-sm text-gray-700 mt-1">{otpMessage}</div>
                      )}
                    </div>
                  </div>

                  {/* Step 2: Vehicle Information */}
                  <div className={`space-y-4 ${currentStep === 2 ? 'block' : 'hidden'}`}>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Vehicle Information</h2>
                    
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Car className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        name="vehicleType"
                        value={formData.vehicleType}
                        onChange={handleInputChange}
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      >
                        <option value="">Select Vehicle Type</option>
                        <option value="e-rickshaw">E-Rickshaw</option>
                        <option value="e-auto">E-Auto</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="vehicleNumber"
                        value={formData.vehicleNumber}
                        onChange={handleInputChange}
                        placeholder="Vehicle Number"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      />
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      >
                        <option value="">Select Experience</option>
                        <option value="0-1">0-1 years</option>
                        <option value="1-3">1-3 years</option>
                        <option value="3-5">3-5 years</option>
                        <option value="5+">5+ years</option>
                      </select>
                    </div>
                  </div>

                  {/* Step 3: Identity Documents */}
                  <div className={`space-y-4 ${currentStep === 3 ? 'block' : 'hidden'}`}>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Identity Documents</h2>
                    {/* DOB */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        name="dob"
                        onChange={handleInputChange}
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      />
                    </div>
                    
                    {/* PAN Card Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">PAN Card</h3>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Upload PAN Card (PDF/Image)
                        </label>
                        <input
                          type="file"
                          name="panCard"
                          onChange={handleFileChange}
                          accept=".pdf,.jpg,.jpeg,.png"
                          required={false}
                          className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-green-50 file:text-green-700
                            hover:file:bg-green-100"
                        />
                      </div>
                    </div>

                    {/* Aadhaar Card Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Aadhaar Card</h3>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Upload Aadhaar Card (PDF/Image)
                        </label>
                        <input
                          type="file"
                          name="aadhaarCard"
                          onChange={handleFileChange}
                          accept=".pdf,.jpg,.jpeg,.png"
                          required
                          className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-green-50 file:text-green-700
                            hover:file:bg-green-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submission message */}
                  {submitMessage && (
                    <div className="text-sm text-red-600">{submitMessage}</div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-6">
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-300"
                      >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Previous
                      </button>
                    )}
                    {currentStep < 3 ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        disabled={currentStep === 1 && !phoneVerified}
                        className="flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-300 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-300 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? 'Submitting...' : 'Submit Application'}
                      </button>
                    )}
                  </div>
                </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeRiderPage; 