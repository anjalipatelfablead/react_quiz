import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getUserResults, reset } from '../redux/slices/resultSlice';
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
    Search
} from 'lucide-react';

const MyAttempts = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { results, isLoading } = useSelector((state) => state.result);
    const { darkMode } = useSelector((state) => state.theme);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const itemsPerPage = 10;

    useEffect(() => {
        dispatch(getUserResults());
        return () => {
            dispatch(reset());
        };
    }, [dispatch]);

    // Filter results based on search term
    const filteredResults = results?.filter(result =>
        result.quizId?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    // Calculate pagination
    const totalPages = Math.ceil((filteredResults.length || 0) / itemsPerPage);
    const paginatedResults = filteredResults.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <History className="text-orange-500" size={32} />
                        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>My Attempts</h1>
                    </div>
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>View your quiz history and track your progress</p>
                </div>

                {/* Stats Summary */}
                {results && results.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className={`${darkMode ? 'bg-gray-800 border-gray-700 border' : 'bg-white'} rounded-xl shadow-md p-6 transition-colors`}>
                            <div className="flex items-center gap-3">
                                <div className={`${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'} p-3 rounded-lg`}>
                                    <BookOpen className="text-blue-600" size={24} />
                                </div>
                                <div>
                                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{results.length}</p>
                                    <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Total Attempts</p>
                                </div>
                            </div>
                        </div>
                        <div className={`${darkMode ? 'bg-gray-800 border-gray-700 border' : 'bg-white'} rounded-xl shadow-md p-6 transition-colors`}>
                            <div className="flex items-center gap-3">
                                <div className={`${darkMode ? 'bg-green-900/30' : 'bg-green-100'} p-3 rounded-lg`}>
                                    <Trophy className="text-green-600" size={24} />
                                </div>
                                <div>
                                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        {Math.max(...results.map(r => getScorePercentage(r.score, r.totalMarks)))}%
                                    </p>
                                    <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Best Score</p>
                                </div>
                            </div>
                        </div>
                        <div className={`${darkMode ? 'bg-gray-800 border-gray-700 border' : 'bg-white'} rounded-xl shadow-md p-6 transition-colors`}>
                            <div className="flex items-center gap-3">
                                <div className={`${darkMode ? 'bg-purple-900/30' : 'bg-purple-100'} p-3 rounded-lg`}>
                                    <Trophy className="text-purple-600" size={24} />
                                </div>
                                <div>
                                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        {Math.round(results.reduce((acc, r) => acc + getScorePercentage(r.score, r.totalMarks), 0) / results.length)}%
                                    </p>
                                    <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Average Score</p>
                                </div>
                            </div>
                        </div>
                        <div className={`${darkMode ? 'bg-gray-800 border-gray-700 border' : 'bg-white'} rounded-xl shadow-md p-6 transition-colors`}>
                            <div className="flex items-center gap-3">
                                <div className={`${darkMode ? 'bg-orange-900/30' : 'bg-orange-100'} p-3 rounded-lg`}>
                                    <Clock className="text-orange-600" size={24} />
                                </div>
                                <div>
                                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        {formatTime(Math.round(results.reduce((acc, r) => acc + (r.timeTaken || 0), 0) / results.length))}
                                    </p>
                                    <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>Avg Time</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Attempts List */}
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700 border' : 'bg-white'} rounded-xl shadow-md overflow-hidden transition-colors`}>
                    <div className={`p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Quiz History</h2>
                        <div className="relative max-w-sm w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by quiz title..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1); // Reset to first page on search
                                }}
                                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
                                    darkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500' 
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                }`}
                            />
                        </div>
                    </div>

                    {filteredResults && filteredResults.length > 0 ? (
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
                                                        View Review
                                                        <ArrowRight size={16} />
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
                                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredResults.length)} of {filteredResults.length} attempts
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
                    ) : searchTerm ? (
                        <div className="p-12 text-center">
                            <Search size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-700' : 'text-gray-300'}`} />
                            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>No Results Found</h3>
                            <p className={`${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-6`}>No attempts match your search term "{searchTerm}".</p>
                            <button
                                onClick={() => setSearchTerm('')}
                                className={`px-6 py-2 border rounded-lg transition-colors font-medium ${
                                    darkMode 
                                    ? 'border-orange-500 text-orange-500 hover:bg-orange-500/10' 
                                    : 'border-orange-500 text-orange-500 hover:bg-orange-50'
                                }`}
                            >
                                Clear Search
                            </button>
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <AlertCircle size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-700' : 'text-gray-300'}`} />
                            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>No Attempts Yet</h3>
                            <p className={`${darkMode ? 'text-gray-500' : 'text-gray-500'} mb-6`}>You haven't taken any quizzes yet. Start exploring quizzes to see your attempts here.</p>
                            <button
                                onClick={() => navigate('/quizzes')}
                                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium shadow-md"
                            >
                                Browse Quizzes
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyAttempts;
