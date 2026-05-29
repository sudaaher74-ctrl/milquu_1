import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { MessageCircle, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

const WhatsAppSettings = () => {
  const [statusData, setStatusData] = useState({ status: 'disconnected', qr: null });
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('https://milquu-backend.onrender.com/api/erp/whatsapp/status');
      setStatusData(data);
    } catch (error) {
      console.error('Error fetching WhatsApp status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Poll every 10 seconds while scanning
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-[1000px] mx-auto pb-10 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">WhatsApp Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Connect your WhatsApp to send automated order invoices.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
          <MessageCircle size={32} />
        </div>
        
        <h2 className="text-xl font-bold text-gray-800 mb-2">WhatsApp Bot Connection</h2>
        
        {loading ? (
          <p className="text-gray-500 my-8">Checking status...</p>
        ) : statusData.status === 'connected' ? (
          <div className="flex flex-col items-center">
            <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-full mb-6">
              <CheckCircle2 size={18} className="mr-2" />
              <span className="font-bold">Successfully Connected</span>
            </div>
            <p className="text-gray-600 text-center max-w-md">
              Your server is securely linked to WhatsApp. Automatic invoices will be sent to customers when they place new orders.
            </p>
          </div>
        ) : statusData.status === 'qr' && statusData.qr ? (
          <div className="flex flex-col items-center">
            <div className="flex items-center text-orange-600 bg-orange-50 px-4 py-2 rounded-full mb-4">
              <AlertCircle size={18} className="mr-2" />
              <span className="font-bold">Action Required: Scan QR Code</span>
            </div>
            <p className="text-gray-500 mb-6 text-center text-sm max-w-md">
              Open WhatsApp on your phone, go to <strong>Linked Devices</strong>, and scan the QR code below to connect.
            </p>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
              <img src={statusData.qr} alt="WhatsApp QR Code" className="w-64 h-64" />
            </div>
            <button onClick={fetchStatus} className="flex items-center text-milquu-blue hover:underline text-sm font-medium">
              <RefreshCw size={14} className="mr-2" /> Refresh QR Code
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <p className="text-gray-600 mb-4">
              The WhatsApp client is currently starting up or disconnected. Please wait a moment.
            </p>
            <button onClick={fetchStatus} className="bg-milquu-dark text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-md flex items-center">
              <RefreshCw size={16} className="mr-2" /> Check Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppSettings;
