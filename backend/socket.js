import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // For dev purposes. In prod, lock this down to your frontend domains.
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket Connected: ${socket.id}`);

    // Delivery boy joins a specific tracking room
    socket.on('join_tracking', (data) => {
      const { deliveryBoyId } = data;
      if (deliveryBoyId) {
        socket.join(`track_${deliveryBoyId}`);
        console.log(`Socket ${socket.id} joined room track_${deliveryBoyId}`);
      }
    });

    // Delivery boy sends a location update
    socket.on('update_location', (data) => {
      const { deliveryBoyId, latitude, longitude, heading } = data;
      // Broadcast this location to anyone in the 'track_deliveryBoyId' room
      io.to(`track_${deliveryBoyId}`).emit('location_updated', {
        deliveryBoyId,
        latitude,
        longitude,
        heading,
        timestamp: new Date()
      });
    });

    socket.on('disconnect', () => {
      console.log(`Socket Disconnected: ${socket.id}`);
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
