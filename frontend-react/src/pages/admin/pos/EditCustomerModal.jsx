import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Clock, CreditCard, FileText, Trash2, Check, AlertTriangle } from 'lucide-react';

const EditCustomerModal = ({
  showEditModal,
  setShowEditModal,
  customer,
  handleSaveCustomerEdit,
  handleDeleteCustomer,
  isSaving
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    billingCycle: '15 Days',
    creditLimit: '',
    creditNotes: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        address: customer.address || '',
        billingCycle: customer.billingCycle || '15 Days',
        creditLimit: customer.creditLimit !== undefined ? customer.creditLimit : '',
        creditNotes: customer.creditNotes || ''
      });
      setShowDeleteConfirm(false);
    }
  }, [customer]);

  if (!showEditModal || !customer) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Customer name is required');
      return;
    }
    handleSaveCustomerEdit({
      ...formData,
      id: customer.customerId || customer.userId || customer._id
    });
  };

  const onConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await handleDeleteCustomer(customer);
      setShowEditModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-milquu-blue/10 text-milquu-blue flex items-center justify-center">
              <User size={18} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Edit Customer Details</h3>
              <p className="text-[11px] text-gray-400">Update account info, billing cycle & delivery notes</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setShowEditModal(false)}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Delete Confirmation Banner */}
        {showDeleteConfirm && (
          <div className="p-4 bg-red-50 border-b border-red-200 flex flex-col gap-2">
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-red-900">Are you sure you want to delete this customer?</p>
                <p className="text-[11px] text-red-700 mt-0.5">
                  {customer.totalDue > 0
                    ? `Warning: This customer has ₹${customer.totalDue?.toFixed(2)} in outstanding dues. Deleting will remove this customer from Khata.`
                    : 'This action will permanently delete this customer account from the system.'}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirmDelete}
                disabled={isDeleting}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Customer'}
              </button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          
          {/* Customer / Location Name */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Customer / Delivery Point Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Lakhani Centrium 7th floor / John Doe"
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-milquu-blue font-semibold text-gray-800"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Phone / WhatsApp Number
            </label>
            <div className="relative">
              <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) })}
                placeholder="10-digit mobile number"
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-milquu-blue font-mono text-gray-800"
              />
            </div>
          </div>

          {/* Delivery Address / Flat details */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Address / Flat / Wing / Floor Notes
            </label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3 top-2.5 text-gray-400" />
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. Floor 7, Flat 702, Lakhani Centrium, Panvel"
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-milquu-blue text-gray-800"
              />
            </div>
          </div>

          {/* Billing Cycle & Credit Limit Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Billing Cycle
              </label>
              <div className="relative">
                <Clock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  value={formData.billingCycle}
                  onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-milquu-blue font-bold text-gray-800 bg-white cursor-pointer"
                >
                  <option value="10 Days">10 Days Cycle</option>
                  <option value="15 Days">15 Days Cycle</option>
                  <option value="30 Days">30 Days (Monthly)</option>
                  <option value="Custom">Custom Days</option>
                  <option value="none">No Credit (Cash Only)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Credit Limit (₹)
              </label>
              <div className="relative">
                <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                  placeholder="Optional limit (₹)"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-milquu-blue font-mono text-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Internal Notes / Instructions
            </label>
            <div className="relative">
              <FileText size={15} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={formData.creditNotes}
                onChange={(e) => setFormData({ ...formData, creditNotes: e.target.value })}
                placeholder="e.g. Leave milk bag on outside hook"
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-milquu-blue text-gray-800"
              />
            </div>
          </div>

          {/* Current Outstanding Info */}
          {customer.totalDue > 0 && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs flex justify-between items-center">
              <span className="text-amber-800 font-semibold">Active Outstanding Balance:</span>
              <span className="font-mono font-bold text-amber-900 text-sm">
                ₹{customer.totalDue?.toFixed(2)} ({customer.unpaidCount || 0} unpaid bills)
              </span>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 size={14} /> Delete Customer
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-milquu-blue hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check size={14} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};

export default EditCustomerModal;
