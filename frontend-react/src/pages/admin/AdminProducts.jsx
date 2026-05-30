import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Edit2, Trash2, Search, Filter, Download, MoreVertical, 
  ArrowUpDown, Package, DollarSign, TrendingUp, AlertCircle
} from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'milk',
    price: '',
    stock: '',
    description: '',
    unit: '1 Litre',
  });
  const [imageFile, setImageFile] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch('https://milquu-backend.onrender.com/api/products');
      const data = await res.json();
      
      const mapped = data.map(p => ({
        id: p._id,
        name: p.name,
        sku: p.sku || `MIL-${p._id.substring(0,4).toUpperCase()}`,
        category: p.category,
        purchasePrice: p.price * 0.7, 
        sellingPrice: p.price,
        stock: p.stock || 50,
        image: p.image,
        status: p.stock > 20 ? 'Active' : (p.stock > 0 ? 'Low Stock' : 'Out of Stock')
      }));
      
      setProducts(mapped);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      alert('Please select an image');
      return;
    }
    
    setIsUploading(true);
    try {
      // 1. Upload Image to Cloudinary
      const imageFormData = new FormData();
      imageFormData.append('image', imageFile);
      
      const adminTokenStr = localStorage.getItem('adminToken');
      const token = adminTokenStr ? JSON.parse(adminTokenStr).token : '';
      const authHeaders = { 'Authorization': `Bearer ${token}` };

      const uploadRes = await fetch('https://milquu-backend.onrender.com/api/upload', {
        method: 'POST',
        headers: authHeaders,
        body: imageFormData
      });
      
      if (!uploadRes.ok) throw new Error('Image upload failed');
      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.url;

      // 2. Create Product
      const productPayload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        image: imageUrl
      };

      const productRes = await fetch('https://milquu-backend.onrender.com/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(productPayload)
      });
      
      if (!productRes.ok) throw new Error('Product creation failed');
      
      // 3. Cleanup and Refresh
      setIsModalOpen(false);
      setFormData({ name: '', category: 'milk', price: '', stock: '', description: '', unit: '1 Litre' });
      setImageFile(null);
      fetchProducts();
      
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to add product: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const calculateMetrics = (p) => {
    const profit = p.sellingPrice - p.purchasePrice;
    const margin = ((profit / p.sellingPrice) * 100).toFixed(1);
    const stockValue = p.stock * p.purchasePrice;
    return { profit, margin, stockValue };
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalProducts = products.length;
  const totalStockValue = products.reduce((acc, p) => acc + (p.stock * p.purchasePrice), 0);
  const highestMargin = products.length > 0 ? products.reduce((prev, current) => {
    return (calculateMetrics(prev).margin > calculateMetrics(current).margin) ? prev : current;
  }) : { name: 'N/A', sellingPrice: 1, purchasePrice: 1 };
  const lowStockCount = products.filter(p => p.stock < 20).length;

  return (
    <div className="max-w-[1400px] mx-auto pb-10 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-milquu-dark tracking-tight">Product Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage pricing, margins, stock value, and catalog status.</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center">
            <Download size={16} className="mr-2" /> Export
          </button>
          <button className="bg-milquu-dark text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-md flex items-center">
            <Edit2 size={16} className="mr-2" /> Bulk Edit
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-milquu-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors shadow-md shadow-milquu-blue/20 flex items-center"
          >
            <Plus size={16} className="mr-2" /> Add Product
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Products</p>
            <h3 className="text-2xl font-bold text-milquu-dark">{totalProducts}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-milquu-blue">
            <Package size={24} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Inventory Value</p>
            <h3 className="text-2xl font-bold text-milquu-dark">₹{(totalStockValue).toLocaleString()}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <DollarSign size={24} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Highest Margin</p>
            <h3 className="text-xl font-bold text-milquu-dark truncate max-w-[150px]">{highestMargin.name}</h3>
            <p className="text-xs font-bold text-green-600">{calculateMetrics(highestMargin).margin}% Margin</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
            <TrendingUp size={24} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Low Stock Items</p>
            <h3 className="text-2xl font-bold text-red-600">{lowStockCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
            <AlertCircle size={24} />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-72">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name or SKU..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-milquu-blue focus:ring-1 focus:ring-milquu-blue transition-all"
            />
          </div>
          <button className="flex items-center space-x-2 text-sm font-medium text-gray-600 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter size={16} />
            <span>Filters</span>
          </button>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1200px]">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Product Info</th>
                <th className="px-6 py-4">SKU Code</th>
                <th className="px-6 py-4">Pricing</th>
                <th className="px-6 py-4">Profitability</th>
                <th className="px-6 py-4">Inventory</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((product) => {
                const { profit, margin, stockValue } = calculateMetrics(product);
                
                return (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center p-1">
                          <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-milquu-dark">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">{product.sku}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-bold text-gray-800">SP: ₹{product.sellingPrice}</p>
                        <p className="text-xs text-gray-500">PP: ₹{product.purchasePrice}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-bold text-green-600">+₹{profit}/unit</p>
                        <p className="text-xs font-medium text-gray-500">{margin}% Margin</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <p className={`text-sm font-bold ${product.stock < 20 ? 'text-red-600' : 'text-milquu-dark'}`}>
                          {product.stock} units
                        </p>
                        <p className="text-xs text-gray-500">Val: ₹{(stockValue).toLocaleString()}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${
                        product.status === 'Active' || product.status === 'In Stock' ? 'bg-green-100 text-green-700' :
                        product.status === 'Low Stock' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-1.5 text-gray-400 hover:text-milquu-blue hover:bg-blue-50 rounded transition-colors mx-1">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors mx-1">
                        <Trash2 size={16} />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors mx-1">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500 font-medium">
                    No products found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Add New Product</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select name="category" value={formData.category} onChange={handleInputChange} className="w-full border rounded-lg p-2">
                    <option value="milk">Milk</option>
                    <option value="by-products">By-Products</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input required type="text" name="unit" value={formData.unit} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input required type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock</label>
                  <input required type="number" name="stock" value={formData.stock} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} className="w-full border rounded-lg p-2" rows="2"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                <input required type="file" accept="image/*" onChange={handleImageChange} className="w-full border rounded-lg p-2" />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={isUploading} className="px-4 py-2 bg-milquu-blue text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 flex items-center">
                  {isUploading ? 'Uploading...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
