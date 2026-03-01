import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import {
    X,
    LayoutDashboard,
    BookOpen,
    Users,
    Settings,
    HelpCircle,
    FileText,
    Award,
    History,
    BarChart3,
    User
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
    const { user } = useSelector((state) => state.auth);
    const location = useLocation();
    const isAdmin = user?.role === 'admin';

    const isActive = (path) => location.pathname === path;

    // Close sidebar on route change for mobile
    const handleLinkClick = () => {
        if (window.innerWidth < 1024) {
            onClose();
        }
    };

    const adminMenuItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/quizzes', icon: BookOpen, label: 'Quizzes' },
        { path: '/users', icon: Users, label: 'Users' },
        { path: '/analytics', icon: BarChart3, label: 'Analytics' },
        { path: '/reports', icon: FileText, label: 'Reports' },
        { path: '/profile', icon: User, label: 'Profile' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ];

    const userMenuItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/quizzes', icon: BookOpen, label: 'Browse Quizzes' },
        { path: '/my-attempts', icon: History, label: 'My Attempts' },
        { path: '/achievements', icon: Award, label: 'Achievements' },
        { path: '/profile', icon: User, label: 'Profile' },
        { path: '/help', icon: HelpCircle, label: 'Help' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ];

    const menuItems = isAdmin ? adminMenuItems : userMenuItems;

    return (
        <>
            {/* Overlay - only show on mobile/tablet when sidebar is open */}
            {isOpen && (
                <div
                    className="fixed inset-0 backdrop-blur-sm bg-white/30 z-40 transition-all duration-300 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar - Full height fixed on desktop (lg+), slideable on mobile */}
            <aside
                className={`fixed top-0 left-0 h-screen w-64 bg-white  z-[60] transform transition-transform duration-300 ease-in-out 
                    lg:translate-x-0
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg flex items-center justify-center">
                            <span className="text-orange-500 font-bold text-lg">F</span>
                        </div>
                        <span className="text-lg font-bold text-gray-800">
                            Fablead<span className="text-orange-500">Quiz</span>
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors lg:hidden"
                        aria-label="Close sidebar"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* User Info */}
                {user && (
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center space-x-3">
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
                            <div>
                                <p className="text-sm text-gray-500">Welcome back,</p>
                                <p className="font-semibold text-gray-800">{user.username}</p>
                                <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${isAdmin ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                    {user.role}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Menu */}
                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-3">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        onClick={handleLinkClick}
                                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${active
                                                ? 'bg-orange-50 text-orange-600'
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                            }`}
                                    >
                                        <Icon size={18} className={active ? 'text-orange-500' : 'text-gray-400'} />
                                        <span className="font-medium text-sm">{item.label}</span>
                                        {active && (
                                            <span className="ml-auto w-1.5 h-1.5 bg-orange-500 rounded-full" />
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Sidebar Footer */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white lg:bg-gray-50">
                    <p className="text-xs text-gray-400 text-center">
                        {isAdmin ? 'Fablead Admin Panel' : 'Fablead Quiz Platform'}
                    </p>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
