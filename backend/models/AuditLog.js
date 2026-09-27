import mongoose from 'mongoose';

/**
 * Who did what in the admin panel. Written for actions that move money, change
 * prices or stock, or change who can do what — the things a business owner
 * needs to be able to answer "who changed this?" about.
 */
const auditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actorName: { type: String },
  actorRole: { type: String },
  action: { type: String, required: true },       // e.g. 'wallet.credit', 'product.update'
  entity: { type: String },                        // e.g. 'Customer', 'Product'
  entityId: { type: String },
  summary: { type: String, required: true },       // one readable line
  meta: { type: mongoose.Schema.Types.Mixed },
  ip: { type: String }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ actor: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
