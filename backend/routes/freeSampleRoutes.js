import express from 'express';
import FreeSample from '../models/FreeSample.js';

const router = express.Router();

// @route   POST /api/free-sample/submit
// @desc    Submit a new free sample request
// @access  Public
router.post('/submit', async (req, res) => {
  try {
    const { 
      fullName, mobileNumber, whatsappNumber, selectedProduct, 
      address, location, preferredDeliveryTime, deliveryInstructions,
      deviceType 
    } = req.body;

    // Check if the mobile number has already requested a sample
    const existingSample = await FreeSample.findOne({ mobileNumber });
    if (existingSample) {
      return res.status(400).json({ message: 'A sample has already been requested with this mobile number.' });
    }

    const ipAddress = req.ip || req.connection.remoteAddress;

    const newSample = new FreeSample({
      fullName,
      mobileNumber,
      whatsappNumber,
      selectedProduct,
      address,
      location,
      preferredDeliveryTime,
      deliveryInstructions,
      deviceType,
      ipAddress
    });

    await newSample.save();

    res.status(201).json({ message: 'Free sample request submitted successfully!' });
  } catch (error) {
    console.error('Error submitting free sample:', error);
    res.status(500).json({ message: 'Server error while submitting request.' });
  }
});

// @route   GET /api/free-sample/admin/all
// @desc    Get all free sample requests (Admin)
// @access  Private (Needs admin auth in real app, simplified here)
router.get('/admin/all', async (req, res) => {
  try {
    const samples = await FreeSample.find({}).sort({ createdAt: -1 });
    res.status(200).json(samples);
  } catch (error) {
    console.error('Error fetching free samples:', error);
    res.status(500).json({ message: 'Server error while fetching samples.' });
  }
});

// @route   PUT /api/free-sample/admin/:id/status
// @desc    Update status of a free sample request
// @access  Private
router.put('/admin/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Pending', 'Approved', 'Delivered', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const sample = await FreeSample.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!sample) {
      return res.status(404).json({ message: 'Sample request not found.' });
    }

    res.status(200).json(sample);
  } catch (error) {
    console.error('Error updating sample status:', error);
    res.status(500).json({ message: 'Server error while updating status.' });
  }
});

export default router;
