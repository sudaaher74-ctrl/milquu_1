import mongoose from 'mongoose';

/**
 * The business details printed on POS receipts, purchase vouchers and vendor
 * statements. A single document (key 'business'). Defaults are the details the
 * receipts carried before this was editable.
 */
const businessSettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'business', unique: true },
  businessName: { type: String, default: 'MilQuu Fresh', trim: true, maxlength: 80 },
  tagline: { type: String, default: 'Pure Farm Fresh Milk & Dairy', trim: true, maxlength: 120 },
  supportEmail: { type: String, default: 'support@milquufresh.in', trim: true, maxlength: 120 },
  supportPhone: { type: String, default: '+91 87670 67884', trim: true, maxlength: 30 },
  address: { type: String, default: 'Panvel, Navi Mumbai, Maharashtra', trim: true, maxlength: 300 },
  gstin: { type: String, default: '', trim: true, uppercase: true, maxlength: 15 },
  fssaiLicense: { type: String, default: '', trim: true, maxlength: 20 },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

/** The settings document, created with defaults on first read. */
businessSettingsSchema.statics.current = async function () {
  return this.findOneAndUpdate(
    { key: 'business' },
    { $setOnInsert: { key: 'business' } },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  );
};

const BusinessSettings = mongoose.model('BusinessSettings', businessSettingsSchema);

export default BusinessSettings;
