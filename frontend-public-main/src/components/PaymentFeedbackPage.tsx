import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

interface State {
  rideId?: string;
  fare?: number;
}

const PaymentFeedbackPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const s = (location.state || {}) as State;
  const [rideId, setRideId] = useState<string | undefined>(s.rideId);
  const [fare, setFare] = useState<number | undefined>(s.fare);
  const [paymentStatus, setPaymentStatus] = useState<'pending'|'completed'|'cancelled'|'unknown'>('unknown');
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const key = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID as string | undefined;
  // Runtime fetch for key if missing at build time
  const [runtimeKey, setRuntimeKey] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (key) {
          setRuntimeKey(key);
          return;
        }
        const { getRazorpayKey } = await import('../services/razorpay');
        const k = await getRazorpayKey();
        if (mounted) setRuntimeKey(k);
      } catch {
        if (mounted) setRuntimeKey(null);
      }
    })();
    return () => { mounted = false; };
  }, [key]);
  
  // Debug: Log key status (only in development or when key is missing)
  useEffect(() => {
    if (!key) {
      console.warn('Razorpay key not found in environment variables (PaymentFeedback)', {
        hasEnv: !!(import.meta as any).env,
        envKeys: Object.keys((import.meta as any).env || {}),
        keyValue: key
      });
    } else {
      console.log('Razorpay key loaded successfully (PaymentFeedback)', { keyLength: key.length, keyPrefix: key.substring(0, 8) + '...' });
    }
  }, []);
  
  const [driverRating, setDriverRating] = useState<number>(0);
  const [platformFeedback, setPlatformFeedback] = useState<string>('');
  const [showThankYou, setShowThankYou] = useState<boolean>(false);
  const [userPhone, setUserPhone] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');

  const amountDue = useMemo(() => fare || 0, [fare]);

  useEffect(() => {
    (async () => {
      try {
        if (!rideId && s.rideId) setRideId(s.rideId);
        const id = s.rideId;
        if (!id) return;
        const res = await api.get(`/bookings/details/${id}`);
        const b = res.data?.booking;
        if (typeof b?.fare === 'number') setFare(b.fare);
        if (b?.payment_status) setPaymentStatus(b.payment_status);
      } catch {}
    })();
  }, [s.rideId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/users/profile');
        const u = res.data?.user;
        if (mounted) {
          setUserPhone(u?.phoneNumber || '');
          setUserEmail(u?.email || '');
        }
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  const loadScript = (src: string) => new Promise<boolean>((resolve) => {
    if (document.querySelector(`script[src='${src}']`)) return resolve(true);
    const s = document.createElement('script'); s.src = src; s.onload = () => resolve(true); s.onerror = () => resolve(false); document.body.appendChild(s);
  });

  const handlePayNow = async () => {
    console.log('[Razorpay-Feedback] ========== PAYMENT FLOW STARTED ==========');
    console.log('[Razorpay-Feedback] handlePayNow called', { rideId, amountDue, paymentId, orderId, keyPresent: !!key, keyLength: key?.length });
    
    if (!rideId) {
      console.error('[Razorpay-Feedback] ❌ No rideId provided');
      return;
    }
    
    try {
      let currentPaymentId = paymentId;
      let currentOrderId = orderId;
      
      // Step 1: Create order if needed
      if (!currentPaymentId) {
        console.log('[Razorpay-Feedback] Step 1: Creating payment order...', { rideId, amountDue });
        try {
          const or = await api.post('/payments/create-order', { bookingId: rideId, amount: amountDue });
          console.log('[Razorpay-Feedback] Order creation API response:', {
            status: or.status,
            data: or.data,
            success: or.data?.success,
            orderId: or.data?.orderId,
            paymentId: or.data?.paymentId
          });
          
          if (or.data?.success) {
            currentOrderId = or.data.orderId;
            currentPaymentId = or.data.paymentId;
            setOrderId(currentOrderId);
            setPaymentId(currentPaymentId);
            console.log('[Razorpay-Feedback] ✅ Order created successfully', { currentOrderId, currentPaymentId });
          } else {
            console.error('[Razorpay-Feedback] ❌ Order creation failed', { 
              rideId, 
              amountDue, 
              response: or.data,
              error: or.data?.message,
              status: or.status 
            });
            alert(or.data?.message || 'Failed to initiate online payment. Please try again or choose cash.');
            return;
          }
        } catch (orderErr: any) {
          console.error('[Razorpay-Feedback] ❌ Order creation exception', {
            error: orderErr,
            message: orderErr?.message,
            response: orderErr?.response?.data,
            status: orderErr?.response?.status
          });
          alert('Failed to create payment order. Please try again or choose cash.');
          return;
        }
      } else {
        console.log('[Razorpay-Feedback] Using existing order', { currentOrderId, currentPaymentId });
      }
      
      // Step 2: Validate order exists
      if (!currentOrderId) {
        console.error('[Razorpay-Feedback] ❌ Payment order missing', { rideId, currentPaymentId, currentOrderId });
        alert('Unable to initiate payment right now. Please try again in a moment or choose cash.');
        return;
      }

      const isSimulationOrder = currentOrderId.startsWith('sim_');
      console.log('[Razorpay-Feedback] Step 2: Order validation', { currentOrderId, isSimulationOrder });

      // Step 3: Check Razorpay key
      const effectiveKey = key || runtimeKey || '';
      if (!effectiveKey && !isSimulationOrder) {
        console.error('[Razorpay-Feedback] ❌ Razorpay key missing for live payment', { 
          rideId, 
          currentOrderId,
          keyPresent: !!effectiveKey,
          envKeys: Object.keys((import.meta as any).env || {}),
          importMetaEnv: (import.meta as any).env
        });
        alert('Online payment gateway is temporarily unavailable. Please pay cash or try again later.');
        return;
      }

      // Step 4: Load Razorpay SDK and initialize
      if (effectiveKey && !isSimulationOrder) {
        console.log('[Razorpay-Feedback] Step 3: Loading Razorpay SDK...', { keyPrefix: effectiveKey.substring(0, 8) + '...' });
        
        const scriptLoadStart = Date.now();
        const ok = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
        const scriptLoadTime = Date.now() - scriptLoadStart;
        
        console.log('[Razorpay-Feedback] SDK load result', { 
          success: ok, 
          loadTime: `${scriptLoadTime}ms`,
          windowRazorpay: !!(window as any).Razorpay 
        });
        
        if (!ok) {
          console.error('[Razorpay-Feedback] ❌ Failed to load Razorpay SDK script');
          alert('Unable to load payment gateway. Please try again or choose cash.');
          return;
        }
        
        if (!(window as any).Razorpay) {
          console.error('[Razorpay-Feedback] ❌ Razorpay SDK not available after script load', {
            windowKeys: Object.keys(window).filter(k => k.toLowerCase().includes('razor')),
            scriptLoaded: ok
          });
          alert('Unable to load Razorpay checkout. Please try again or choose cash.');
          return;
        }
        
        console.log('[Razorpay-Feedback] Step 4: Initializing Razorpay checkout...', {
          key: effectiveKey.substring(0, 8) + '...',
          amount: Math.round(Number(amountDue) * 100),
          currency: 'INR',
          orderId: currentOrderId
        });
        
        const rzp = new (window as any).Razorpay({
          key: effectiveKey,
          amount: Math.round(Number(amountDue) * 100),
          currency: 'INR', 
          name: 'LocalToto', 
          description: 'Ride payment', 
          order_id: currentOrderId,
          handler: async (resp: any) => {
            console.log('[Razorpay-Feedback] ========== PAYMENT HANDLER CALLED ==========');
            console.log('[Razorpay-Feedback] Payment response received', {
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature?.substring(0, 20) + '...',
              fullResponse: resp
            });
            
            try {
              console.log('[Razorpay-Feedback] Step 5: Verifying payment with backend...', {
                bookingId: rideId,
                paymentId: currentPaymentId,
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id
              });
              
              const verifyStart = Date.now();
              const vr = await api.post('/payments/verify-razorpay', {
                bookingId: rideId, 
                paymentId: currentPaymentId,
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature: resp.razorpay_signature
              });
              const verifyTime = Date.now() - verifyStart;
              
              console.log('[Razorpay-Feedback] Verification API response', {
                status: vr.status,
                data: vr.data,
                success: vr.data?.success,
                verifyTime: `${verifyTime}ms`,
                fullResponse: vr.data
              });
              
              if (vr.data?.success) {
                console.log('[Razorpay-Feedback] ✅ Payment verified successfully!');
                setPaymentStatus('completed');
                console.log('[Razorpay-Feedback] ========== PAYMENT FLOW COMPLETED ==========');
              } else {
                console.error('[Razorpay-Feedback] ❌ Payment verification failed', { 
                  rideId, 
                  response: vr.data, 
                  currentPaymentId, 
                  currentOrderId, 
                  razorpay: resp,
                  error: vr.data?.message
                });
                alert(vr.data?.message || 'Payment verification failed. Please contact support or pay cash.');
              }
            } catch (verifyErr: any) {
              console.error('[Razorpay-Feedback] ❌ Payment verification exception', {
                error: verifyErr,
                message: verifyErr?.message,
                response: verifyErr?.response?.data,
                status: verifyErr?.response?.status,
                stack: verifyErr?.stack
              });
              alert('Could not verify payment. Please try again or pay cash.');
            }
          },
          modal: {
            ondismiss: () => {
              console.log('[Razorpay-Feedback] ⚠️ User dismissed/cancelled payment modal');
            }
          },
          prefill: {
            contact: userPhone || undefined,
            email: userEmail || undefined
          }
        });
        
        console.log('[Razorpay-Feedback] Step 5: Opening Razorpay checkout modal...');
        rzp.on('payment.failed', (response: any) => {
          console.error('[Razorpay-Feedback] ❌ Payment failed event', {
            error: response.error,
            description: response.error?.description,
            code: response.error?.code,
            source: response.error?.source,
            step: response.error?.step,
            reason: response.error?.reason,
            metadata: response.error?.metadata,
            fullResponse: response
          });
        });
        
        rzp.on('payment.authorized', (response: any) => {
          console.log('[Razorpay-Feedback] ✅ Payment authorized event', response);
        });
        
        rzp.open();
        console.log('[Razorpay-Feedback] Razorpay checkout modal opened');
        
      } else if (currentPaymentId && isSimulationOrder) {
        console.log('[Razorpay-Feedback] Using simulation mode', { currentPaymentId, currentOrderId });
        const ver = await api.post('/payments/verify-payment', { bookingId: rideId, paymentId: currentPaymentId, success: true });
        console.log('[Razorpay-Feedback] Simulated payment verification response', ver.data);
        if (ver.data?.success) {
          console.log('[Razorpay-Feedback] ✅ Simulated payment completed');
          setPaymentStatus('completed');
        } else {
          console.error('[Razorpay-Feedback] ❌ Simulated payment verification failed', { rideId, response: ver.data, currentPaymentId });
        }
      } else {
        console.warn('[Razorpay-Feedback] ⚠️ Unhandled payment scenario', { 
          keyPresent: !!key, 
          currentOrderId, 
          isSimulationOrder,
          currentPaymentId 
        });
      }
    } catch (err: any) {
      console.error('[Razorpay-Feedback] ❌ Unexpected error during payment flow', {
        error: err,
        message: err?.message,
        stack: err?.stack,
        rideId,
        amountDue
      });
      alert('Something went wrong while processing payment. Please try again or choose cash.');
    }
  };

  const handleFinish = async () => {
    // Optionally send feedback; payment may be pending (cash) or completed
    try {
      if (rideId && driverRating > 0) {
        try { await api.post(`/bookings/rate-driver/${rideId}`, { rating: driverRating, comment: platformFeedback || undefined }); } catch {}
      }
    } catch {}
    // Show thank you message for 3 seconds then redirect
    setShowThankYou(true);
    setTimeout(() => {
      navigate('/');
    }, 3000);
  };

  if (showThankYou) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center p-4 pt-20">
        <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 border border-gray-100 text-center">
          <div className="text-6xl mb-4">🙏</div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-600">Your feedback helps us improve</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center p-4 pt-20">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 border border-gray-100">
        <h1 className="text-xl font-semibold text-gray-900 mb-4">Payment & Feedback</h1>

        <div className="mb-5 p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">Fare</div>
            <div className="text-lg font-bold text-green-700">₹{amountDue}</div>
          </div>
          {paymentStatus !== 'completed' ? (
            <div className="mt-3">
              <div className="text-sm text-gray-700 mb-2">Complete your payment to avoid cash hassle.</div>
              <button onClick={handlePayNow} className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700">Complete Payment</button>
              <div className="text-xs text-gray-500 mt-2">Or pay cash to the driver at destination.</div>
            </div>
          ) : (
            <div className="mt-3 text-green-700 text-sm font-semibold">Payment completed</div>
          )}
        </div>

        <div className="mb-5 p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-700 mb-2">Rate your driver</div>
          <div className="flex gap-2 mb-2">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={()=>setDriverRating(n)} className={`w-8 h-8 rounded-full ${driverRating>=n?'bg-yellow-400':'bg-gray-200'}`}></button>
            ))}
          </div>
          <div className="text-sm text-gray-700 mb-1">Feedback for platform (optional)</div>
          <textarea value={platformFeedback} onChange={e=>setPlatformFeedback(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 text-sm" rows={3} placeholder="Tell us what went well or could improve" />
        </div>

        <button onClick={handleFinish} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">Finish</button>
      </div>
    </div>
  );
};

export default PaymentFeedbackPage;




