import mongoose from 'mongoose';
import AuditLog from '../models/AuditLog.js';
import logger from './logger.js';

/**
 * Record an admin action. Never throws: an audit write failing must not undo
 * or block the action it describes.
 */
export const recordAudit = async (req, { action, entity, entityId, summary, meta } = {}) => {
  // No connection: skip rather than let Mongoose queue the write and stall
  // the request (the action being recorded could not have reached the DB either).
  if (mongoose.connection.readyState !== 1) return;
  try {
    await AuditLog.create({
      actor: req?.user?._id,
      actorName: req?.user?.name,
      actorRole: req?.user?.role,
      action,
      entity,
      entityId: entityId ? String(entityId) : undefined,
      summary,
      meta,
      ip: req?.ip
    });
  } catch (error) {
    logger.error(`[audit] could not record ${action}: ${error.message}`);
  }
};
