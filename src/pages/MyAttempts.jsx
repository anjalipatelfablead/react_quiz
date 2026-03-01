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
    BookOpen
} from 'lucide-react';

const MyAttempts = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { results, isLoading } = useSelector((state) => state.result);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        dispatch(getUserResults());
        return () => {
            dispatch(reset());
        };
    }, [dispatch]);

    // Calculate pagination
    const totalPages = Math.ceil((results?.length || 0) / itemsPerPage);
    const paginatedResults = results?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) || [];

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
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <History className="text-orange-500" size={32} />
                        <h1 className="text-3xl font-bold text-gray-800">My Attempts</h1>
                    </div>
                    <p className="text-gray-600">View your quiz history and track your progress</p>
                </div>

                {/* Stats Summary */}
                {results && results.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <BookOpen className="text-blue-600" size={24} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">{results.length}</p>
                                    <p className="text-sm text-gray-500">Total Attempts</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <Trophy className="text-green-600" size={24} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {Math.max(...results.map(r => getScorePercentage(r.score, r.totalMarks)))}%
                                    </p>
                                    <p className="text-sm text-gray-500">Best Score</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <Trophy className="text-purple-600" size={24} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {Math.round(results.reduce((acc, r) => acc + getScorePercentage(r.score, r.totalMarks), 0) / results.length)}%
                                    </p>
                                    <p className="text-sm text-gray-500">Average Score</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-orange-100 rounded-lg">
                                    <Clock className="text-orange-600" size={24} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {formatTime(Math.round(results.reduce((acc, r) => acc + (r.timeTaken || 0), 0) / results.length))}
                                    </p>
                                    <p className="text-sm text-gray-500">Avg Time</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Attempts List */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">Quiz History</h2>
                    </div>

                    {results && results.length > 0 ? (
                        <>
                            <div className="divide-y divide-gray-200">
                                {paginatedResults.map((result, index) => {
                                    const percentage = getScorePercentage(result.score, result.totalMarks);
                                    const scoreColor = getScoreColor(percentage);
                                    const scoreTextColor = getScoreTextColor(percentage);
                                    const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;

                                    return (
                                        <div key={result._id} className="p-6 hover:bg-gray-50 transition-colors">
                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                                {/* Left: Quiz Info */}
                                                <div className="flex items-start gap-4 flex-1">
                                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold">
                                                        {globalIndex}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                                            {result.quizId?.title || 'Unknown Quiz'}
                                                        </h3>
                                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
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
                                                        <span className="text-sm font-medium text-gray-600">Score</span>
                                                        <span className={`text-sm font-bold ${scoreTextColor}`}>{percentage}%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-3">
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
                                                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
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
                                <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                                    <p className="text-sm text-gray-500">
                                        Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, results.length)} of {results.length} attempts
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                            disabled={currentPage === 1}
                                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronLeft size={18} />
                                        </button>
                                        <span className="px-4 py-2 text-sm font-medium text-gray-700">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="p-12 text-center">
                            <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Attempts Yet</h3>
                            <p className="text-gray-500 mb-6">You haven't taken any quizzes yet. Start exploring quizzes to see your attempts here.</p>
                            <button
                                onClick={() => navigate('/quizzes')}
                                className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
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
