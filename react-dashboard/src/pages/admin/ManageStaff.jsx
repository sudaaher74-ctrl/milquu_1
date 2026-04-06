import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { Users, Plus, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';

const ManageStaff = () => {
    const [staff, setStaff] = useState([]);
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ id: '', name: '', email: '', password: '', phone: '', assigned_area: '' });
    const [isEditing, setIsEditing] = useState(false);

    const fetchData = async () => {
        try {
            const [staffRes, areasRes] = await Promise.all([
                api.get('/admin?role=delivery_staff'),
                api.get('/areas')
            ]);
            
            if (staffRes.data.success) {
                setStaff(staffRes.data.admins); // From backend admin schema
            }
            if (areasRes.data.success) {
                setAreas(areasRes.data.data);
            }
        } catch (err) {
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openModal = (member = null) => {
        if (member) {
            setIsEditing(true);
            setFormData({
                id: member._id,
                name: member.name,
                email: member.email,
                phone: member.phone || '',
                assigned_area: member.assigned_area?._id || '',
                password: '' // Don't populate password for security
            });
        } else {
            setIsEditing(false);
            setFormData({ id: '', name: '', email: '', password: '', phone: '', assigned_area: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ id: '', name: '', email: '', password: '', phone: '', assigned_area: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (isEditing) {
                const payload = {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    assigned_area: formData.assigned_area
                };
                if (formData.password) payload.password = formData.password; // Optional update
                
                await api.put(`/admin/${formData.id}`, payload);
                toast.success('Staff updated successfully');
            } else {
                const payload = {
                    ...formData,
                    role: 'delivery_staff'
                };
                await api.post('/admin/register', payload);
                toast.success('Staff added successfully');
            }
            fetchData();
            closeModal();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save staff');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this delivery staff?')) return;
        try {
            await api.delete(`/admin/${id}`);
            toast.success('Staff removed');
            fetchData();
        } catch (err) {
            toast.error('Failed to delete staff');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center sm:flex-row flex-col gap-4">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center">
                    <Users className="mr-3 h-7 w-7 text-primary-600" />
                    Delivery Staff
                </h1>
                <button
                    onClick={() => openModal()}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 shadow-sm"
                >
                    <Plus className="mr-2 -ml-1 h-5 w-5" />
                    Add Staff
                </button>
            </div>

            <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name & Email</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Area</th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">Loading staff...</td></tr>
                            ) : staff.length === 0 ? (
                                <tr><td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">No delivery staff added yet.</td></tr>
                            ) : (
                                staff.map((member) => (
                                    <tr key={member._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">{member.name}</div>
                                            <div className="text-sm text-gray-500">{member.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{member.phone || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {member.assigned_area ? (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                                    {member.assigned_area.name}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                                    <AlertTriangle className="mr-1 h-3 w-3" /> Unassigned
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => openModal(member)} className="text-primary-600 hover:text-primary-900 mr-4">
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(member._id)} className="text-red-600 hover:text-red-900">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" onClick={closeModal}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-xl w-full">
                            <form onSubmit={handleSubmit}>
                                <div className="px-6 py-6 pb-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                    <h3 className="text-lg font-bold text-gray-900">{isEditing ? 'Edit Staff Member' : 'Add Delivery Staff'}</h3>
                                    <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-500"><X className="h-5 w-5" /></button>
                                </div>
                                <div className="px-6 py-6 grid sm:grid-cols-2 gap-5">
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                                        <input
                                            type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2.5 px-3 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email <span className="text-gray-400 font-normal">(Login ID)</span></label>
                                        <input
                                            type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2.5 px-3 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">{isEditing ? 'New Password (Optional)' : 'Password'}</label>
                                        <input
                                            type="password" required={!isEditing} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2.5 px-3 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                                        <input
                                            type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} pattern="[6-9]\d{9}"
                                            className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2.5 px-3 border"
                                            placeholder="10-digit number"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Assign Area</label>
                                        <select
                                            required value={formData.assigned_area} onChange={(e) => setFormData({ ...formData, assigned_area: e.target.value })}
                                            className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2.5 px-3 border bg-white"
                                        >
                                            <option value="">Select an area</option>
                                            {areas.map(area => (
                                                <option key={area._id} value={area._id}>{area.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-gray-50 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-gray-100">
                                    <button type="button" onClick={closeModal} className="w-full sm:w-auto inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-5 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:text-sm transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" className="w-full sm:w-auto inline-flex justify-center rounded-xl border border-transparent shadow-sm px-5 py-2.5 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 sm:text-sm transition-colors">
                                        {isEditing ? 'Save Changes' : 'Add Staff'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageStaff;
