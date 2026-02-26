import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { logout } from '../redux/slices/authSlice';
import { User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navbar = ({ onMenuClick }) => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
        setMobileMenuOpen(false);
    };

    const isActive = (path) => location.pathname === path;

    // Don't show navbar on login/register pages
    if (!user && (location.pathname === '/login' || location.pathname === '/register')) {
        return null;
    }

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Menu Button & Logo */}
                    <div className="flex items-center space-x-3">
                        {user && (
                            <button
                                onClick={onMenuClick}
                                className="p-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                                aria-label="Open menu"
                            >
                                <Menu size={24} />
                            </button>
                        )}
                        <Link to="/dashboard" className="flex items-center space-x-2">
                            <img
                                src="/src/assets/logo.png"
                                alt="Fablead Logo"
                                className="h-10 w-auto"
                                onError={(e) => {
                                    // Fallback if logo image fails to load
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                            {/* Fallback logo text */}
                            <div className="hidden items-center space-x-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center">
                                    <span className="text-orange-500 font-bold text-xl">F</span>
                                </div>
                                <span className="text-xl font-bold text-gray-800">
                                    Fablead<span className="text-orange-500">Quiz</span>
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        {user ? (
                            <>
                                <Link
                                    to="/dashboard"
                                    className={`text-sm font-medium transition-colors ${isActive('/dashboard')
                                        ? 'text-orange-500'
                                        : 'text-gray-600 hover:text-orange-500'
                                        }`}
                                >
                                    Dashboard
                                </Link>

                                {/* User Info */}
                                <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                                    <div className="flex items-center space-x-2">
                                        <div className="bg-gray-200 rounded-full flex items-center justify-center">
                                            {/* {user.profileImage ? (
                                                    <img
                                                    src={user.profileImage}
                                                    alt={user.username}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <User size={16} className="text-gray-600" />
                                                )} */}
                                            {user.profileImage ? (
                                                <img
                                                    src={`http://localhost:3030${user.profileImage}`}
                                                    alt="Profile"
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-orange-500"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
                                                    {user.username?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="hidden lg:block">
                                            <p className="text-sm font-medium text-gray-800">{user.username}</p>
                                            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-1 text-gray-600 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-gray-100"
                                        title="Logout"
                                    >
                                        <LogOut size={18} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/login"
                                    className="text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="text-sm font-medium bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="text-gray-600 hover:text-gray-800 p-2"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 py-4">
                        <div className="space-y-4">
                            {user ? (
                                <>
                                    <div className="flex items-center space-x-3 px-2 pb-4 border-b border-gray-200">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                            {user.profileImage ? (
                                                <img
                                                    src={user.profileImage}
                                                    alt={user.username}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <User size={20} className="text-gray-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{user.username}</p>
                                            <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                                        </div>
                                    </div>

                                    <Link
                                        to="/dashboard"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`block px-2 py-2 text-base font-medium rounded-lg ${isActive('/dashboard')
                                            ? 'text-orange-500 bg-orange-50'
                                            : 'text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        Dashboard
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center space-x-2 px-2 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg"
                                    >
                                        <LogOut size={18} />
                                        <span>Logout</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-2 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 rounded-lg"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block px-2 py-2 text-base font-medium bg-orange-500 text-white rounded-lg text-center"
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
