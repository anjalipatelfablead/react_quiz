import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getAllResults, reset } from '../redux/slices/resultSlice';
import userService from '../services/user_service';
import {
    History,
    Trophy,
    Clock,
    Calendar,
    ArrowRight,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    User,
    Mail,
    TrendingUp,
    Award,
    ArrowLeft,
    Eye
} from 'lucide-react';

const UserAttempts = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userId } = useParams();
    const { user: currentUser } = useSelector((state) => state.auth);
    const { results, isLoading } = useSelector((state) => state.result);
    const { darkMode } = useSelector((state) => state.theme);
    const [userDetails, setUserDetails] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        // Check if user is admin
        if (currentUser?.role !== 'admin') {
            navigate('/dashboard');
            return;
        }
        dispatch(getAllResults());
        fetchUserDetails();
        return () => {
            dispatch(reset());
        };
    }, [dispatch, currentUser, navigate, userId]);

    const fetchUserDetails = async () => {
        try {
            const response = await userService.getUserById(userId);
            setUserDetails(response.user || response);
        } catch (error) {
            console.error('Failed to fetch user details:', error);
        }
    };

    // Filter results for this user only
    const userResults = results?.filter(result => {
        const resultUserId = result.userId?._id || result.userId;
        return resultUserId === userId;
    }) || [];

    // Sort by date (newest first)
    const sortedResults = [...userResults].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Calculate pagination
    const totalPages = Math.ceil(sortedResults.length / itemsPerPage);
    const paginatedResults = sortedResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatTime = (seconds) => {
        if (!seconds || seconds <= 0) return 'N/A';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const getScorePercentage = (score, totalMarks) => {
        if (!totalMarks || totalMarks === 0) return 0;
        return Math.round((score / totalMarks) * 100);
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

    const handleViewReview = (result) => {
        navigate(`/quizzes/${result.quizId?._id || result.quizId}/review/${result._id}`);
    };

    const handleBackToReports = () => {
        navigate('/reports');
    };

    // Calculate user stats
    const userStats = {
        totalAttempts: userResults.length,
        bestScore: userResults.length > 0 
            ? Math.max(...userResults.map(r => getScorePercentage(r.score, r.totalMarks)))
            : 0,
        averageScore: userResults.length > 0
            ? Math.round(userResults.reduce((acc, r) => acc + getScorePercentage(r.score, r.totalMarks), 0) / userResults.length)
            : 0,
        avgTime: userResults.length > 0
            ? Math.round(userResults.reduce((acc, r) => acc + (r.timeTaken || 0), 0) / userResults.length)
            : 0
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
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={handleBackToReports}
                    className={`flex items-center gap-2 mb-6 transition-colors ${darkMode ? 'text-gray-400 hover:text-orange-400' : 'text-gray-600 hover:text-gray-800'}`}
                >
                    <ArrowLeft size={20} />
                    Back to Reports
                </button>

                {/* User Info Header */}
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-md p-6 mb-8 border transition-colors`}>
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                            {userDetails?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                            <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                {userDetails?.username || 'Unknown User'}
                            </h1>
                            <div className={`flex flex-wrap items-center gap-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                <span className="flex items-center gap-2">
                                    <Mail size={18} />
                                    {userDetails?.email || 'N/A'}
                                </span>
                                <span className="flex items-center gap-2">
                                    <User size={18} />
                                    {userDetails?.role || 'user'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-md p-6 border transition-colors`}>
                        <div className="flex items-center gap-3">
                            <div className={`${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'} p-3 rounded-lg`}>
                                <BookOpen className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{userStats.totalAttempts}</p>
                                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Total Attempts</p>
                            </div>
                        </div>
                    </div>
                    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-md p-6 border transition-colors`}>
                        <div className="flex items-center gap-3">
                            <div className={`${darkMode ? 'bg-green-900/30' : 'bg-green-100'} p-3 rounded-lg`}>
                                <Trophy className="text-green-600" size={24} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{userStats.bestScore}%</p>
                                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Best Score</p>
                            </div>
                        </div>
                    </div>
                    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-md p-6 border transition-colors`}>
                        <div className="flex items-center gap-3">
                            <div className={`${darkMode ? 'bg-purple-900/30' : 'bg-purple-100'} p-3 rounded-lg`}>
                                <TrendingUp className="text-purple-600" size={24} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{userStats.averageScore}%</p>
                                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Average Score</p>
                            </div>
                        </div>
                    </div>
                    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-md p-6 border transition-colors`}>
                        <div className="flex items-center gap-3">
                            <div className={`${darkMode ? 'bg-orange-900/30' : 'bg-orange-100'} p-3 rounded-lg`}>
                                <Clock className="text-orange-600" size={24} />
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{formatTime(userStats.avgTime)}</p>
                                <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Avg Time</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attempts List */}
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-xl shadow-md overflow-hidden border transition-colors`}>
                    <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-3">
                            <History className="text-orange-500" size={24} />
                            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Quiz Attempts History</h2>
                        </div>
                    </div>

                    {sortedResults.length > 0 ? (
                        <>
                            <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                                {paginatedResults.map((result, index) => {
                                    const percentage = getScorePercentage(result.score, result.totalMarks);
                                    const scoreColor = getScoreColor(percentage);
                                    const scoreTextColor = getScoreTextColor(percentage);
                                    const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;

                                    return (
                                        <div key={result._id} className={`p-6 transition-colors ${darkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}`}>
                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                                {/* Left: Quiz Info */}
                                                <div className="flex items-start gap-4 flex-1">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
                                                        darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {globalIndex}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className={`text-lg font-semibold mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                                            {result.quizId?.title || 'Unknown Quiz'}
                                                        </h3>
                                                        <div className={`flex flex-wrap items-center gap-4 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                                            <span className="flex items-center gap-1">
                                                                <Calendar size={14} />
                                                                {formatDate(result.createdAt)}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock size={14} />
                                                                {formatTime(result.timeTaken)}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Trophy size={14} />
                                                                {result.score}/{result.totalMarks} marks
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Middle: Progress Bar */}
                                                <div className="flex-1 max-w-md">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Score</span>
                                                        <span className={`text-sm font-bold ${scoreTextColor}`}>{percentage}%</span>
                                                    </div>
                                                    <div className={`w-full rounded-full h-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                                        <div
                                                            className={`${scoreColor} h-3 rounded-full transition-all duration-500`}
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                {/* Right: Actions */}
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleViewReview(result)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium shadow-md"
                                                    >
                                                        <Eye size={16} />
                                                        View Review
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className={`p-4 border-t flex items-center justify-between ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                    <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedResults.length)} of {sortedResults.length} attempts
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
                            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>No Attempts Found</h3>
                            <p className={darkMode ? 'text-gray-500' : 'text-gray-500'}>This user hasn't taken any quizzes yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserAttempts;
