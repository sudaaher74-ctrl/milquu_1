import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageCircle, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

const WhatsAppSettings = () => {
  const [statusData, setStatusData] = useState({ status: 'disconnected', messagesSent: 0 });
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
  }, []);

  return (
    <div className="max-w-[1000px] mx-auto pb-10 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">WhatsApp Meta API</h1>
        <p className="text-gray-500 text-sm mt-1">Connect your official WhatsApp Business API to send automated invoices.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-6">
          <MessageCircle size={32} />
        </div>
        
        <h2 className="text-xl font-bold text-gray-800 mb-2">Meta API Connection</h2>
        
        {loading ? (
          <p className="text-gray-500 my-8">Checking status...</p>
        ) : statusData.status === 'connected' ? (
          <div className="flex flex-col items-center">
            <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-full mb-6">
              <CheckCircle2 size={18} className="mr-2" />
              <span className="font-bold">API Configured Successfully</span>
            </div>
            <p className="text-gray-600 text-center max-w-md mb-6">
              Your server is securely linked to the Official Meta WhatsApp API. Automatic invoices will be sent to customers when they place new orders.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 w-full text-center">
              <p className="text-sm text-gray-500 mb-1">Total Invoices Sent</p>
              <p className="text-2xl font-bold text-milquu-dark">{statusData.messagesSent}</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex items-center text-orange-600 bg-orange-50 px-4 py-2 rounded-full mb-4">
              <AlertCircle size={18} className="mr-2" />
              <span className="font-bold">Action Required: Missing API Keys</span>
            </div>
            <p className="text-gray-500 mb-6 text-center text-sm max-w-md">
              The Meta WhatsApp API is not configured. Please add your <strong>WHATSAPP_ACCESS_TOKEN</strong> and <strong>WHATSAPP_PHONE_ID</strong> to your backend environment variables to activate automated invoices.
            </p>
            <button onClick={fetchStatus} className="bg-milquu-dark text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-md flex items-center">
              <RefreshCw size={16} className="mr-2" /> Refresh Status
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppSettings;
