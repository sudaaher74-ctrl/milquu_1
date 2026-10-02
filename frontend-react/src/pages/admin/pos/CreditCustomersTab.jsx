import { AlertCircle, Banknote, BookOpen, Calendar, Clock, Download, Edit3, FileText, Filter, MessageCircle, Phone, Plus, Search, Trash2, User, UserPlus } from 'lucide-react';

// Extracted from POS.jsx. Receives the page state and
// handlers it uses as props of the same name.
const CreditCustomersTab = ({ 
  activeTab, 
  creditCycleFilter, 
  creditSearch, 
  creditSort, 
  creditSummary, 
  filteredCreditCustomers, 
  handleOpenEditCycle, 
  handleOpenEditCustomer,
  handleDeleteCustomer,
  handleOpenInvoiceModal,
  handleOpenSettleModal, 
  handleSendWhatsAppReminder, 
  handleStartBillForCustomer, 
  setCreditCycleFilter, 
  setCreditSearch, 
  setCreditSort, 
  setSelectedCreditCustomerForLedger, 
  setShowAddCustomerModal, 
  setShowLedgerModal,
  handleOpenCustomerDetail
}) => (
  <>
    {/* ============================================================ */}
    {/* TAB 2: CREDIT CUSTOMERS (KHATA / UDHAR) VIEW                 */}
    {/* ============================================================ */}
    {activeTab === 'credit' && (
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Top KPI Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border-b border-gray-100 bg-gray-50/60 shrink-0">
          {/* Card 1: Total Outstanding */}
          <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Credit Outstanding</p>
              <h3 className="text-2xl font-bold text-amber-700 mt-1">₹{creditSummary.totalCreditOutstanding?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">{creditSummary.customersWithDuesCount || 0} customers with active dues</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Banknote size={24} />
            </div>
          </div>

          {/* Card 2: Registered Credit Accounts */}
          <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Credit Customers</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{creditSummary.totalCreditCustomers || 0} Accounts</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Fixed dairy customer ledger</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-milquu-blue flex items-center justify-center">
              <User size={24} />
            </div>
          </div>

          {/* Card 3: Overdue Accounts */}
          <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Overdue Accounts</p>
              <h3 className={`text-2xl font-bold mt-1 ${creditSummary.overdueCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {creditSummary.overdueCount || 0} Accounts
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">{creditSummary.dueSoonCount || 0} accounts due within 3 days</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${creditSummary.overdueCount > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              <AlertCircle size={24} />
            </div>
          </div>

          {/* Card 4: Billing Cycles Breakdown */}
          <div className="p-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-center">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Billing Cycles Breakdown</p>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-200">
                10 Days: {creditSummary.cycleBreakdown?.['10 Days'] || 0}
              </span>
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200">
                15 Days: {creditSummary.cycleBreakdown?.['15 Days'] || 0}
              </span>
              <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-lg border border-purple-200">
                30 Days: {creditSummary.cycleBreakdown?.['30 Days'] || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3 bg-white shrink-0">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer name or phone..."
              value={creditSearch}
              onChange={(e) => setCreditSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 shadow-xs"
            />
          </div>

          {/* Cycle Filters */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <span className="text-xs text-gray-400 mr-1 flex items-center gap-1">
              <Filter size={13} /> Filter:
            </span>
            {[
              { id: 'ALL', label: 'All Cycles' },
              { id: '10 Days', label: '10 Days' },
              { id: '15 Days', label: '15 Days' },
              { id: '30 Days', label: '30 Days' },
              { id: 'OVERDUE', label: 'Overdue Only' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setCreditCycleFilter(item.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  creditCycleFilter === item.id
                    ? item.id === 'OVERDUE'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-amber-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Sort Selector */}
            <select
              value={creditSort}
              onChange={(e) => setCreditSort(e.target.value)}
              className="ml-2 px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-amber-500 text-gray-700"
            >
              <option value="dues_desc">Highest Dues First</option>
              <option value="due_date_asc">Soonest Due Date</option>
              <option value="name_asc">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Customer Cards & Ledger Table */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
          {filteredCreditCustomers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredCreditCustomers.map(customer => {
                const hasDues = customer.totalDue > 0;
                const isOverdue = customer.status === 'Overdue';
                const isDueSoon = customer.status === 'Due Soon';

                return (
                  <div 
                    key={customer.customerId}
                    onClick={() => handleOpenCustomerDetail && handleOpenCustomerDetail(customer)}
                    className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group hover:border-amber-400"
                  >
                    {/* Top Info */}
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-milquu-blue/10 text-milquu-blue group-hover:bg-amber-100 group-hover:text-amber-800 flex items-center justify-center font-bold font-serif text-base shrink-0 transition-colors">
                            {customer.name?.charAt(0)?.toUpperCase() || 'C'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-gray-900 text-sm group-hover:text-amber-800 transition-colors">{customer.name}</h4>
                              {handleOpenEditCustomer && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditCustomer(customer);
                                  }}
                                  className="p-1 text-gray-400 hover:text-milquu-blue hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                                  title="Edit Customer Details"
                                >
                                  <Edit3 size={12} />
                                </button>
                              )}
                              {handleDeleteCustomer && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteCustomer(customer);
                                  }}
                                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                                  title="Delete Customer"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                            {customer.phone ? (
                              <p className="text-xs text-gray-500 font-mono flex items-center gap-1 mt-0.5">
                                <Phone size={11} className="text-gray-400" /> {customer.phone}
                              </p>
                            ) : (
                              <p className="text-[11px] text-gray-400 italic mt-0.5">No phone recorded</p>
                            )}
                          </div>
                        </div>

                        {/* Billing Cycle Badge */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (handleOpenEditCustomer) handleOpenEditCustomer(customer);
                            else handleOpenEditCycle(customer);
                          }}
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors flex items-center gap-1 cursor-pointer bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                          title="Click to edit customer & billing system"
                        >
                          <Clock size={11} />
                          <span>{customer.billingCycle || '15 Days'}</span>
                          <Edit3 size={10} className="opacity-60" />
                        </button>
                      </div>

                      {/* Financial Metrics */}
                      <div className="p-3 bg-gray-50 group-hover:bg-amber-50/40 rounded-xl border border-gray-100 group-hover:border-amber-100 my-3 flex justify-between items-center transition-colors">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Outstanding Balance</span>
                          <span className={`text-xl font-bold font-mono ${hasDues ? 'text-amber-700' : 'text-green-600'}`}>
                            ₹{customer.totalDue?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Unpaid Bills</span>
                          <span className="text-sm font-bold text-gray-700">
                            {customer.unpaidCount || 0} Bills
                          </span>
                        </div>
                      </div>

                      {/* Status & Due Date */}
                      <div className="flex justify-between items-center text-xs mb-3">
                        <span className="text-gray-500 flex items-center gap-1">
                          <Calendar size={13} className="text-gray-400" />
                          Next Due:
                        </span>
                        <span className="font-semibold text-gray-800 font-mono">
                          {customer.nextDueDate ? new Date(customer.nextDueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No dues pending'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs text-gray-500">Account Status:</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isOverdue
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : isDueSoon
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : hasDues
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-green-100 text-green-700 border border-green-200'
                        }`}>
                          {customer.status}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons Bar */}
                    <div className="pt-3 border-t border-gray-100 flex flex-wrap gap-1.5">
                      {/* Customer Details & Calendar Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (handleOpenCustomerDetail) handleOpenCustomerDetail(customer);
                        }}
                        className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Open customer profile, milk calendar and create bill"
                      >
                        <Calendar size={13} className="text-amber-600" />
                        <span>Calendar</span>
                      </button>

                      {/* New Bill Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartBillForCustomer(customer);
                        }}
                        className="flex-1 py-1.5 px-2 bg-milquu-blue text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 hover:bg-blue-800 transition-colors cursor-pointer"
                        title="Open POS Terminal with this customer selected"
                      >
                        <Plus size={13} />
                        <span>Bill Now</span>
                      </button>

                      {/* View Ledger / Bills */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCreditCustomerForLedger(customer);
                          setShowLedgerModal(true);
                        }}
                        className="py-1.5 px-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="View all unpaid bills and items"
                      >
                        <FileText size={13} />
                        <span>Ledger</span>
                      </button>

                      {/* Download Milk Bill / Invoice */}
                      {handleOpenInvoiceModal && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenInvoiceModal(customer);
                          }}
                          className="py-1.5 px-2.5 bg-blue-50 hover:bg-blue-100 text-milquu-blue border border-blue-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          title="Generate, Print or Download Milk Invoice Bill (PDF)"
                        >
                          <Download size={13} />
                          <span>Invoice</span>
                        </button>
                      )}

                      {/* Settle / Collect Payment */}
                      {hasDues && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenSettleModal(customer);
                          }}
                          className="py-1.5 px-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          title="Collect cash, UPI or card payment against Khata"
                        >
                          <Banknote size={13} />
                          <span>Settle</span>
                        </button>
                      )}

                      {/* WhatsApp Reminder */}
                      {hasDues && customer.phone && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendWhatsAppReminder(customer);
                          }}
                          className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          title="Send WhatsApp payment reminder"
                        >
                          <MessageCircle size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-16 text-gray-400">
              <BookOpen size={48} className="mb-3 opacity-20" />
              <p className="font-semibold text-gray-600">No credit customer records match your filter</p>
              <p className="text-xs text-gray-400 mt-1">Add regular customers with a 10, 15, or 30 days billing system to see them here.</p>
              <button
                onClick={() => setShowAddCustomerModal(true)}
                className="mt-4 px-4 py-2 bg-milquu-blue text-white rounded-xl text-xs font-bold shadow-xs hover:bg-blue-800"
              >
                <UserPlus size={14} className="inline mr-1" /> Add Credit Customer
              </button>
            </div>
          )}
        </div>

      </div>
    )}
  </>
);

export default CreditCustomersTab;
