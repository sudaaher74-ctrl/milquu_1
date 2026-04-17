require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Fixing seeded areas...');
    
    // Import the real model
    const Area = require('./models/Area');

    const areasToSeed = [
        { name: 'Panvel / Old Panvel / Karanjade', pincodes: ['410206'], isActive: true },
        { name: 'New Panvel / Kalamboli', pincodes: ['410218'], isActive: true },
        { name: 'Kamothe', pincodes: ['410209'], isActive: true },
        { name: 'Kharghar', pincodes: ['410210'], isActive: true },
        { name: 'Taloja', pincodes: ['410220'], isActive: true },
        { name: 'Ulwe', pincodes: ['410222'], isActive: true },
        { name: 'CBD Belapur', pincodes: ['400614'], isActive: true },
        { name: 'Nerul', pincodes: ['400706'], isActive: true },
        { name: 'Panvel (Rural)', pincodes: ['410208'], isActive: true },
        { name: 'Roadpali / Kalamboli', pincodes: ['410221'], isActive: true },
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
