import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { isAllowedOrigin } from './config/cors.js';
import logger from './utils/logger.js';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      // Same origins as the REST API — '*' let any website connect.
      origin: (origin, callback) => callback(null, !origin || isAllowedOrigin(origin)),
      methods: ['GET', 'POST']
    }
  });

  // Every socket must present a valid token. Delivery staff publish their own
  // position; admins watch. Anonymous clients used to be able to both spoof
  // any driver's location and follow any driver around.
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token || !process.env.JWT_SECRET) return next(new Error('Not authorized'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!['delivery', 'admin', 'manager', 'superadmin', 'staff'].includes(decoded.role)) {
        return next(new Error('Not authorized'));
      }
      socket.data.userId = String(decoded.id);
      socket.data.role = decoded.role;
      next();
    } catch {
      next(new Error('Not authorized'));
    }
  });

  io.on('connection', (socket) => {
    const { userId, role } = socket.data;
    const isDelivery = role === 'delivery';

    // Staff join their own tracking room; admins may watch any of them.
    socket.on('join_tracking', (data) => {
      const deliveryBoyId = String(data?.deliveryBoyId || '');
      if (!deliveryBoyId) return;
      if (isDelivery && deliveryBoyId !== userId) return;
      socket.join(`track_${deliveryBoyId}`);
    });

    // Only a delivery person can report a location, and only their own —
    // the id in the payload is ignored in favour of the signed-in one.
    socket.on('update_location', (data) => {
      if (!isDelivery) return;
      const latitude = Number(data?.latitude);
      const longitude = Number(data?.longitude);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
      io.to(`track_${userId}`).emit('location_updated', {
        deliveryBoyId: userId,
        latitude,
        longitude,
        heading: Number.isFinite(Number(data?.heading)) ? Number(data.heading) : null,
        timestamp: new Date()
      });
    });

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
