import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getQuizById, reset, clearCurrentQuiz } from '../../redux/slices/quizSlice';
import {
  BookOpen,
  ArrowLeft,
  Clock,
  Tag,
  User,
  Calendar,
  Edit,
  Play,
  CheckCircle,
  AlertCircle,
  XCircle,
  FileText,
  BarChart3,
  Award
} from 'lucide-react';

const QuizDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const { user } = useSelector((state) => state.auth);
  const { currentQuiz, isLoading, isError, message } = useSelector((state) => state.quiz);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (id) {
      dispatch(getQuizById(id));
    }
    return () => {
      dispatch(reset());
      dispatch(clearCurrentQuiz());
    };
  }, [dispatch, id]);

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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status] || styles.draft}`}>
        <Icon size={16} className="mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-100 to-primary-400 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-100 to-primary-400">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/quizzes')}
            className="inline-flex items-center text-gray-600 hover:text-orange-500 transition-colors mb-4"
          >
            <ArrowLeft size={20} className="mr-1" />
            Back to Quizzes
          </button>
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Quiz</h2>
            <p className="text-gray-600">{message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-100 to-primary-400">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/quizzes')}
            className="inline-flex items-center text-gray-600 hover:text-orange-500 transition-colors mb-4"
          >
            <ArrowLeft size={20} className="mr-1" />
            Back to Quizzes
          </button>
          <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-100">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">Quiz Not Found</h2>
            <p className="text-gray-600">The quiz you are looking for does not exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-100 to-primary-400">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/quizzes')}
          className="inline-flex items-center text-gray-600 hover:text-orange-500 transition-colors mb-6"
        >
          <ArrowLeft size={20} className="mr-1" />
          Back to Quizzes
        </button>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  {getStatusBadge(currentQuiz.status)}
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-600">
                    <Tag size={14} className="mr-1" />
                    {currentQuiz.category}
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                  {currentQuiz.title}
                </h1>
                <p className="text-gray-600">{currentQuiz.description}</p>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                {isAdmin && (
                  <button
                    onClick={() => navigate(`/quizzes/edit/${currentQuiz._id}`)}
                    className="inline-flex items-center justify-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
                  >
                    <Edit size={18} className="mr-2" />
                    Edit Quiz
                  </button>
                )}
                {currentQuiz.status === 'published' && (
                  <button
                    onClick={() => navigate(`/quizzes/take/${currentQuiz._id}`)}
                    className="inline-flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                  >
                    <Play size={18} className="mr-2" />
                    Start Quiz
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quiz Info Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Time Limit */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock size={20} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-800">{currentQuiz.timeLimit} min</p>
                    <p className="text-sm text-gray-500">Time Limit</p>
                  </div>
                </div>
              </div>

              {/* Created By */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-800">
                      {currentQuiz.createdBy?.username || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500">Created By</p>
                  </div>
                </div>
              </div>

              {/* Created Date */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-800">
                      {new Date(currentQuiz.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">Created On</p>
                  </div>
                </div>
              </div>

              {/* Questions Count (Placeholder) */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-800">-</p>
                    <p className="text-sm text-gray-500">Questions</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-6">
              {/* Quiz Details Section */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <BarChart3 size={20} className="mr-2 text-orange-500" />
                  Quiz Details
                </h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                    <span className="text-gray-600">Quiz ID</span>
                    <span className="font-mono text-sm text-gray-800">{currentQuiz._id}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="text-gray-800">{formatDate(currentQuiz.updatedAt)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                    <span className="text-gray-600">Status</span>
                    <span className="capitalize text-gray-800">{currentQuiz.status}</span>
                  </div>
                </div>
              </div>

              {/* Instructions Section */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Award size={20} className="mr-2 text-orange-500" />
                  Instructions
                </h3>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>You have <strong>{currentQuiz.timeLimit} minutes</strong> to complete this quiz.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Once you start the quiz, the timer cannot be paused.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Make sure you have a stable internet connection.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Your score will be calculated based on correct answers.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Status Messages */}
              {currentQuiz.status === 'draft' && isAdmin && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center text-yellow-700">
                    <AlertCircle size={20} className="mr-2" />
                    <span>This quiz is in draft mode. Users cannot see it until you publish it.</span>
                  </div>
                </div>
              )}

              {currentQuiz.status === 'archived' && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center text-gray-600">
                    <XCircle size={20} className="mr-2" />
                    <span>This quiz has been archived and is no longer available for taking.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizDetail;
