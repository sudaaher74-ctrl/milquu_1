import mongoose from 'mongoose';
import RecycleBin from '../models/RecycleBin.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import KhataBill from '../models/KhataBill.js';
import Purchase from '../models/Purchase.js';
import { recordAudit } from '../utils/audit.js';

// @desc    Get all deleted items in Recycle Bin
// @route   GET /api/recycle-bin
// @access  Private (Staff/Admin)
export const getRecycleBinItems = async (req, res) => {
  try {
    const { type, customerId, search } = req.query;
    const filter = {};

    if (type && type !== 'all') {
      filter.itemType = type;
    }

    if (customerId) {
      filter['metadata.customerId'] = new mongoose.Types.ObjectId(customerId);
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { summary: { $regex: q, $options: 'i' } },
        { 'metadata.customerName': { $regex: q, $options: 'i' } }
      ];
    }

    const items = await RecycleBin.find(filter).sort({ deletedAt: -1 }).lean();

    // Summary count of items by type
    const counts = {
      all: await RecycleBin.countDocuments({}),
      Order: await RecycleBin.countDocuments({ itemType: 'Order' }),
      Customer: await RecycleBin.countDocuments({ itemType: 'Customer' }),
      KhataBill: await RecycleBin.countDocuments({ itemType: 'KhataBill' })
    };

    res.json({
      items,
      counts
    });
  } catch (err) {
    console.error('Error fetching recycle bin items:', err);
    res.status(500).json({ message: 'Failed to fetch recycle bin items', error: err.message });
  }
};

// @desc    Restore a deleted item from Recycle Bin
// @route   POST /api/recycle-bin/:id/restore
// @access  Private (Staff/Admin)
export const restoreRecycleBinItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await RecycleBin.findById(id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found in Recycle Bin' });
    }

    const { itemType, originalId, data, relatedData } = item;
    let restoredSummary = '';

    if (itemType === 'Order') {
      const existing = await Order.findById(originalId);
      if (!existing) {
        await Order.collection.insertOne(data);
      }
      // If linked to a KhataBill that is still active, add order back to bill
      if (data.khataBill) {
        try {
          await KhataBill.findByIdAndUpdate(data.khataBill, {
            $addToSet: { orders: originalId }
          });
        } catch (e) {
          console.warn('Could not re-link restored order to KhataBill:', e.message);
        }
      }
      restoredSummary = `Restored daily order for ${item.metadata?.customerName || item.name}`;

    } else if (itemType === 'Customer') {
      const existingUser = await User.findById(originalId);
      if (!existingUser) {
        await User.collection.insertOne(data);
      }

      // Restore any related orders that were deleted alongside this customer
      if (Array.isArray(relatedData) && relatedData.length > 0) {
        let restoredCount = 0;
        for (const ord of relatedData) {
          const ordId = ord._id ? new mongoose.Types.ObjectId(ord._id) : null;
          if (ordId) {
            const ordExists = await Order.findById(ordId);
            if (!ordExists) {
              await Order.collection.insertOne(ord);
              restoredCount++;
            }
          }
        }
        restoredSummary = `Restored customer ${data.name} and ${restoredCount} associated orders`;
      } else {
        restoredSummary = `Restored customer ${data.name}`;
      }

    } else if (itemType === 'KhataBill') {
      const existingBill = await KhataBill.findById(originalId);
      if (!existingBill) {
        await KhataBill.collection.insertOne(data);
      }
      // Re-link orders to this bill
      if (Array.isArray(data.orders) && data.orders.length > 0) {
        const orderIds = data.orders.map(o => typeof o === 'string' ? new mongoose.Types.ObjectId(o) : o);
        await Order.updateMany(
          { _id: { $in: orderIds } },
          { $set: { khataBill: originalId } }
        );
      }
      restoredSummary = `Restored bill ${data.billNumber} for ${data.customerName}`;

    } else if (itemType === 'Purchase') {
      const existingPurchase = await Purchase.findById(originalId);
      if (!existingPurchase) {
        await Purchase.collection.insertOne(data);
      }
      restoredSummary = `Restored purchase order ${data.poNumber || ''}`;
    }

    // Remove from Recycle Bin
    await RecycleBin.findByIdAndDelete(id);

    await recordAudit(req, {
      action: 'recyclebin.restore',
      entity: itemType,
      entityId: originalId.toString(),
      summary: restoredSummary || `Restored ${itemType} ${item.name}`
    });

    res.json({
      message: restoredSummary || 'Item restored successfully',
      itemType,
      originalId
    });
  } catch (err) {
    console.error('Error restoring recycle bin item:', err);
    res.status(500).json({ message: 'Failed to restore item', error: err.message });
  }
};

// @desc    Permanently delete an item from Recycle Bin
// @route   DELETE /api/recycle-bin/:id
// @access  Private (Staff/Admin)
export const permanentlyDeleteRecycleBinItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await RecycleBin.findById(id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found in Recycle Bin' });
    }

    await RecycleBin.findByIdAndDelete(id);

    await recordAudit(req, {
      action: 'recyclebin.permanent-delete',
      entity: item.itemType,
      entityId: item.originalId.toString(),
      summary: `Permanently deleted ${item.itemType}: ${item.name}`
    });

    res.json({ message: 'Item permanently deleted from Recycle Bin' });
  } catch (err) {
    console.error('Error permanently deleting recycle bin item:', err);
    res.status(500).json({ message: 'Failed to delete item', error: err.message });
  }
};

// @desc    Empty all items or a specific type from Recycle Bin
// @route   POST /api/recycle-bin/empty
// @access  Private (Admin only)
export const emptyRecycleBin = async (req, res) => {
  try {
    const { type } = req.body;
    const filter = {};
    if (type && type !== 'all') {
      filter.itemType = type;
    }

    const count = await RecycleBin.countDocuments(filter);
    await RecycleBin.deleteMany(filter);

    await recordAudit(req, {
      action: 'recyclebin.empty',
      entity: 'RecycleBin',
      entityId: 'all',
      summary: `Emptied Recycle Bin (${count} items removed)`
    });

    res.json({ message: `Recycle Bin emptied (${count} items removed)` });
  } catch (err) {
    console.error('Error emptying recycle bin:', err);
    res.status(500).json({ message: 'Failed to empty recycle bin', error: err.message });
  }
};
