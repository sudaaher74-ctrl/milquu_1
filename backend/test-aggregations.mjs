import mongoose from 'mongoose';

async function run() {
  await mongoose.connect('mongodb+srv://sudaaher74_db_user:sudarshan2002@project1.guo85xo.mongodb.net/milquu');
  
  const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));

  console.log("Testing topPerformers...");
  const topPerformers = await Order.aggregate([
    { $unwind: "$orderItems" },
    { $group: {
        _id: "$orderItems.product",
        volume: { $sum: "$orderItems.qty" },
        revenue: { $sum: { $multiply: ["$orderItems.qty", "$orderItems.price"] } }
    }},
    { $sort: { revenue: -1 } },
    { $limit: 4 },
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
        volume: 1,
        revenue: 1
    }}
  ]);

  console.log(topPerformers);
  process.exit(0);
}

run().catch(console.error);
