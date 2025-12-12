import React, { useState, useEffect } from 'react';

export default function Billing() {
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);

  // 1. Script Load karne ka effect (Ye page load hote hi chalega)
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      setIsRazorpayLoaded(true);
    };
    script.onerror = () => {
      alert('Razorpay SDK failed to load. Check your internet connection.');
    };
    document.body.appendChild(script);

    // Cleanup function
    return () => {
      if(document.body.contains(script)) {
        document.body.removeChild(script);
      }
    }
  }, []);

  // 2. Payment Handle Karna
  const handlePayment = () => {
    if (!isRazorpayLoaded) {
      alert("Razorpay SDK is loading... please wait a second.");
      return;
    }

    const options = {
      key: "rzp_test_YOUR_KEY_ID_HERE", // 🔴 APNI KEY ID YAHAN PASTE KAREIN
      amount: "100", // 100 paise = ₹1
      currency: "INR",
      name: "AdGenius Pro",
      description: "Test Transaction",
      image: "https://cdn.shopify.com/s/files/1/0000/0000/files/logo.png",
      
      handler: function (response) {
        alert(`Payment Successful!\nPayment ID: ${response.razorpay_payment_id}`);
        // Yahan backend API call karein
      },
      
      prefill: {
        name: "Test User",
        email: "test@example.com",
        contact: "9999999999",
      },
      
      theme: {
        color: "#2563EB",
      },
    };

    // Window object se Razorpay uthayenge (Direct Script se)
    const paymentObject = new window.Razorpay(options);
    
    paymentObject.on('payment.failed', function (response){
        alert(`Payment Failed: ${response.error.description}`);
    });

    paymentObject.open();
  };

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Billing & Subscriptions</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Free Plan */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 opacity-60">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Free Plan</h2>
          <p className="text-4xl font-bold text-gray-900 mb-6">₹0</p>
          <ul className="space-y-4 text-gray-500 mb-8 text-sm">
            <li className="flex items-center">✓ 5 Ad Generations</li>
            <li className="flex items-center">✓ Basic Formats</li>
          </ul>
          <button disabled className="w-full py-3 px-4 bg-gray-100 text-gray-500 rounded-xl font-medium cursor-not-allowed">
            Current Plan
          </button>
        </div>

        {/* Pro Plan (Test Mode) */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-blue-600 relative transform scale-105 z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-3 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide">
            Test Mode
          </div>
          
          <h2 className="text-xl font-semibold text-blue-600 mb-2">Pro Plan</h2>
          <div className="flex items-baseline gap-1 mb-6">
            <p className="text-5xl font-extrabold text-gray-900">₹1</p>
            <span className="text-gray-500">/ test</span>
          </div>

          <ul className="space-y-4 text-gray-600 mb-8 text-sm font-medium">
            <li className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">✓</div>
              Unlimited Ads
            </li>
            <li className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">✓</div>
              UPI Payment Support
            </li>
          </ul>

          <button 
            onClick={handlePayment}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95"
          >
            Pay ₹1 via UPI
          </button>
        </div>

        {/* Enterprise Plan */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Enterprise</h2>
          <p className="text-4xl font-bold text-gray-900 mb-6">Custom</p>
          <button className="w-full py-3 px-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-black transition-colors">
            Contact Sales
          </button>
        </div>

      </div>
    </div>
  );
}