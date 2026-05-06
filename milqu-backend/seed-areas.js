require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Fixing seeded areas...');
    
    // Import the real model
    const Area = require('./models/Area');

    const areasToSeed = [
        { name: 'Panvel / Old Panvel / Karanjade', pincodes: ['410206'], lat: 18.9894, lng: 73.1175, radius: 4000, color: '#dc2626', isActive: true },
        { name: 'New Panvel / Kalamboli', pincodes: ['410218'], lat: 18.9936, lng: 73.1200, radius: 3500, color: '#f59e0b', isActive: true },
        { name: 'Kamothe', pincodes: ['410209'], lat: 19.0228, lng: 73.0675, radius: 3000, color: '#16a34a', isActive: true },
        { name: 'Kharghar', pincodes: ['410210'], lat: 19.0472, lng: 73.0682, radius: 4500, color: '#dc2626', isActive: true },
        { name: 'Taloja', pincodes: ['410220'], lat: 19.0800, lng: 73.0700, radius: 5000, color: '#f59e0b', isActive: true },
        { name: 'Ulwe', pincodes: ['410222'], lat: 18.9757, lng: 73.0142, radius: 3000, color: '#16a34a', isActive: true },
        { name: 'CBD Belapur', pincodes: ['400614'], lat: 19.0235, lng: 73.0410, radius: 2500, color: '#16a34a', isActive: true },
        { name: 'Nerul', pincodes: ['400706'], lat: 19.0341, lng: 73.0189, radius: 4000, color: '#f59e0b', isActive: true },
        { name: 'Panvel (Rural)', pincodes: ['410208'], lat: 18.9500, lng: 73.1500, radius: 6000, color: '#16a34a', isActive: true },
        { name: 'Roadpali / Kalamboli', pincodes: ['410221'], lat: 19.0400, lng: 73.0800, radius: 2500, color: '#f59e0b', isActive: true },
    ];

    let inserted = 0;
    for (const areaData of areasToSeed) {
        try {
            await Area.updateOne(
                { name: areaData.name }, // filter
                { $set: areaData, $unset: { status: "" } }, // update and remove old 'status' field
                { upsert: true } // insert if not found
            );
            inserted++;
        } catch (e) {
            console.error('Error updating area:', areaData.name, e.message);
        }
    }

    console.log(`Successfully updated ${inserted} areas to be active.`);
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
