import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import userService from '../services/user_service';
import {
    Users,
    Search,
    ArrowLeft,
    User,
    Mail,
    Shield,
    Calendar,
    Trash2,
    AlertCircle,
    Power
} from 'lucide-react';

const UserList = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useSelector((state) => state.auth);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const isAdmin = currentUser?.role === 'admin';

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const data = await userService.getAllUsers();
            // setUsers(data);
            setUsers(data.users);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to fetch users');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = users
        .filter(u => u.role === 'user')
        .filter(user =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

    const openDeleteModal = (user) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setUserToDelete(null);
        setIsDeleteModalOpen(false);
    };

    const confirmDelete = async () => {
        if (userToDelete) {
            try {
                await userService.deleteUser(userToDelete._id);
                setUsers(users.filter(u => u._id !== userToDelete._id));
                closeDeleteModal();
            } catch (err) {
                alert(err.message || 'Failed to delete user');
            }
        }
    };

    const handleToggleStatus = async (user) => {
        if (user._id === currentUser?._id) return;

        try {
            const response = await userService.toggleUserStatus(user._id);
            // Update the user in the local state
            setUsers(users.map(u =>
                u._id === user._id ? { ...u, isActive: response.user.isActive } : u));
        } catch (err) {
            alert(err.message || 'Failed to toggle user status');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                    <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
                    <p className="text-gray-600">You don't have permission to view this page.</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="inline-flex items-center text-gray-600 hover:text-orange-500 transition-colors mb-2"
                                >
                                    <ArrowLeft size={20} className="mr-1" />
                                    Back to Dashboard
                                </button>
                                <h1 className="text-3xl font-bold text-gray-800">
                                    <span className="text-orange-500">Users</span>
                                </h1>
                                <p className="text-gray-600 mt-2">
                                    Manage all registered users from here.
                                </p>
                            </div>
                            <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <Shield size={20} className="text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-800">
                                            {users.filter(u => u.role === 'user').length}
                                        </p>
                                        <p className="text-sm text-gray-500">Users</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                            <div className="flex items-center text-red-600">
                                <AlertCircle size={20} className="mr-2" />
                                <span>{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Stats Cards */}
                    {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

                        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Shield size={20} className="text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {users.filter(u => u.role === 'user').length}
                                    </p>
                                    <p className="text-sm text-gray-500">Users</p>
                                </div>
                            </div>
                        </div>

                    </div> */}

                    {/* Search */}
                    <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-gray-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    {/* Users Table */}
                    {filteredUsers.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
                            <Users size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No users found</h3>
                            <p className="text-gray-500">
                                {searchTerm ? 'Try adjusting your search' : 'No users registered yet'}
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Joined
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredUsers.map((user) => (
                                            <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            {user.profileImage ? (
                                                                <img
                                                                    className="h-10 w-10 rounded-full object-cover"
                                                                    src={`http://localhost:3030${user.profileImage}`}
                                                                    alt={user.username}
                                                                />
                                                            ) : (
                                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
                                                                    {user.username?.charAt(0).toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {user.username}
                                                            </div>
                                                            {user._id === currentUser?._id && (
                                                                <span className="text-xs text-orange-500">(You)</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Mail size={14} className="mr-2 text-gray-400" />
                                                        {user.email}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin'
                                                        ? 'bg-purple-100 text-purple-600'
                                                        : 'bg-blue-100 text-blue-600'
                                                        }`}>
                                                        <Shield size={12} className="mr-1" />
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Calendar size={14} className="mr-2 text-gray-400" />
                                                        {formatDate(user.createdAt)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {/* <button
                                                        onClick={() => handleToggleStatus(user)}
                                                        disabled={user._id === currentUser?._id}
                                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                                                            user.isActive !== false
                                                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        } ${user._id === currentUser?._id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                        title={user._id === currentUser?._id ? "Cannot change your own status" : (user.isActive !== false ? "Click to deactivate" : "Click to activate")}
                                                    >
                                                        <Power size={12} className="mr-1" />
                                                        {user.isActive !== false ? 'Active' : 'Inactive'}
                                                    </button> */}

                                                    <div className="flex items-center">
                                                        <button
                                                            onClick={() => handleToggleStatus(user)}
                                                            disabled={user._id === currentUser?._id}
                                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${user.isActive !== false ? 'bg-orange-500' : 'bg-gray-300'
                                                                } ${user._id === currentUser?._id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                            title={
                                                                user._id === currentUser?._id
                                                                    ? "Cannot change your own status"
                                                                    : user.isActive !== false
                                                                        ? "Click to deactivate"
                                                                        : "Click to activate"
                                                            }
                                                        >
                                                            <span
                                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${user.isActive !== false ? 'translate-x-6' : 'translate-x-1'
                                                                    }`}
                                                            />
                                                        </button>

                                                        {/* <span className={`ml-3 text-xs font-medium ${user.isActive !== false ? 'text-green-600' : 'text-gray-500'
                                                            }`}>
                                                            {user.isActive !== false ? 'Active' : 'Inactive'}
                                                        </span> */}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {user._id !== currentUser?._id && (
                                                        <button
                                                            onClick={() => openDeleteModal(user)}
                                                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete user"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={closeDeleteModal}
                    ></div>
                    <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6 z-10">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-red-100 rounded-full">
                                <AlertCircle className="text-red-600" size={24} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-800">
                                Confirm Deletion
                            </h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete <strong>{userToDelete?.username}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={closeDeleteModal}
                                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserList;
