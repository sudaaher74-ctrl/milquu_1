const mongoose = require('mongoose');
const Admin = require('./milqu-backend/models/Admin');
const Area = require('./milqu-backend/models/Area');
mongoose.connect('mongodb://localhost:27017/milqu-fresh').then(async () => {
    let area = await Area.findOne({ name: 'Nerul' });
    if (!area) {
        area = await Area.create({ name: 'Nerul', pincodes: ['400706'] });
    }
    const admin = await Admin.create({ name: 'Test Boy', email: 'testboy@milqu.com', password: 'test', role: 'delivery_staff', assigned_area: area._id });
    
    const fetchedAdmin = await Admin.findById(admin._id).populate('assigned_area');
    console.log("Fetched area name:", fetchedAdmin.assigned_area ? fetchedAdmin.assigned_area.name : 'Unassigned');
    
    await Admin.findByIdAndDelete(admin._id);
    mongoose.disconnect();
});
