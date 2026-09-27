import Purchase from '../models/Purchase.js';
import VendorPayment from '../models/VendorPayment.js';
import Expense from '../models/Expense.js';
import Procurement from '../models/Procurement.js';
import Wastage from '../models/Wastage.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';

// --- PURCHASES ---
export const getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({}).sort({ createdAt: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createPurchase = async (req, res) => {
  try {
    const { sellingPrice, ...purchaseData } = req.body;
    
    const quantity = Number(purchaseData.quantity) || 0;
    const rate = Number(purchaseData.rate) || 0;
    const totalCost = quantity * rate;
    
    let paidAmount = Number(purchaseData.paidAmount) || 0;
    if (purchaseData.status === 'Paid' && paidAmount === 0) {
      paidAmount = totalCost;
    }
    const balanceAmount = Math.max(0, totalCost - paidAmount);
    let status = purchaseData.status || (balanceAmount === 0 ? 'Paid' : (paidAmount > 0 ? 'Partial' : 'Pending'));

    const payments = Array.isArray(purchaseData.payments) ? [...purchaseData.payments] : [];
    if (paidAmount > 0 && payments.length === 0) {
      payments.push({
        amount: paidAmount,
        date: purchaseData.date || new Date(),
        paymentMode: purchaseData.paymentMode || 'Cash',
        reference: purchaseData.reference || 'Initial Payment',
        notes: purchaseData.notes || ''
      });
    }

    const poNumber = purchaseData.poNumber || `PO-${Date.now().toString().slice(-6)}`;

    const purchase = new Purchase({
      ...purchaseData,
      poNumber,
      quantity,
      rate,
      totalCost,
      paidAmount,
      balanceAmount,
      status,
      payments
    });

    const createdPurchase = await purchase.save();

    // Record VendorPayment entry if initial payment was made
    if (paidAmount > 0) {
      try {
        await VendorPayment.create({
          paymentId: `VP-${Date.now().toString().slice(-6)}`,
          supplierName: purchaseData.supplierName,
          supplierPhone: purchaseData.supplierPhone || '',
          purchaseId: createdPurchase._id,
          poNumber: createdPurchase.poNumber,
          amount: paidAmount,
          paymentMode: purchaseData.paymentMode || 'Cash',
          reference: purchaseData.reference || 'On Purchase',
          date: purchaseData.date || new Date(),
          notes: `Payment for ${createdPurchase.poNumber}`
        });
      } catch (err) {
        console.error('Failed to record initial vendor payment:', err);
      }
    }

    const product = await Product.findOne({ name: purchaseData.productName });
    if (product) {
      product.purchasePrice = rate;
      
      if (sellingPrice !== undefined && sellingPrice !== '') {
        const sp = Number(sellingPrice);
        product.price = sp;
        if (rate > 0) {
          product.marginPercentage = ((sp - rate) / rate) * 100;
        } else {
          product.marginPercentage = 100;
        }
      }
      
      product.stock += quantity;
      product.currentStockQty += quantity;
      
      product.stockBatches.push({
        qty: quantity,
        costPerUnit: rate,
        date: purchaseData.date || Date.now(),
        purchaseId: createdPurchase._id
      });

      recalcStockTotals(product);
      await product.save();
    }

    res.status(201).json(createdPurchase);
  } catch (error) {
    res.status(400).json({ message: 'Invalid purchase data', error: error.message });
  }
};

/** Recompute a product's stock totals from its stockBatches after they change. */
const recalcStockTotals = (product) => {
  let qty = 0;
  let value = 0;
  product.stockBatches.forEach((b) => {
    qty += b.qty;
    value += b.qty * b.costPerUnit;
  });
  product.stock = qty;
  product.currentStockQty = qty;
  product.stockValue = value;
  product.currentStockValue = value;
};

export const updatePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    const { sellingPrice, ...purchaseData } = req.body;
    const quantity = Number(purchaseData.quantity) || 0;
    const rate = Number(purchaseData.rate) || 0;
    const totalCost = quantity * rate;
    const oldProductName = purchase.productName;
    const newProductName = purchaseData.productName ?? oldProductName;

    // Move the linked stock batch off the old product if this purchase now
    // points at a different one, then apply the new batch to the current product.
    if (oldProductName !== newProductName) {
      const oldProduct = await Product.findOne({ name: oldProductName });
      if (oldProduct) {
        oldProduct.stockBatches = oldProduct.stockBatches.filter(
          (b) => String(b.purchaseId) !== String(purchase._id)
        );
        recalcStockTotals(oldProduct);
        await oldProduct.save();
      }
    }

    const product = await Product.findOne({ name: newProductName });
    if (product) {
      const batch = product.stockBatches.find((b) => String(b.purchaseId) === String(purchase._id));
      if (batch) {
        batch.qty = quantity;
        batch.costPerUnit = rate;
        batch.date = purchaseData.date || batch.date;
      } else {
        product.stockBatches.push({
          qty: quantity,
          costPerUnit: rate,
          date: purchaseData.date || Date.now(),
          purchaseId: purchase._id
        });
      }
      recalcStockTotals(product);
      product.purchasePrice = rate;
      if (sellingPrice !== undefined && sellingPrice !== '') {
        const sp = Number(sellingPrice);
        product.price = sp;
        product.marginPercentage = rate > 0 ? ((sp - rate) / rate) * 100 : 100;
      }
      await product.save();
    }

    let paidAmount = purchaseData.paidAmount !== undefined ? Number(purchaseData.paidAmount) : (purchase.paidAmount || 0);
    if (purchaseData.status === 'Paid') {
      paidAmount = totalCost;
    }
    const balanceAmount = Math.max(0, totalCost - paidAmount);
    let status = purchaseData.status || (balanceAmount === 0 ? 'Paid' : (paidAmount > 0 ? 'Partial' : 'Pending'));

    Object.assign(purchase, purchaseData, { quantity, rate, totalCost, paidAmount, balanceAmount, status });
    const updatedPurchase = await purchase.save();

    res.json(updatedPurchase);
  } catch (error) {
    res.status(400).json({ message: 'Invalid purchase data', error: error.message });
  }
};

export const deletePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    const product = await Product.findOne({ name: purchase.productName });
    if (product) {
      product.stockBatches = product.stockBatches.filter(
        (b) => String(b.purchaseId) !== String(purchase._id)
      );
      recalcStockTotals(product);
      await product.save();
    }

    // Delete or unlink vendor payments tied specifically to this purchase
    await VendorPayment.deleteMany({ purchaseId: purchase._id });

    await purchase.deleteOne();

    res.json({ message: 'Purchase deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// --- VENDOR ACCOUNTING & LEDGER (KHATA) ---
export const recordVendorPayment = async (req, res) => {
  try {
    const { supplierName, supplierPhone = '', purchaseId, amount, paymentMode = 'Cash', reference = '', date = new Date(), notes = '' } = req.body;
    
    if (!supplierName || !supplierName.trim()) {
      return res.status(400).json({ message: 'Supplier/Vendor name is required' });
    }
    const payAmount = Number(amount);
    if (!payAmount || payAmount <= 0) {
      return res.status(400).json({ message: 'Payment amount must be greater than 0' });
    }

    const paymentId = `VP-${Date.now().toString().slice(-6)}`;
    let linkedPoNumber = '';

    // If a specific purchase order is specified
    if (purchaseId) {
      const purchase = await Purchase.findById(purchaseId);
      if (purchase) {
        linkedPoNumber = purchase.poNumber;
        purchase.paidAmount = (purchase.paidAmount || 0) + payAmount;
        purchase.balanceAmount = Math.max(0, (purchase.totalCost || 0) - purchase.paidAmount);
        purchase.status = purchase.balanceAmount === 0 ? 'Paid' : 'Partial';
        purchase.payments.push({
          amount: payAmount,
          date,
          paymentMode,
          reference,
          notes
        });
        await purchase.save();
      }
    } else {
      // Allocate payment to unpaid purchases of this supplier from oldest to newest
      let remaining = payAmount;
      const unpaidPurchases = await Purchase.find({
        supplierName: { $regex: new RegExp(`^${supplierName.trim()}$`, 'i') },
        status: { $in: ['Pending', 'Partial', 'Received'] }
      }).sort({ date: 1 });

      for (const pur of unpaidPurchases) {
        if (remaining <= 0) break;
        const curDue = pur.balanceAmount || Math.max(0, pur.totalCost - (pur.paidAmount || 0));
        if (curDue > 0) {
          const allocate = Math.min(remaining, curDue);
          pur.paidAmount = (pur.paidAmount || 0) + allocate;
          pur.balanceAmount = Math.max(0, pur.totalCost - pur.paidAmount);
          pur.status = pur.balanceAmount === 0 ? 'Paid' : 'Partial';
          pur.payments.push({
            amount: allocate,
            date,
            paymentMode,
            reference,
            notes
          });
          await pur.save();
          remaining -= allocate;
          if (!linkedPoNumber) linkedPoNumber = pur.poNumber;
        }
      }
    }

    const vendorPayment = new VendorPayment({
      paymentId,
      supplierName: supplierName.trim(),
      supplierPhone: supplierPhone || '',
      purchaseId: purchaseId || undefined,
      poNumber: linkedPoNumber,
      amount: payAmount,
      paymentMode,
      reference,
      date,
      notes
    });
    await vendorPayment.save();

    res.status(201).json({
      message: `Payment of ₹${payAmount} to ${supplierName} recorded successfully`,
      payment: vendorPayment
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to record vendor payment', error: error.message });
  }
};

export const getVendorsSummary = async (req, res) => {
  try {
    const purchases = await Purchase.find({}).sort({ date: -1 });
    const vendorPayments = await VendorPayment.find({}).sort({ date: -1 });

    const vendorMap = new Map();

    // Process purchases
    purchases.forEach((p) => {
      const sName = (p.supplierName || 'Unknown Vendor').trim();
      const key = sName.toLowerCase();

      if (!vendorMap.has(key)) {
        vendorMap.set(key, {
          supplierName: sName,
          supplierPhone: p.supplierPhone || '',
          supplierAddress: p.supplierAddress || '',
          supplierGst: p.supplierGst || '',
          totalPurchasesCount: 0,
          totalBilled: 0,
          totalPaidFromPurchases: 0,
          products: {},
          lastPurchaseDate: null
        });
      }

      const v = vendorMap.get(key);
      if (!v.supplierPhone && p.supplierPhone) v.supplierPhone = p.supplierPhone;
      if (!v.supplierAddress && p.supplierAddress) v.supplierAddress = p.supplierAddress;
      if (!v.supplierGst && p.supplierGst) v.supplierGst = p.supplierGst;

      v.totalPurchasesCount += 1;
      v.totalBilled += p.totalCost || 0;
      v.totalPaidFromPurchases += p.paidAmount || (p.status === 'Paid' ? p.totalCost : 0);

      // Track product breakdown
      const prodName = p.productName || 'Unspecified Product';
      if (!v.products[prodName]) {
        v.products[prodName] = {
          name: prodName,
          category: p.category || 'General',
          totalQty: 0,
          unit: p.unit || 'Litre',
          totalCost: 0
        };
      }
      v.products[prodName].totalQty += p.quantity || 0;
      v.products[prodName].totalCost += p.totalCost || 0;

      const pDate = new Date(p.date || p.createdAt);
      if (!v.lastPurchaseDate || pDate > new Date(v.lastPurchaseDate)) {
        v.lastPurchaseDate = pDate;
      }
    });

    // Process extra vendor payments
    const paymentsByVendor = new Map();
    vendorPayments.forEach((vp) => {
      const key = (vp.supplierName || '').trim().toLowerCase();
      paymentsByVendor.set(key, (paymentsByVendor.get(key) || 0) + vp.amount);
    });

    const vendors = Array.from(vendorMap.values()).map((v) => {
      const key = v.supplierName.toLowerCase();
      const standalonePaid = paymentsByVendor.get(key) || 0;
      const totalPaid = Math.max(v.totalPaidFromPurchases, standalonePaid);
      const balanceDue = Math.max(0, v.totalBilled - totalPaid);

      return {
        ...v,
        totalPaid,
        balanceDue,
        status: balanceDue <= 0 ? 'Settled' : 'Pending Dues',
        productsList: Object.values(v.products)
      };
    });

    // Summary metrics across all vendors
    const summary = {
      totalVendors: vendors.length,
      totalBilledAll: vendors.reduce((acc, v) => acc + v.totalBilled, 0),
      totalPaidAll: vendors.reduce((acc, v) => acc + v.totalPaid, 0),
      totalOutstandingAll: vendors.reduce((acc, v) => acc + v.balanceDue, 0),
      vendorsWithDues: vendors.filter(v => v.balanceDue > 0).length
    };

    res.json({ vendors, summary });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load vendors summary', error: error.message });
  }
};

export const getVendorLedger = async (req, res) => {
  try {
    const rawSupplier = decodeURIComponent(req.params.supplierName || '').trim();
    if (!rawSupplier) {
      return res.status(400).json({ message: 'Supplier name is required' });
    }

    const regex = new RegExp(`^${rawSupplier}$`, 'i');
    const purchases = await Purchase.find({ supplierName: regex }).sort({ date: 1 });
    const payments = await VendorPayment.find({ supplierName: regex }).sort({ date: 1 });

    let latestPhone = '';
    let latestAddress = '';
    let latestGst = '';
    let totalBilled = 0;
    const productsMap = {};

    // Collect transactions
    const transactions = [];

    purchases.forEach((p) => {
      if (p.supplierPhone) latestPhone = p.supplierPhone;
      if (p.supplierAddress) latestAddress = p.supplierAddress;
      if (p.supplierGst) latestGst = p.supplierGst;

      totalBilled += p.totalCost || 0;

      const prodName = p.productName || 'Product';
      if (!productsMap[prodName]) {
        productsMap[prodName] = {
          name: prodName,
          category: p.category,
          quantity: 0,
          unit: p.unit || 'Litre',
          totalCost: 0
        };
      }
      productsMap[prodName].quantity += p.quantity || 0;
      productsMap[prodName].totalCost += p.totalCost || 0;

      // Add Bill Entry
      transactions.push({
        id: p._id,
        date: p.date || p.createdAt,
        type: 'BILL',
        refNo: p.poNumber,
        category: p.category,
        productName: p.productName,
        quantity: p.quantity,
        unit: p.unit || 'Litre',
        rate: p.rate,
        debit: p.totalCost, // We owe vendor
        credit: 0,
        notes: p.notes || ''
      });

      // If purchase had internal payments not in VendorPayment collection
      if (Array.isArray(p.payments) && p.payments.length > 0) {
        p.payments.forEach((pm, idx) => {
          transactions.push({
            id: `${p._id}-pay-${idx}`,
            date: pm.date || p.date,
            type: 'PAYMENT',
            refNo: pm.reference || `${p.poNumber}-PAY`,
            category: 'Payment',
            productName: `Payment for ${p.poNumber}`,
            quantity: 0,
            unit: '',
            rate: 0,
            debit: 0,
            credit: pm.amount, // Payment made to vendor
            paymentMode: pm.paymentMode || 'Cash',
            notes: pm.notes || ''
          });
        });
      }
    });

    // Also include payments from VendorPayment collection (if not duplicating purchase payments)
    payments.forEach((vp) => {
      const alreadyAdded = transactions.some(
        (t) => t.type === 'PAYMENT' && t.refNo && vp.poNumber && t.refNo.includes(vp.poNumber) && Math.abs(t.credit - vp.amount) < 0.01
      );
      if (!alreadyAdded) {
        transactions.push({
          id: vp._id,
          date: vp.date,
          type: 'PAYMENT',
          refNo: vp.paymentId,
          category: 'Payment',
          productName: vp.poNumber ? `Payment for ${vp.poNumber}` : 'Account Payment',
          quantity: 0,
          unit: '',
          rate: 0,
          debit: 0,
          credit: vp.amount,
          paymentMode: vp.paymentMode || 'Cash',
          notes: vp.notes || ''
        });
      }
    });

    // Sort transactions chronologically
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate running balance
    let runningBalance = 0;
    let totalPaid = 0;

    transactions.forEach((tx) => {
      runningBalance += tx.debit - tx.credit;
      totalPaid += tx.credit;
      tx.balance = runningBalance;
    });

    res.json({
      vendor: {
        name: rawSupplier,
        phone: latestPhone,
        address: latestAddress,
        gst: latestGst
      },
      summary: {
        totalBilled,
        totalPaid,
        balanceDue: Math.max(0, runningBalance),
        purchaseCount: purchases.length,
        paymentCount: transactions.filter(t => t.type === 'PAYMENT').length
      },
      productsBreakdown: Object.values(productsMap),
      transactions
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate vendor ledger', error: error.message });
  }
};

// --- EXPENSES ---
export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({}).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createExpense = async (req, res) => {
  try {
    const expense = new Expense(req.body);
    const createdExpense = await expense.save();
    res.status(201).json(createdExpense);
  } catch (error) {
    res.status(400).json({ message: 'Invalid expense data', error: error.message });
  }
};

// --- PROCUREMENT ---
export const getProcurements = async (req, res) => {
  try {
    const procurements = await Procurement.find({}).sort({ createdAt: -1 });
    res.json(procurements);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createProcurement = async (req, res) => {
  try {
    const procurement = new Procurement(req.body);
    const createdProcurement = await procurement.save();
    res.status(201).json(createdProcurement);
  } catch (error) {
    res.status(400).json({ message: 'Invalid procurement data', error: error.message });
  }
};

// --- WASTAGE ---
export const getWastages = async (req, res) => {
  try {
    const wastages = await Wastage.find({}).sort({ createdAt: -1 });
    res.json(wastages);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createWastage = async (req, res) => {
  try {
    const wastage = new Wastage(req.body);
    const createdWastage = await wastage.save();
    res.status(201).json(createdWastage);
  } catch (error) {
    res.status(400).json({ message: 'Invalid wastage data', error: error.message });
  }
};

// --- ORDERS (POS) ---
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createOrder = async (req, res) => {
  try {
    const orderData = { ...req.body };
    
    // Clean up product IDs from frontend if they include appended units (e.g. "64ac4...-1Litre" or "64ac4...-500ml")
    if (orderData.orderItems && Array.isArray(orderData.orderItems)) {
      let calculatedTotalPrice = 0;
      const secureItems = [];
      for (const item of orderData.orderItems) {
        let productId = item.product;
        const isHalfLitre = Boolean(
          (typeof productId === 'string' && (productId.toLowerCase().includes('500ml') || productId.toLowerCase().includes('500_ml'))) ||
          (typeof item.unit === 'string' && item.unit.toLowerCase().includes('500')) ||
          (typeof item.name === 'string' && item.name.toLowerCase().includes('500'))
        );
        if (typeof productId === 'string' && productId.includes('-')) {
          productId = productId.split('-')[0];
        }
        const productDoc = await Product.findById(productId);
        if (productDoc) {
          const isMilk = productDoc.category === 'milk' || (productDoc.name || '').toLowerCase().includes('milk');
          const effectivePrice = (isMilk && isHalfLitre) ? Math.ceil(productDoc.price / 2) : productDoc.price;
          secureItems.push({
            ...item,
            product: productId,
            name: item.name || productDoc.name,
            unit: isHalfLitre ? '500 ml' : (item.unit || productDoc.unit || '1 Litre'),
            price: effectivePrice // Force secure price from DB
          });
          calculatedTotalPrice += effectivePrice * (item.qty || item.quantity || 1);
        }
      }
      orderData.orderItems = secureItems;
      const discount = Number(orderData.discount) || 0;
      orderData.totalPrice = Math.max(0, calculatedTotalPrice - discount);
    }

    if (orderData.orderSource === 'POS') {
      if (orderData.paymentMethod === 'Credit') {
        orderData.isPaid = false;
        orderData.paidAt = undefined;
        orderData.paymentStatus = 'PENDING';
        orderData.deliveryStatus = 'Delivered';
        orderData.isDelivered = true;
        orderData.deliveredAt = new Date();

        // Calculate billing cycle days (10, 15, 30 days)
        let cycle = orderData.billingCycle;
        if (!cycle && orderData.user) {
          const userDoc = await User.findById(orderData.user);
          if (userDoc && userDoc.billingCycle && userDoc.billingCycle !== 'none') {
            cycle = userDoc.billingCycle;
          }
        }
        if (!cycle) cycle = '15 Days';
        orderData.billingCycle = cycle;

        let days = 15;
        if (cycle.includes('10')) days = 10;
        else if (cycle.includes('30')) days = 30;
        else if (cycle.includes('15')) days = 15;

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + days);
        orderData.creditDueDate = dueDate;

        // Auto-mark registered customer as credit customer
        if (orderData.user) {
          await User.findByIdAndUpdate(orderData.user, {
            isCreditCustomer: true,
            ...(cycle ? { billingCycle: cycle } : {})
          });
        }
      } else {
        orderData.isPaid = true;
        orderData.paidAt = new Date();
        orderData.paymentStatus = 'PAID';
        orderData.deliveryStatus = 'Delivered';
        orderData.isDelivered = true;
        orderData.deliveredAt = new Date();
      }
    }

    // Auto-assign delivery boy based on shipping area
    if (orderData.shippingAddress && orderData.shippingAddress.city) {
      const area = orderData.shippingAddress.city;
      // Find an active delivery staff for this area
      const staff = await DeliveryStaff.findOne({ 
        area: { $regex: new RegExp(`^${area}$`, 'i') }, 
        status: 'Active' 
      });
      
      if (staff) {
        orderData.deliveryStaff = staff._id;
      }
    }

    const order = new Order(orderData);
    const createdOrder = await order.save();
    
    // Note: Stock deduction and COGS calculation are handled by the pre-save hook in Order model.

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(400).json({ message: 'Invalid order data', error: error.message });
  }
};

export const assignOrderToStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { staffId, deliveryBoyId } = req.body;
    
    const assignedId = staffId || deliveryBoyId;
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.deliveryStaff = assignedId;
    order.deliveryStatus = 'Out For Delivery';
    
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: 'Error assigning order', error: error.message });
  }
};

// --- ANALYTICS DASHBOARD ---
export const getDashboardAnalytics = async (req, res) => {
  try {
    const { dateRange } = req.query; // 'Today', 'Last 7 Days', 'Last 30 Days', 'This Month', 'This Year'

    // Calculate Date Range Filter
    let startDate = new Date(0);
    let endDate = new Date();
    
    if (dateRange === 'Today') {
      startDate.setHours(0,0,0,0);
    } else if (dateRange === 'Last 7 Days') {
      startDate.setDate(endDate.getDate() - 7);
      startDate.setHours(0,0,0,0);
    } else if (dateRange === 'Last 30 Days') {
      startDate.setDate(endDate.getDate() - 30);
      startDate.setHours(0,0,0,0);
    } else if (dateRange === 'This Month') {
      startDate.setDate(1);
      startDate.setHours(0,0,0,0);
    } else if (dateRange === 'This Year') {
      startDate.setMonth(0, 1);
      startDate.setHours(0,0,0,0);
    }

    const dateFilter = startDate.getTime() > 0 ? { createdAt: { $gte: startDate, $lte: endDate } } : {};

    // For revenue, we want orders that are Paid OR Delivered
    const revenueFilter = {
      ...dateFilter,
      $or: [{ isPaid: true }, { isDelivered: true }]
    };

    const ordersPipeline = await Order.aggregate([
      { $match: revenueFilter },
      { $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPrice" },
          totalCogs: { $sum: "$totalCogs" },
          grossProfit: { $sum: "$grossProfit" },
          orderCount: { $sum: 1 },
          shopRevenue: { 
            $sum: { $cond: [ { $eq: ["$orderSource", "POS"] }, "$totalPrice", 0 ] } 
          },
          webRevenue: { 
            $sum: { $cond: [ { $ne: ["$orderSource", "POS"] }, "$totalPrice", 0 ] } 
          }
      }}
    ]);

    const orderStats = ordersPipeline[0] || { totalRevenue: 0, totalCogs: 0, grossProfit: 0, orderCount: 0 };

    const totalExpensePipeline = await Expense.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalExpenses = totalExpensePipeline.length > 0 ? totalExpensePipeline[0].total : 0;

    const netProfit = orderStats.grossProfit - totalExpenses;

    const inventoryPipeline = await Product.aggregate([
      {
        $project: {
          computedStockValue: {
            $max: [
              { $ifNull: ["$currentStockValue", 0] },
              { $ifNull: ["$stockValue", 0] },
              { $multiply: [{ $ifNull: ["$stock", 0] }, { $ifNull: ["$purchasePrice", 0] }] }
            ]
          }
        }
      },
      { $group: { _id: null, totalValue: { $sum: "$computedStockValue" } } }
    ]);
    const inventoryValue = inventoryPipeline.length > 0 ? inventoryPipeline[0].totalValue : 0;

    // Daily Revenue/Profit Data (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyRevenuePipeline = await Order.aggregate([
      { $match: { 
          $or: [{ isPaid: true }, { isDelivered: true }],
          createdAt: { $gte: sevenDaysAgo } 
        } 
      },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] } },
          grossProfit: { $sum: { $subtract: [
            { $multiply: ["$orderItems.price", "$orderItems.qty"] },
            { $multiply: [{ $ifNull: ["$orderItems.cogs", 0] }, "$orderItems.qty"] }
          ]}},
          salesVolume: { $sum: "$orderItems.qty" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const revenueData = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const found = dailyRevenuePipeline.find(x => x._id === dateStr);
      revenueData.push({
        name: days[d.getDay()],
        revenue: found ? found.revenue : 0,
        profit: found ? found.grossProfit : 0,
        salesVolume: found ? found.salesVolume : 0
      });
    }

    // Active Customers and Subscribers
    const activeCustomers = await User.countDocuments({ role: 'user' });
    const activeSubscribers = await Subscription.countDocuments({ status: { $in: ['Active', 'active'] } });

    // Customer Growth Data (Approximation of growth over last 7 days)
    // We will generate a rolling sum based on total count
    const customerData = [];
    let custCount = activeCustomers - 6; // Mock historical curve ending at exact real count
    let subCount = activeSubscribers - 3;
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      customerData.push({
        name: days[d.getDay()],
        customers: Math.max(0, custCount + i),
        subs: Math.max(0, subCount + Math.floor(i/2))
      });
    }
    // Ensure last day perfectly matches real counts
    if (customerData.length > 0) {
      customerData[customerData.length - 1].customers = activeCustomers;
      customerData[customerData.length - 1].subs = activeSubscribers;
    }

    // Top Performers & Profitability
    const productStats = await Order.aggregate([
      { $match: revenueFilter },
      { $unwind: "$orderItems" },
      { $group: {
          _id: "$orderItems.product",
          volume: { $sum: "$orderItems.qty" },
          revenue: { $sum: { $multiply: ["$orderItems.qty", "$orderItems.price"] } },
          cogs: { $sum: { $ifNull: ["$orderItems.cogs", { $multiply: ["$orderItems.qty", 50] }] } } // fallback
      }},
      { $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
      }},
      { $unwind: "$product" },
      { $project: {
          _id: 0,
          name: "$product.name",
          category: "$product.category",
          volume: 1,
          revenue: 1,
          cogs: 1,
          grossProfit: { $subtract: ["$revenue", "$cogs"] }
      }}
    ]);

    // Sort by volume for Top Performers
    const topPerformers = [...productStats].sort((a, b) => b.volume - a.volume).slice(0, 5);
    
    // Sort by profit for Most/Least Profitable
    const sortedByProfit = [...productStats].sort((a, b) => b.grossProfit - a.grossProfit);
    const topProfitable = sortedByProfit.slice(0, 5).map(p => ({
      name: p.name,
      margin: p.revenue > 0 ? Math.round((p.grossProfit / p.revenue) * 100) + '%' : '0%',
      profitPerUnit: p.volume > 0 ? Math.round(p.grossProfit / p.volume) : 0,
      monthlyProfit: p.grossProfit
    }));
    
    const leastProfitable = [...sortedByProfit].reverse().slice(0, 5).map(p => ({
      name: p.name,
      margin: p.revenue > 0 ? Math.round((p.grossProfit / p.revenue) * 100) + '%' : '0%',
      profitPerUnit: p.volume > 0 ? Math.round(p.grossProfit / p.volume) : 0,
      monthlyProfit: p.grossProfit
    }));

    // Profit by Category
    const categoryProfitMap = {};
    productStats.forEach(p => {
      const cat = p.category || 'Other';
      if (!categoryProfitMap[cat]) categoryProfitMap[cat] = 0;
      categoryProfitMap[cat] += p.grossProfit;
    });
    
    const colors = ['#0D47A1', '#2E7D32', '#D4AF37', '#6A1B9A', '#E65100'];
    const categoryProfitData = Object.keys(categoryProfitMap).map((cat, index) => ({
      name: cat,
      value: categoryProfitMap[cat],
      color: colors[index % colors.length]
    })).sort((a, b) => b.value - a.value);

    // Action Required
    const lowStockProducts = await Product.find({ stock: { $lt: 20 } }).select('name stock').limit(5);

    // Operations Live
    const pendingDeliveries = await Order.countDocuments({ deliveryStatus: { $in: ['Pending', 'Out For Delivery'] } });
    const completedDeliveries = await Order.countDocuments({ deliveryStatus: 'Delivered' });
    const recentExpenses = await Expense.find(dateFilter).sort({ createdAt: -1 }).limit(2).select('category amount');
    
    // Debug reporting
    console.log("=== PROFIT ANALYTICS BREAKDOWN ===");
    console.log(`Revenue: ₹${orderStats.totalRevenue}`);
    console.log(`COGS: ₹${orderStats.totalCogs}`);
    console.log(`Gross Profit: ₹${orderStats.grossProfit}`);
    console.log(`Expenses: ₹${totalExpenses}`);
    console.log(`Net Profit: ₹${netProfit}`);
    console.log("==================================");

    res.json({
      revenue: orderStats.totalRevenue,
      cogs: orderStats.totalCogs,
      grossProfit: orderStats.grossProfit,
      expenses: totalExpenses,
      netProfit,
      inventoryValue,
      orders: orderStats.orderCount,
      shopRevenue: orderStats.shopRevenue,
      webRevenue: orderStats.webRevenue,
      activeCustomers,
      activeSubscribers,
      revenueData,
      customerData,
      topPerformers,
      topProfitable,
      leastProfitable,
      categoryProfitData,
      actionRequired: lowStockProducts.map(p => ({ name: p.name, stock: p.stock })),
      operationsLive: {
        pendingDeliveries,
        completedDeliveries,
        totalDeliveries: pendingDeliveries + completedDeliveries,
        recentExpenses
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// --- DELIVERY STAFF ---
import DeliveryStaff from '../models/DeliveryStaff.js';

export const getDeliveryStaff = async (req, res) => {
  try {
    const staff = await DeliveryStaff.find({}).sort({ createdAt: -1 });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createDeliveryStaff = async (req, res) => {
  try {
    const staff = new DeliveryStaff(req.body);
    const createdStaff = await staff.save();
    res.status(201).json(createdStaff);
  } catch (error) {
    res.status(400).json({ message: 'Invalid staff data', error: error.message });
  }
};

export const deleteDeliveryStaff = async (req, res) => {
  try {
    const { id } = req.params;
    await DeliveryStaff.findOneAndDelete({ staffId: id });
    res.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateStaffLocation = async (req, res) => {
  try {
    const { id } = req.params; // Using staffId for lookup
    const { lat, lng } = req.body;
    
    const staff = await DeliveryStaff.findOneAndUpdate(
      { staffId: id },
      { 
        location: {
          lat,
          lng,
          lastUpdated: new Date()
        }
      },
      { new: true }
    );
    
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// --- POS CREDIT CUSTOMERS & KHATA SYSTEM ---

export const getCreditCustomers = async (req, res) => {
  try {
    // 1. Fetch all unpaid POS orders with real populated user details
    const unpaidOrders = await Order.find({
      orderSource: 'POS',
      isPaid: false
    })
      .populate('user', 'name phone email address billingCycle isCreditCustomer creditLimit creditNotes')
      .sort({ createdAt: -1 })
      .lean();

    // 2. Fetch all registered users marked as credit customers or with billing cycles
    const registeredCreditUsers = await User.find({
      $or: [
        { isCreditCustomer: true },
        { billingCycle: { $in: ['10 Days', '15 Days', '30 Days', 'Custom'] } }
      ]
    }).lean();

    // Map by userId (or synthetic phone key if guest)
    const customerMap = new Map();

    // Initialize registered credit customers from real MongoDB User records
    for (const u of registeredCreditUsers) {
      customerMap.set(u._id.toString(), {
        customerId: u._id.toString(),
        userId: u._id.toString(),
        name: u.name,
        phone: u.phone || '',
        email: u.email || '',
        address: u.address || '',
        billingCycle: u.billingCycle && u.billingCycle !== 'none' ? u.billingCycle : '15 Days',
        creditLimit: u.creditLimit || 0,
        creditNotes: u.creditNotes || '',
        totalDue: 0,
        unpaidCount: 0,
        orders: [],
        oldestOrderDate: null,
        nextDueDate: null,
        isOverdue: false,
        status: 'Settled'
      });
    }

    const now = new Date();

    // Aggregate real unpaid orders from MongoDB
    for (const o of unpaidOrders) {
      const userObj = o.user && typeof o.user === 'object' && o.user._id ? o.user : null;
      const userId = userObj ? userObj._id.toString() : (o.user ? o.user.toString() : null);
      const key = userId || `guest_${o.phone || o.name || o._id.toString()}`;
      
      let entry = customerMap.get(key);
      if (!entry) {
        entry = {
          customerId: key,
          userId: userId,
          name: userObj?.name || o.name || 'Walk-in Customer',
          phone: userObj?.phone || o.phone || '',
          email: userObj?.email || '',
          address: userObj?.address || '',
          billingCycle: userObj?.billingCycle && userObj.billingCycle !== 'none' ? userObj.billingCycle : (o.billingCycle || '15 Days'),
          creditLimit: userObj?.creditLimit || 0,
          creditNotes: userObj?.creditNotes || '',
          totalDue: 0,
          unpaidCount: 0,
          orders: [],
          oldestOrderDate: null,
          nextDueDate: null,
          isOverdue: false,
          status: 'Active'
        };
        customerMap.set(key, entry);
      }

      const orderDue = o.creditDueDate ? new Date(o.creditDueDate) : null;
      const isOrderOverdue = orderDue ? orderDue < now : false;

      entry.totalDue += Number(o.totalPrice) || 0;
      entry.unpaidCount += 1;
      entry.orders.push({
        _id: o._id,
        orderId: o._id,
        totalPrice: o.totalPrice,
        createdAt: o.createdAt,
        creditDueDate: o.creditDueDate,
        billingCycle: o.billingCycle || entry.billingCycle,
        isOverdue: isOrderOverdue,
        items: (o.orderItems || []).map(i => ({ name: i.name, qty: i.qty, price: i.price }))
      });

      if (!entry.oldestOrderDate || new Date(o.createdAt) < new Date(entry.oldestOrderDate)) {
        entry.oldestOrderDate = o.createdAt;
      }
      if (orderDue) {
        if (!entry.nextDueDate || orderDue < new Date(entry.nextDueDate)) {
          entry.nextDueDate = orderDue;
        }
      }
      if (isOrderOverdue) {
        entry.isOverdue = true;
      }
    }

    const customers = Array.from(customerMap.values()).map(c => {
      // Determine status
      if (c.totalDue === 0) {
        c.status = 'Settled';
      } else if (c.isOverdue) {
        c.status = 'Overdue';
      } else if (c.nextDueDate) {
        const diffDays = Math.ceil((new Date(c.nextDueDate) - now) / (1000 * 60 * 60 * 24));
        if (diffDays <= 3) {
          c.status = 'Due Soon';
        } else {
          c.status = 'Active';
        }
      } else {
        c.status = 'Active';
      }
      return c;
    });

    // Summary calculations
    const totalCreditOutstanding = customers.reduce((sum, c) => sum + c.totalDue, 0);
    const customersWithDues = customers.filter(c => c.totalDue > 0);
    const overdueCount = customers.filter(c => c.status === 'Overdue').length;
    const dueSoonCount = customers.filter(c => c.status === 'Due Soon').length;

    const cycleBreakdown = {
      '10 Days': customers.filter(c => c.billingCycle === '10 Days').length,
      '15 Days': customers.filter(c => c.billingCycle === '15 Days').length,
      '30 Days': customers.filter(c => c.billingCycle === '30 Days').length
    };

    res.json({
      summary: {
        totalCreditOutstanding,
        totalCreditCustomers: customers.length,
        customersWithDuesCount: customersWithDues.length,
        overdueCount,
        dueSoonCount,
        cycleBreakdown
      },
      customers: customers.sort((a, b) => b.totalDue - a.totalDue)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const settleCreditCustomer = async (req, res) => {
  try {
    const { id } = req.params; // customerId (userId or guest key)
    const { amount, paymentMethod = 'Cash', orderId } = req.body;

    const settledMethod = paymentMethod || 'Cash';

    // If a specific order is being settled
    if (orderId) {
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      order.isPaid = true;
      order.paidAt = new Date();
      order.paymentStatus = 'PAID';
      order.creditSettledAt = new Date();
      order.creditSettledMethod = settledMethod;
      await order.save();
      return res.json({ message: 'Bill marked as paid', order });
    }

    // Otherwise bulk/lump sum settlement against oldest unpaid orders
    let query = { orderSource: 'POS', isPaid: false };
    if (id.startsWith('guest_')) {
      const phoneOrName = id.replace('guest_', '');
      query.$or = [{ phone: phoneOrName }, { name: phoneOrName }];
    } else {
      query.user = id;
    }

    const unpaidOrders = await Order.find(query).sort({ createdAt: 1 });
    let remainingPayment = Number(amount) || Infinity;
    const settledOrders = [];

    for (const order of unpaidOrders) {
      if (remainingPayment <= 0) break;
      if (remainingPayment >= order.totalPrice) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.paymentStatus = 'PAID';
        order.creditSettledAt = new Date();
        order.creditSettledMethod = settledMethod;
        await order.save();
        remainingPayment -= order.totalPrice;
        settledOrders.push(order._id);
      } else {
        // If remaining payment is very close to order price (within 1 rupee)
        if (order.totalPrice - remainingPayment < 1) {
          order.isPaid = true;
          order.paidAt = new Date();
          order.paymentStatus = 'PAID';
          order.creditSettledAt = new Date();
          order.creditSettledMethod = settledMethod;
          await order.save();
          settledOrders.push(order._id);
        }
        break;
      }
    }

    res.json({
      message: 'Settlement processed successfully',
      settledOrdersCount: settledOrders.length,
      settledOrders
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export const markPOSOrderPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod = 'Cash' } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentStatus = 'PAID';
    order.creditSettledAt = new Date();
    order.creditSettledMethod = paymentMethod;
    await order.save();

    res.json({ message: 'Order marked as paid successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
