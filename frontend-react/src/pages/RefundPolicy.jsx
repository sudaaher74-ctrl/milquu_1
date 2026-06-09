import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Clock, CreditCard, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const RefundPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Link to="/" className="inline-flex items-center text-gray-500 hover:text-milquu-blue transition mb-8 group">
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-milquu-blue p-8 md:p-12 text-white text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">Refund & Cancellation Policy</h1>
            <p className="text-blue-100 max-w-2xl mx-auto text-lg">
              Transparent, secure, and hassle-free wallet management for your peace of mind.
            </p>
          </div>

          <div className="p-8 md:p-12 space-y-10 text-gray-700 leading-relaxed">
            
            {/* Intro Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="bg-blue-50 p-6 rounded-2xl flex items-start gap-4 border border-blue-100">
                <ShieldCheck className="w-8 h-8 text-blue-600 shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">100% Secure</h3>
                  <p className="text-sm text-gray-600">Your funds are securely held in your MilQuu wallet and can be withdrawn at any time.</p>
                </div>
              </div>
              <div className="bg-green-50 p-6 rounded-2xl flex items-start gap-4 border border-green-100">
                <Clock className="w-8 h-8 text-green-600 shrink-0" />
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Fast Processing</h3>
                  <p className="text-sm text-gray-600">Withdrawal requests are reviewed within 24 hours and credited in 3-5 business days.</p>
                </div>
              </div>
            </div>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-milquu-blue" />
                Wallet Balance & Withdrawals
              </h2>
              <p className="mb-4">
                MilQuu operates on a prepaid wallet model to ensure seamless daily deliveries. You can add money to your wallet using Razorpay (UPI, Credit/Debit Cards, Net Banking). 
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li><strong className="text-gray-800">Withdrawable Balance:</strong> You can withdraw your unused wallet balance at any time.</li>
                <li><strong className="text-gray-800">Reserved Amount:</strong> A small portion of your balance is reserved to cover your active subscriptions and any pending orders that are already dispatched or scheduled for tomorrow morning. This reserved amount cannot be withdrawn instantly.</li>
                <li><strong className="text-gray-800">No Minimum Limit:</strong> There is no minimum withdrawal limit for your eligible balance.</li>
              </ul>
            </section>

            <div className="w-full h-px bg-gray-100"></div>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif">Refund Process</h2>
              <p className="mb-4 text-gray-600">When you request a withdrawal from your "My Account" dashboard:</p>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <ol className="list-decimal pl-5 space-y-4">
                  <li>
                    <strong className="text-gray-800">Request Submission:</strong> You select the amount and provide your preferred UPI ID or Bank Account details.
                  </li>
                  <li>
                    <strong className="text-gray-800">Admin Review:</strong> Our team reviews the request within 24 hours to ensure no deliveries are currently in transit.
                  </li>
                  <li>
                    <strong className="text-gray-800">Processing:</strong> Once approved, the funds are initiated via Razorpay Payouts.
                  </li>
                  <li>
                    <strong className="text-gray-800">Crediting:</strong> The amount reflects in your selected bank account or UPI within 3 to 5 business days, depending on your bank.
                  </li>
                </ol>
              </div>
            </section>

            <div className="w-full h-px bg-gray-100"></div>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 font-serif flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-orange-500" />
                Cancellation & Non-Refundable Items
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>Products that have already been delivered to your doorstep are <strong className="text-gray-800">non-refundable</strong> due to their perishable nature.</li>
                <li>If you wish to cancel tomorrow's delivery, please pause your subscription or cancel the order before 10:00 PM tonight. Deliveries cancelled after the cut-off time will be charged normally.</li>
                <li>If you receive a damaged or spoiled product, please contact support within 2 hours of delivery with a photo, and we will credit the full amount back to your MilQuu wallet.</li>
              </ul>
            </section>

            <div className="bg-blue-50 p-8 rounded-2xl text-center mt-12 border border-blue-100">
              <h3 className="text-xl font-bold text-gray-900 mb-2 font-serif">Still have questions?</h3>
              <p className="text-gray-600 mb-6">Our support team is here to help you with your wallet and refunds.</p>
              <Link 
                to="/contact" 
                className="inline-block bg-milquu-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md"
              >
                Contact Support
              </Link>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RefundPolicy;
