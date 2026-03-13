import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllResults, reset } from '../redux/slices/resultSlice';
import resultService from '../services/result_service';
import {
    FileText,
    Users,
    Trophy,
    Clock,
    Calendar,
    ArrowRight,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Search,
    TrendingUp,
    Award,
    BarChart3,
    User
} from 'lucide-react';

const Reports = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { results, isLoading } = useSelector((state) => state.result);
    const { darkMode } = useSelector((state) => state.theme);
    const [allUsers, setAllUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        // Check if user is admin
        if (user?.role !== 'admin') {
            navigate('/dashboard');
            return;
        }
        dispatch(getAllResults());
        fetchUsers();
        return () => {
            dispatch(reset());
        };
    }, [dispatch, user, navigate]);

    const fetchUsers = async () => {
        try {
            const userData = await resultService.getAllResultsWithUsers();
            // Extract unique users from results
            const userMap = new Map();
            if (Array.isArray(userData)) {
                userData.forEach(result => {
                    if (result.userId && !userMap.has(result.userId._id)) {
                        userMap.set(result.userId._id, result.userId);
                    }
                });
            }
            setAllUsers(Array.from(userMap.values()));
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };

    // Group results by user
    const getUserProgressData = () => {
        if (!results || !Array.isArray(results)) return [];
        
        const userProgressMap = new Map();
        
        results.forEach(result => {
            const userId = result.userId?._id || result.userId;
            const userName = result.userId?.username || 'Unknown';
            const userEmail = result.userId?.email || 'N/A';
            
            if (!userProgressMap.has(userId)) {
                userProgressMap.set(userId, {
                    userId,
                    username: userName,
                    email: userEmail,
                    attempts: [],
                    totalScore: 0,
                    totalPossible: 0,
                    bestScore: 0,
                    totalTime: 0
                });
            }
            
            const userData = userProgressMap.get(userId);
            const percentage = result.totalMarks > 0 ? (result.score / result.totalMarks) * 100 : 0;
            
            userData.attempts.push({
                ...result,
                percentage: Math.round(percentage)
            });
            userData.totalScore += result.score;
            userData.totalPossible += result.totalMarks;
            userData.bestScore = Math.max(userData.bestScore, percentage);
            userData.totalTime += result.timeTaken || 0;
        });
        
        return Array.from(userProgressMap.values()).map(user => ({
            ...user,
            averageScore: user.totalPossible > 0 ? Math.round((user.totalScore / user.totalPossible) * 100) : 0,
            attemptCount: user.attempts.length,
            avgTime: user.attempts.length > 0 ? Math.round(user.totalTime / user.attempts.length) : 0
        }));
    };

    const userProgressData = getUserProgressData();
    
    // Filter by search
    const filteredData = userProgressData.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (seconds) => {
        if (!seconds || seconds <= 0) return 'N/A';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const getScoreColor = (percentage) => {
        if (percentage >= 80) return 'bg-green-500';
        if (percentage >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getScoreTextColor = (percentage) => {
        if (percentage >= 80) return 'text-green-600';
        if (percentage >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const handleViewUserAttempts = (userId) => {
        navigate(`/reports/user/${userId}`);
    };

    // Calculate overall stats
    const overallStats = {
        totalUsers: userProgressData.length,
        totalAttempts: results?.length || 0,
        avgScore: userProgressData.length > 0 
            ? Math.round(userProgressData.reduce((acc, u) => acc + u.averageScore, 0) / userProgressData.length)
            : 0,
        topPerformer: userProgressData.length > 0
            ? userProgressData.reduce((max, u) => u.bestScore > max.bestScore ? u : max, userProgressData[0])
            : null
    };

    if (isLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-50 via-white to-orange-100'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 py-8 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-50 via-white to-orange-100'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <FileText className="text-orange-500" size={32} />
                        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Progress Reports</h1>
                    </div>
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>View detailed progress reports of all users</p>
                </div>

                {/* Overall Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className={`${darkMode ? 'bg-gray-800 border-gray-700 border' : 'bg-white'} rounded-xl shadow-md p-6 transition-colors`}>
                        <div className="flex items-center gap-3">
                            <div className={`${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'} p-3 rounded-lg`}>
                                <Users className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{overallStats.totalUsers}</p>
                                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Total attempted Users</p>
                            </div>
                        </div>
                    </div>
                    <div className={`${darkMode ? 'bg-gray-800 border-gray-700 border' : 'bg-white'} rounded-xl shadow-md p-6 transition-colors`}>
                        <div className="flex items-center gap-3">
                            <div className={`${darkMode ? 'bg-purple-900/30' : 'bg-purple-100'} p-3 rounded-lg`}>
                                <BarChart3 className="text-purple-600" size={24} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{overallStats.totalAttempts}</p>
                                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Total Attempts</p>
                            </div>
                        </div>
                    </div>
                    <div className={`${darkMode ? 'bg-gray-800 border-gray-700 border' : 'bg-white'} rounded-xl shadow-md p-6 transition-colors`}>
                        <div className="flex items-center gap-3">
                            <div className={`${darkMode ? 'bg-green-900/30' : 'bg-green-100'} p-3 rounded-lg`}>
                                <TrendingUp className="text-green-600" size={24} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{overallStats.avgScore}%</p>
                                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Average Score</p>
                            </div>
                        </div>
                    </div>
                    <div className={`${darkMode ? 'bg-gray-800 border-gray-700 border' : 'bg-white'} rounded-xl shadow-md p-6 transition-colors`}>
                        <div className="flex items-center gap-3">
                            <div className={`${darkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'} p-3 rounded-lg`}>
                                <Award className="text-yellow-600" size={24} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                    {overallStats.topPerformer ? overallStats.topPerformer.username : 'N/A'}
                                </p>
                                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Top Performer</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700 border' : 'bg-white'} rounded-xl shadow-md p-4 mb-6`}>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by username or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                                darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' 
                                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                            }`}
                        />
                    </div>
                </div>

                {/* User Progress Table */}
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700 border' : 'bg-white'} rounded-xl shadow-md overflow-hidden transition-colors`}>
                    <div className={`p-6 border-b flex items-center justify-between ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>User Progress Report</h2>
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{filteredData.length} users found</span>
                    </div>

                    {filteredData.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className={darkMode ? 'bg-gray-900' : 'bg-gray-50'}>
                                        <tr>
                                            <th className={`px-6 py-4 text-left text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>User</th>
                                            <th className={`px-6 py-4 text-center text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>Attempts</th>
                                            <th className={`px-6 py-4 text-center text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>Average Score</th>
                                            <th className={`px-6 py-4 text-center text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>Best Score</th>
                                            <th className={`px-6 py-4 text-center text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>Avg Time</th>
                                            <th className={`px-6 py-4 text-center text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>Progress</th>
                                            <th className={`px-6 py-4 text-center text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                                        {paginatedData.map((user) => {
                                            const avgScoreColor = getScoreColor(user.averageScore);
                                            const avgScoreTextColor = getScoreTextColor(user.averageScore);
                                            const bestScoreColor = getScoreColor(user.bestScore);

                                            return (
                                                <tr key={user.userId} className={`transition-colors ${darkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}`}>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
                                                                {user.username.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{user.username}</p>
                                                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                            darkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                            {user.attemptCount}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`text-lg font-bold ${avgScoreTextColor}`}>
                                                            {user.averageScore}%
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                                            user.bestScore >= 80 ? (darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700') :
                                                            user.bestScore >= 60 ? (darkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700') :
                                                            (darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700')
                                                        }`}>
                                                            {Math.round(user.bestScore)}%
                                                        </span>
                                                    </td>
                                                    <td className={`px-6 py-4 text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        {formatTime(user.avgTime)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="w-full max-w-xs mx-auto">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Avg</span>
                                                                <span className={`text-xs font-bold ${avgScoreTextColor}`}>{user.averageScore}%</span>
                                                            </div>
                                                            <div className={`w-full bg-gray-200 rounded-full h-2.5 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                                                <div
                                                                    className={`${avgScoreColor} h-2.5 rounded-full transition-all duration-500`}
                                                                    style={{ width: `${user.averageScore}%` }}
                                                                ></div>
                                                            </div>
                                                            <div className="flex items-center justify-between mt-2 mb-1">
                                                                <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Best</span>
                                                                <span className={`text-xs font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{Math.round(user.bestScore)}%</span>
                                                            </div>
                                                            <div className={`w-full bg-gray-200 rounded-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                                                <div
                                                                    className={`${bestScoreColor} h-2 rounded-full transition-all duration-500`}
                                                                    style={{ width: `${user.bestScore}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => handleViewUserAttempts(user.userId)}
                                                            className="inline-flex items-center gap-1 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium shadow-md"
                                                        >
                                                            View
                                                            <ArrowRight size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className={`p-4 border-t flex items-center justify-between ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                    <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} users
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className={`p-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                                darkMode 
                                                ? 'border-gray-600 text-gray-400 hover:bg-gray-700' 
                                                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <span className={`px-4 py-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className={`p-2 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                                darkMode 
                                                ? 'border-gray-600 text-gray-400 hover:bg-gray-700' 
                                                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="p-12 text-center">
                            <AlertCircle size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-700' : 'text-gray-300'}`} />
                            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>No Data Found</h3>
                            <p className={darkMode ? 'text-gray-500' : 'text-gray-500'}>
                                {searchTerm ? 'No users match your search criteria.' : 'No quiz attempts have been recorded yet.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Recent Attempts Section */}
                {results && results.length > 0 && (
                    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} mt-8 rounded-xl shadow-md overflow-hidden  transition-colors`}>
                        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Recent Attempts</h2>
                        </div>
                        <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                            {results.slice(0, 5).map((result) => {
                                const percentage = result.totalMarks > 0 ? Math.round((result.score / result.totalMarks) * 100) : 0;
                                const scoreColor = getScoreColor(percentage);
                                const scoreTextColor = getScoreTextColor(percentage);

                                return (
                                    <div key={result._id} className={`p-4 transition-colors ${darkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold shadow-sm">
                                                    {result.userId?.username?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <div>
                                                    <p className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{result.userId?.username || 'Unknown'}</p>
                                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{result.quizId?.title || 'Unknown Quiz'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className={`text-lg font-bold ${scoreTextColor}`}>{percentage}%</p>
                                                    <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>{formatDate(result.createdAt)}</p>
                                                </div>
                                                <div className="w-24">
                                                    <div className={`w-full rounded-full h-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                                        <div
                                                            className={`${scoreColor} h-2 rounded-full`}
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
