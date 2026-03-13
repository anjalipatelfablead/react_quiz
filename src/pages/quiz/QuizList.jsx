import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllQuizzes, deleteQuiz, reset, updateQuiz } from '../../redux/slices/quizSlice';
import resultService from '../../services/result_service';
import questionService from '../../services/question_service';
import { toast } from "react-toastify";
import { BookOpen, Plus, Search, Filter, Clock, Tag, Edit, Trash2, Eye, MoreVertical,
    CheckCircle, XCircle, AlertCircle, Globe, Power, PowerOff,
    Users, Archive, ArchiveRestore, ChevronLeft, ChevronRight, } from 'lucide-react';

const QuizList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { quizzes, isLoading, isError, message } = useSelector((state) => state.quiz);
    const { darkMode } = useSelector((state) => state.theme);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, categoryFilter]);

    //   const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [quizToDelete, setQuizToDelete] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [attemptedQuizzes, setAttemptedQuizzes] = useState(new Set());
    const [quizAttemptCounts, setQuizAttemptCounts] = useState({});
    const [quizQuestionCounts, setQuizQuestionCounts] = useState({});
    const [publishingQuizId, setPublishingQuizId] = useState(null);
    const [togglingActiveId, setTogglingActiveId] = useState(null);
    const [archivingQuizId, setArchivingQuizId] = useState(null);

    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        dispatch(getAllQuizzes());
        if (!isAdmin) {
            fetchUserAttempts();
        } else {
            fetchAllAttempts();
            fetchAllQuizQuestionCounts();
        }
        return () => {
            dispatch(reset());
        };
    }, [dispatch, isAdmin]);

    const fetchUserAttempts = async () => {
        try {
            const results = await resultService.getUserResults();
            const userResults = Array.isArray(results) ? results : results.results || [];
            const attemptedQuizIds = new Set(
                userResults.map(r => r.quizId?._id || r.quizId)
            );
            setAttemptedQuizzes(attemptedQuizIds);
        } catch (error) {
            console.error('Failed to fetch user attempts:', error);
        }
    };

    const fetchAllAttempts = async () => {
        try {
            const results = await resultService.getAllResults();
            const allResults = Array.isArray(results) ? results : results.results || [];
            const attemptedQuizIds = new Set(
                allResults.map(r => r.quizId?._id || r.quizId)
            );
            setAttemptedQuizzes(attemptedQuizIds);
            
            // Calculate attempt counts per quiz
            const attemptCounts = {};
            allResults.forEach(r => {
                const quizId = r.quizId?._id || r.quizId;
                if (quizId) {
                    attemptCounts[quizId] = (attemptCounts[quizId] || 0) + 1;
                }
            });
            setQuizAttemptCounts(attemptCounts);
        } catch (error) {
            console.error('Failed to fetch all attempts:', error);
        }
    };

    const fetchAllQuizQuestionCounts = async () => {
        try {
            const counts = {};
            for (const quiz of quizzes) {
                try {
                    const questions = await questionService.getQuestionsByQuiz(quiz._id);
                    counts[quiz._id] = questions.length || 0;
                } catch (error) {
                    counts[quiz._id] = 0;
                }
            }
            setQuizQuestionCounts(counts);
        } catch (error) {
            console.error('Failed to fetch question counts:', error);
        }
    };

    const handlePublish = async (quiz) => {
        const questionCount = quizQuestionCounts[quiz._id] || 0;
        if (questionCount < 5) {
            toast.error(`Quiz must have at least 5 questions before publishing. Currently has ${questionCount}.`);
            return;
        }

        setPublishingQuizId(quiz._id);
        try {
            const publishData = {
                title: quiz.title,
                description: quiz.description,
                category: quiz.category,
                timeLimit: quiz.timeLimit,
                status: 'published',
                isActive: true // Set as active by default when publishing
            };
            await dispatch(updateQuiz({ quizId: quiz._id, quizData: publishData }));
            toast.success('Quiz published successfully!');
            dispatch(getAllQuizzes());
        } catch (error) {
            toast.error('Failed to publish quiz');
        } finally {
            setPublishingQuizId(null);
        }
    };

    const handleToggleActive = async (quiz) => {
        setTogglingActiveId(quiz._id);
        try {
            const newStatus = !quiz.isActive;
            const updateData = {
                title: quiz.title,
                description: quiz.description,
                category: quiz.category,
                timeLimit: quiz.timeLimit,
                status: quiz.status,
                isActive: newStatus
            };
            await dispatch(updateQuiz({ quizId: quiz._id, quizData: updateData }));
            toast.success(`Quiz ${newStatus ? 'activated' : 'deactivated'} successfully!`);
            dispatch(getAllQuizzes());
        } catch (error) {
            toast.error('Failed to update quiz status');
        } finally {
            setTogglingActiveId(null);
        }
    };

    const handleArchive = async (quiz, archive = true) => {
        setArchivingQuizId(quiz._id);
        try {
            const updateData = {
                title: quiz.title,
                description: quiz.description,
                category: quiz.category,
                timeLimit: quiz.timeLimit,
                status: archive ? 'archived' : 'published',
                isActive: !archive // Set active when unarchiving, inactive when archiving
            };
            await dispatch(updateQuiz({ quizId: quiz._id, quizData: updateData }));
            toast.success(`Quiz ${archive ? 'archived' : 'published'} successfully!`);
            dispatch(getAllQuizzes());
        } catch (error) {
            toast.error(`Failed to ${archive ? 'archive' : 'publish'} quiz`);
        } finally {
            setArchivingQuizId(null);
        }
    };

    // Get unique categories
    const categories = [...new Set(quizzes.map(q => q.category))];

    // Filter quizzes - users only see published and active quizzes (not archived)
    const filteredQuizzes = quizzes.filter(quiz => {
        // For users, only show published quizzes that are not archived
        if (!isAdmin) {
            if (quiz.status !== 'published' || quiz.status === 'archived') return false;
        }

        const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || quiz.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || quiz.category === categoryFilter;
        return matchesSearch && matchesStatus && matchesCategory;
    });

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentQuizzes = filteredQuizzes.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredQuizzes.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // const handleDelete = async (quizId) => {
    //     if (deleteConfirm === quizId) {
    //         await dispatch(deleteQuiz(quizId));
    //         setDeleteConfirm(null);
    //     } else {
    //         setDeleteConfirm(quizId);
    //     }
    // };

    const openDeleteModal = (quizId) => {
        setQuizToDelete(quizId);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (quizToDelete) {
            await dispatch(deleteQuiz(quizToDelete));
            setIsDeleteModalOpen(false);
            setQuizToDelete(null);
        }
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setQuizToDelete(null);
    };

    const getStatusBadge = (status) => {
        const styles = {
            published: 'bg-green-100 text-green-600',
            draft: 'bg-yellow-100 text-yellow-600',
            archived: 'bg-gray-100 text-gray-600'
        };
        const icons = {
            published: CheckCircle,
            draft: AlertCircle,
            archived: XCircle
        };
        const Icon = icons[status] || AlertCircle;
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.draft}`}>
                <Icon size={12} className="mr-1" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
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
            <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-primary-100 to-primary-400'} flex items-center justify-center`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
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
                                <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                    <span className="text-orange-500">Quizzes</span>
                                </h1>
                                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                                    {isAdmin ? 'Manage all quizzes from here.' : 'Browse available quizzes to test your knowledge.'}
                                </p>
                            </div>
                            {isAdmin && (
                                <button
                                    onClick={() => navigate('/quizzes/create')}
                                    className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                                >
                                    <Plus size={20} className="mr-2" />
                                    Create Quiz
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filters */}
                    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md p-4 mb-6 border`}>
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search quizzes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-200 text-gray-800'}`}
                                />
                            </div>

                            {/* Status Filter */}
                            {isAdmin && (
                                <div className="flex items-center gap-2">
                                    <Filter size={20} className="text-gray-400" />
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-800'}`}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="published">Published</option>
                                        <option value="draft">Draft</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                            )}

                            {/* Category Filter */}
                            <div className="flex items-center gap-2">
                                <Tag size={20} className="text-gray-400" />
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200 text-gray-800'}`}
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {isError && (
                        <div className={`${darkMode ? 'bg-red-900/20 border-red-900/30 text-red-400' : 'bg-red-50 border-red-200 text-red-600'} border rounded-xl p-4 mb-6`}>
                            <div className="flex items-center">
                                <AlertCircle size={20} className="mr-2" />
                                <span>{message}</span>
                            </div>
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md p-4 border`}>
                            <div className="flex items-center space-x-3">
                                <div className={`${darkMode ? 'bg-blue-900/30' : 'bg-blue-100'} p-2 rounded-lg`}>
                                    <BookOpen size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                        {isAdmin ? quizzes.length : quizzes.filter(q => q.status === 'published').length}
                                    </p>
                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{isAdmin ? 'Total Quizzes' : 'Available Quizzes'}</p>
                                </div>
                            </div>
                        </div>
                        {isAdmin && (
                            <>
                                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md p-4 border`}>
                                    <div className="flex items-center space-x-3">
                                        <div className={`${darkMode ? 'bg-green-900/30' : 'bg-green-100'} p-2 rounded-lg`}>
                                            <CheckCircle size={20} className="text-green-600" />
                                        </div>
                                        <div>
                                            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                                {quizzes.filter(q => q.status === 'published').length}
                                            </p>
                                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Published</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md p-4 border`}>
                                    <div className="flex items-center space-x-3">
                                        <div className={`${darkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'} p-2 rounded-lg`}>
                                            <AlertCircle size={20} className="text-yellow-600" />
                                        </div>
                                        <div>
                                            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                                {quizzes.filter(q => q.status === 'draft').length}
                                            </p>
                                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Drafts</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md p-4 border`}>
                                    <div className="flex items-center space-x-3">
                                        <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded-lg`}>
                                            <Archive size={20} className="text-gray-600" />
                                        </div>
                                        <div>
                                            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                                {quizzes.filter(q => q.status === 'archived').length}
                                            </p>
                                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Archived</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md p-4 border`}>
                            <div className="flex items-center space-x-3">
                                <div className={`${darkMode ? 'bg-purple-900/30' : 'bg-purple-100'} p-2 rounded-lg`}>
                                    <Tag size={20} className="text-purple-600" />
                                </div>
                                <div>
                                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{categories.length}</p>
                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Categories</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quiz Grid */}
                    {filteredQuizzes.length === 0 ? (
                        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md p-12 text-center border`}>
                            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                            <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>No quizzes found</h3>
                            <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                                {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                                    ? 'Try adjusting your filters'
                                    : isAdmin
                                        ? 'Create your first quiz to get started'
                                        : 'No quizzes available at the moment'}
                            </p>
                            {isAdmin && (
                                <button
                                    onClick={() => navigate('/quizzes/create')}
                                    className="mt-4 inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                                >
                                    <Plus size={20} className="mr-2" />
                                    Create Quiz
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {currentQuizzes.map((quiz) => (
                                <div
                                    key={quiz._id}
                                    className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-md border overflow-hidden hover:shadow-lg transition-all duration-300`}
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-1 line-clamp-1`}>{quiz.title}</h3>
                                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} line-clamp-2`}>{quiz.description}</p>
                                            </div>
                                            {isAdmin && (
                                                <div className="relative ml-2">
                                                    <div className="ml-2 flex items-center space-x-1">
                                                        {quiz.status === 'draft' && (
                                                            <button
                                                                onClick={() => handlePublish(quiz)}
                                                                disabled={publishingQuizId === quiz._id || (quizQuestionCounts[quiz._id] || 0) < 5}
                                                                className={`p-2 rounded-lg transition-colors ${(quizQuestionCounts[quiz._id] || 0) >= 5
                                                                    ? 'text-gray-500 hover:text-green-500 hover:bg-green-50'
                                                                    : 'text-gray-300 cursor-not-allowed'
                                                                    }`}
                                                                title={(quizQuestionCounts[quiz._id] || 0) < 5
                                                                    ? `Add ${5 - (quizQuestionCounts[quiz._id] || 0)} more question${(quizQuestionCounts[quiz._id] || 0) === 4 ? '' : 's'} to publish`
                                                                    : 'Publish quiz'}
                                                            >
                                                                <Globe size={16} />
                                                            </button>
                                                        )}
                                                        {/* Activate/Deactivate button for published quizzes */}
                                                        {quiz.status === 'published' && (
                                                            <button
                                                                onClick={() => handleToggleActive(quiz)}
                                                                disabled={togglingActiveId === quiz._id}
                                                                className={`p-2 rounded-lg transition-colors ${quiz.isActive !== false
                                                                    ? 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                                                                    : 'text-gray-500 hover:text-green-500 hover:bg-green-50'
                                                                    }`}
                                                                title={quiz.isActive !== false ? 'Deactivate quiz' : 'Activate quiz'}
                                                            >
                                                                {togglingActiveId === quiz._id ? (
                                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                                                                ) : quiz.isActive !== false ? (
                                                                    <PowerOff size={16} />
                                                                ) : (
                                                                    <Power size={16} />
                                                                )}
                                                            </button>
                                                        )}
                                                        {/* Archive button for published quizzes */}
                                                        {quiz.status === 'published' && (
                                                            <button
                                                                onClick={() => handleArchive(quiz, true)}
                                                                disabled={archivingQuizId === quiz._id}
                                                                className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                                                                title="Archive quiz"
                                                            >
                                                                {archivingQuizId === quiz._id ? (
                                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                                                                ) : (
                                                                    <Archive size={16} />
                                                                )}
                                                            </button>
                                                        )}
                                                        {/* Publish again button for archived quizzes */}
                                                        {quiz.status === 'archived' && (
                                                            <button
                                                                onClick={() => handleArchive(quiz, false)}
                                                                disabled={archivingQuizId === quiz._id}
                                                                className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                                                title="Publish again"
                                                            >
                                                                {archivingQuizId === quiz._id ? (
                                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                                                                ) : (
                                                                    <ArchiveRestore size={16} />
                                                                )}
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => navigate(`/quizzes/edit/${quiz._id}`)}
                                                            disabled={quiz.status === 'archived'}
                                                            className={`p-2 rounded-lg transition-colors ${quiz.status === 'archived'
                                                                ? 'text-gray-300 cursor-not-allowed'
                                                                : 'text-gray-500 hover:text-orange-500 hover:bg-orange-50'
                                                                }`}
                                                            title={quiz.status === 'archived' ? 'Cannot edit archived quiz' : 'Edit quiz'}
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteModal(quiz._id)}
                                                            disabled={attemptedQuizzes.has(quiz._id) || quiz.status === 'archived'}
                                                            className={`p-2 rounded-lg transition-colors ${attemptedQuizzes.has(quiz._id) || quiz.status === 'archived'
                                                                ? 'text-gray-300 cursor-not-allowed'
                                                                : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                                                                }`}
                                                            title={quiz.status === 'archived' ? 'Cannot delete archived quiz' : attemptedQuizzes.has(quiz._id) ? 'Cannot delete - quiz has been attempted' : 'Delete quiz'}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                {isAdmin && (
                                                    <>
                                                        {getStatusBadge(quiz.status)}
                                                        {/* Show Active/Inactive badge for published quizzes */}
                                                        {quiz.status === 'published' && (
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${quiz.isActive !== false
                                                                ? 'bg-green-100 text-green-600'
                                                                : 'bg-red-100 text-red-600'
                                                                }`}>
                                                                {quiz.isActive !== false ? 'Active' : 'Inactive'}
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                            <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                                {isAdmin
                                                    ? formatDate(quiz.createdAt)
                                                    : `Published on ${formatDate(quiz.createdAt)}`
                                                }
                                            </span>
                                        </div>

                                        <div className={`flex items-center space-x-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                                            <div className="flex items-center">
                                                <Tag size={14} className="mr-1 text-orange-500" />
                                                <span>{quiz.category}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Clock size={14} className="mr-1 text-orange-500" />
                                                <span>{quiz.timeLimit} min</span>
                                            </div>
                                            {isAdmin && (
                                                <div className="flex items-center">
                                                    <Users size={14} className="mr-1 text-orange-500" />
                                                    <span>{quizAttemptCounts[quiz._id] || 0} attempted</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className={`flex items-center justify-between pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                            <div className={`flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                <span>By {quiz.createdBy?.username || 'Unknown'}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {/* Show Start button for all published quizzes (user side) */}
                                                {!isAdmin && quiz.status === 'published' && (
                                                    attemptedQuizzes.has(quiz._id) ? (
                                                        <span className={`inline-flex items-center px-3 py-1.5 text-sm font-medium ${darkMode ? 'text-gray-500' : 'text-gray-400'} cursor-not-allowed`}>
                                                            ✓ Completed
                                                        </span>
                                                    ) : (
                                                        <button
                                                            onClick={() => {
                                                                if (quiz.isActive !== false) {
                                                                    navigate(`/quizzes/${quiz._id}/take`);
                                                                }
                                                            }}
                                                            disabled={quiz.isActive === false}
                                                            className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors
                                                            ${quiz.isActive === false
                                                                    ? (darkMode ? 'text-gray-500 bg-gray-700 cursor-not-allowed' : 'text-gray-400 bg-gray-100 cursor-not-allowed')
                                                                    : (darkMode ? 'text-green-400 hover:text-green-300 hover:bg-green-400/10' : 'text-green-600 hover:text-green-700 hover:bg-green-50')
                                                                }`}
                                                            title={quiz.isActive === false ? 'Temporarily deactivated' : 'Start quiz'}
                                                        >
                                                            {quiz.isActive === false ? 'Temporarily Deactivated' : '▶ Start'}
                                                        </button>
                                                    )
                                                )}

                                                {isAdmin && (
                                                    <button
                                                        onClick={() => navigate(`/quizzes/${quiz._id}/questions`)}
                                                        disabled={quiz.status === 'archived'}
                                                        className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${quiz.status === 'archived'
                                                            ? (darkMode ? 'text-gray-500 bg-gray-700 cursor-not-allowed' : 'text-gray-400 bg-gray-100 cursor-not-allowed')
                                                            : (darkMode ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-400/10' : 'text-blue-600 hover:text-blue-700 hover:bg-blue-50')
                                                            }`}
                                                        title={quiz.status === 'archived' ? 'Cannot manage questions for archived quiz' : 'Manage questions'}
                                                    >
                                                        Questions
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => navigate(`/quizzes/${quiz._id}`)}
                                                    className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${darkMode ? 'text-orange-400 hover:text-orange-300 hover:bg-orange-400/10' : 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'}`}
                                                >
                                                    <Eye size={16} className="mr-1" />
                                                    View
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center items-center space-x-2">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`p-2 rounded-lg border transition-colors ${
                                        currentPage === 1
                                        ? (darkMode ? 'text-gray-600 border-gray-800' : 'text-gray-300 border-gray-100')
                                        : (darkMode ? 'text-gray-300 border-gray-700 hover:bg-gray-800 cursor-pointer' : 'text-gray-600 border-gray-200 hover:bg-gray-50 cursor-pointer')
                                    }`}
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                
                                <div className="flex items-center space-x-1">
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => paginate(i + 1)}
                                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors  ${
                                                currentPage === i + 1
                                                ? 'bg-orange-500 text-white'
                                                : (darkMode 
                                                    ? 'text-gray-400 hover:bg-gray-800 hover:text-white cursor-pointer' 
                                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 cursor-pointer')
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`p-2 rounded-lg border transition-colors ${
                                        currentPage === totalPages
                                        ? (darkMode ? 'text-gray-600 border-gray-800' : 'text-gray-300 border-gray-100')
                                        : (darkMode ? 'text-gray-300 border-gray-700 hover:bg-gray-800 cursor-pointer' : 'text-gray-600 border-gray-200 hover:bg-gray-50 cursor-pointer')
                                    }`}
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </>
                )}
                </div>
            </div>

            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Overlay */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={closeDeleteModal}
                    ></div>

                    {/* Modal */}
                    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} relative rounded-xl shadow-xl w-full max-w-md p-6 z-10 animate-fadeIn border`}>
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-red-100 rounded-full">
                                <AlertCircle className="text-red-600" size={24} />
                            </div>
                            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                Confirm Deletion
                            </h3>
                        </div>

                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                            Are you sure you want to delete this quiz? This action cannot be undone.
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

export default QuizList;
