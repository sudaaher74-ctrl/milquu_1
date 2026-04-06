import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { MapPin, Plus, Edit2, Trash2, X } from 'lucide-react';

const ManageAreas = () => {
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ id: '', name: '', pincodes: '' });
    const [isEditing, setIsEditing] = useState(false);

    const fetchAreas = async () => {
        try {
            const { data } = await api.get('/areas');
            if (data.success) {
                setAreas(data.data);
            }
        } catch (err) {
            toast.error('Failed to fetch areas');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAreas();
    }, []);

    const openModal = (area = null) => {
        if (area) {
            setIsEditing(true);
            setFormData({ id: area._id, name: area.name, pincodes: area.pincodes.join(', ') });
        } else {
            setIsEditing(false);
            setFormData({ id: '', name: '', pincodes: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ id: '', name: '', pincodes: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            name: formData.name,
            pincodes: formData.pincodes.split(',').map(p => p.trim()).filter(p => p !== '')
        };

        try {
            if (isEditing) {
                await api.put(`/areas/${formData.id}`, payload);
                toast.success('Area updated successfully');
            } else {
                await api.post('/areas', payload);
                toast.success('Area added successfully');
            }
            fetchAreas();
            closeModal();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save area');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this area?')) return;
        try {
            await api.delete(`/areas/${id}`);
            toast.success('Area deleted');
            fetchAreas();
        } catch (err) {
            toast.error('Failed to delete area');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center sm:flex-row flex-col gap-4">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center">
                    <MapPin className="mr-3 h-7 w-7 text-primary-600" />
                    Delivery Areas
                </h1>
                <button
                    onClick={() => openModal()}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-sm"
                >
                    <Plus className="mr-2 -ml-1 h-5 w-5" />
                    Add Area
                </button>
            </div>

            <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Pincodes
                                </th>
                                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="3" className="px-6 py-8 text-center text-sm text-gray-500">Loading areas...</td></tr>
                            ) : areas.length === 0 ? (
                                <tr><td colSpan="3" className="px-6 py-8 text-center text-sm text-gray-500">No areas found. Add your first area to get started.</td></tr>
                            ) : (
                                areas.map((area) => (
                                    <tr key={area._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{area.name}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {area.pincodes.map((pin, i) => (
                                                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                        {pin}
                                                    </span>
                                                ))}
                                                {area.pincodes.length === 0 && <span className="text-sm text-gray-400">None</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => openModal(area)} className="text-primary-600 hover:text-primary-900 mr-4">
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(area._id)} className="text-red-600 hover:text-red-900">
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
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
                            <form onSubmit={handleSubmit}>
                                <div className="px-6 py-6 pb-2 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                    <h3 className="text-lg font-bold text-gray-900" id="modal-title">
                                        {isEditing ? 'Edit Area' : 'Add New Area'}
                                    </h3>
                                    <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-500"><X className="h-5 w-5" /></button>
                                </div>
                                <div className="px-6 py-6 space-y-5">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">Area Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2.5 px-3 border"
                                            placeholder="e.g. Kharghar"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="pincodes" className="block text-sm font-semibold text-gray-700 mb-1">Pincodes (Comma separated)</label>
                                        <input
                                            type="text"
                                            name="pincodes"
                                            id="pincodes"
                                            value={formData.pincodes}
                                            onChange={(e) => setFormData({ ...formData, pincodes: e.target.value })}
                                            className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2.5 px-3 border"
                                            placeholder="e.g. 410210, 410208"
                                        />
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-gray-50 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="w-full sm:w-auto inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-5 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:text-sm transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="w-full sm:w-auto inline-flex justify-center rounded-xl border border-transparent shadow-sm px-5 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 sm:text-sm transition-colors"
                                    >
                                        {isEditing ? 'Save Changes' : 'Create Area'}
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

export default ManageAreas;
