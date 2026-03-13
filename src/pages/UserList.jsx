import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DataTable, { createTheme } from 'react-data-table-component';
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
    const { darkMode } = useSelector((state) => state.theme);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const isAdmin = currentUser?.role === 'admin';

    // Theme configuration for data table
    useEffect(() => {
        createTheme('custom', {
            text: {
                primary: darkMode ? '#f8fafc' : '#1e293b',
                secondary: darkMode ? '#94a3b8' : '#64748b',
            },
            background: {
                default: darkMode ? '#1e293b' : '#ffffff',
            },
            context: {
                background: darkMode ? '#1e293b' : '#e2e8f0',
                text: '#FFFFFF',
            },
            divider: {
                default: darkMode ? '#334155' : '#f1f5f9',
            },
            action: {
                button: 'rgba(0,0,0,.54)',
                hover: 'rgba(0,0,0,.08)',
                disabled: 'rgba(0,0,0,.12)',
            },
        });
    }, [darkMode]);

    const columns = [
        {
            name: 'User',
            selector: row => row.username,
            sortable: true,
            cell: row => (
                <div className="flex items-center py-2">
                    <div className="flex-shrink-0 h-10 w-10">
                        {row.profileImage ? (
                            <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={`http://localhost:3030${row.profileImage}`}
                                alt={row.username}
                            />
                        ) : (
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
                                {row.username?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="ml-4">
                        <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {row.username}
                        </div>
                        {row._id === currentUser?._id && (
                            <span className="text-xs text-orange-500">(You)</span>
                        )}
                    </div>
                </div>
            ),
        },
        {
            name: 'Email',
            selector: row => row.email,
            sortable: true,
            cell: row => (
                <div className={`flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Mail size={14} className={`mr-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    {row.email}
                </div>
            ),
        },
        {
            name: 'Role',
            selector: row => row.role,
            sortable: true,
            cell: row => (
                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${row.role === 'admin'
                    ? (darkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600')
                    : (darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-600')
                }`}>
                    <Shield size={12} className="mr-1" />
                    {row.role}
                </span>
            ),
        },
        {
            name: 'Joined',
            selector: row => row.createdAt,
            sortable: true,
            cell: row => (
                <div className={`flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Calendar size={14} className={`mr-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    {formatDate(row.createdAt)}
                </div>
            ),
        },
        {
            name: 'Status',
            cell: row => (
                <div className="flex items-center">
                    <button
                        onClick={() => handleToggleStatus(row)}
                        disabled={row._id === currentUser?._id}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${row.isActive !== false ? 'bg-orange-500' : (darkMode ? 'bg-gray-700' : 'bg-gray-300')
                        } ${row._id === currentUser?._id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        title={
                            row._id === currentUser?._id
                                ? "Cannot change your own status"
                                : row.isActive !== false
                                    ? "Click to deactivate"
                                    : "Click to activate"
                        }
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${row.isActive !== false ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                    </button>
                </div>
            ),
        },
        {
            name: 'Actions',
            right: true,
            cell: row => (
                row._id !== currentUser?._id && (
                    <button
                        onClick={() => openDeleteModal(row)}
                        className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-red-400 hover:bg-red-900/30' : 'text-red-600 hover:text-red-900 hover:bg-red-50'}`}
                        title="Delete user"
                    >
                        <Trash2 size={18} />
                    </button>
                )
            ),
        },
    ];

    const customStyles = {
        header: {
            style: {
                minHeight: '56px',
            },
        },
        headRow: {
            style: {
                borderTopStyle: 'solid',
                borderTopWidth: '1px',
                borderTopColor: darkMode ? '#334155' : '#f1f5f9',
                backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
            },
        },
        headCells: {
            style: {
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: darkMode ? '#94a3b8' : '#64748b',
                paddingLeft: '24px',
                paddingRight: '24px',
            },
        },
        cells: {
            style: {
                paddingLeft: '24px',
                paddingRight: '24px',
                backgroundColor: 'transparent',
            },
        },
        rows: {
            style: {
                minHeight: '72px',
                '&:not(:last-of-type)': {
                    borderBottomStyle: 'solid',
                    borderBottomWidth: '1px',
                    borderBottomColor: darkMode ? '#334155' : '#f1f5f9',
                },
                backgroundColor: 'transparent',
                '&:hover': {
                    backgroundColor: darkMode ? '#1e293b' : '#f8fafc',
                    cursor: 'pointer',
                    transitionDuration: '0.15s',
                    transitionProperty: 'background-color',
                },
            },
        },
        pagination: {
            style: {
                borderTopStyle: 'solid',
                borderTopWidth: '1px',
                borderTopColor: darkMode ? '#334155' : '#f1f5f9',
                backgroundColor: darkMode ? '#1e293b' : '#ffffff',
                color: darkMode ? '#f8fafc' : '#1e293b',
            },
            pageButtonsStyle: {
                borderRadius: '50%',
                height: '40px',
                width: '40px',
                padding: '8px',
                margin: 'px',
                cursor: 'pointer',
                transition: '0.4s',
                color: darkMode ? '#f8fafc' : '#1e293b',
                fill: darkMode ? '#f8fafc' : '#1e293b',
                backgroundColor: 'transparent',
                '&:hover:not(:disabled)': {
                    backgroundColor: darkMode ? '#334155' : '#f1f5f9',
                },
                '&:focus': {
                    outline: 'none',
                    backgroundColor: darkMode ? '#334155' : '#f1f5f9',
                },
            },
        },
    };

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
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-50 via-white to-orange-100'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-50 via-white to-orange-100'}`}>
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-md p-8 text-center`}>
                    <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                    <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Access Denied</h2>
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>You don't have permission to view this page.</p>
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
            <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-50 via-white to-orange-100'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className={`inline-flex items-center transition-colors mb-2 ${darkMode ? 'text-gray-400 hover:text-orange-400' : 'text-gray-600 hover:text-orange-500'}`}
                                >
                                    <ArrowLeft size={20} className="mr-1" />
                                    Back to Dashboard
                                </button>
                                <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                    <span className="text-orange-500">Users</span>
                                </h1>
                                <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Manage all registered users from here.
                                </p>
                            </div>
                            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md p-4 border`}>
                                <div className="flex items-center space-x-3">
                                    <div className={`${darkMode ? 'bg-purple-900/30' : 'bg-purple-100'} p-2 rounded-lg`}>
                                        <Shield size={20} className="text-purple-600" />
                                    </div>
                                    <div>
                                        <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                            {users.filter(u => u.role === 'user').length}
                                        </p>
                                        <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Users</p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className={`${darkMode ? 'bg-red-900/20 border-red-900/30 text-red-400' : 'bg-red-50 border-red-200 text-red-600'} border rounded-xl p-4 mb-6`}>
                            <div className="flex items-center">
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
                    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md p-4 mb-6 border`}>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors ${
                                    darkMode ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-800'
                                }`}
                            />
                        </div>
                    </div>

                    {/* Users Table */}
                    {filteredUsers.length === 0 ? (
                        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md p-12 text-center border`}>
                            <Users size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-700' : 'text-gray-300'}`} />
                            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>No users found</h3>
                            <p className={darkMode ? 'text-gray-500' : 'text-gray-500'}>
                                {searchTerm ? 'Try adjusting your search' : 'No users registered yet'}
                            </p>
                        </div>
                    ) : (
                        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border overflow-hidden`}>
                            <DataTable
                                columns={columns}
                                data={filteredUsers}
                                pagination
                                theme="custom"
                                customStyles={customStyles}
                                highlightOnHover
                                pointerOnHover
                                responsive
                            />
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
                    <div className={`relative rounded-xl shadow-xl w-full max-w-md p-6 z-10 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <div className="flex items-center space-x-3 mb-4">
                            <div className={`p-2 rounded-full ${darkMode ? 'bg-red-900/30' : 'bg-red-100'}`}>
                                <AlertCircle className="text-red-600" size={24} />
                            </div>
                            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                Confirm Deletion
                            </h3>
                        </div>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                            Are you sure you want to delete <strong>{userToDelete?.username}</strong>? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={closeDeleteModal}
                                className={`px-4 py-2 rounded-lg border transition ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition shadow-md"
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
