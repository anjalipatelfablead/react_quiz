import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getQuizById, reset, clearCurrentQuiz, updateQuiz } from '../../redux/slices/quizSlice';
import { getQuestionsByQuiz, reset as resetQuestions } from '../../redux/slices/questionSlice';
import resultService from '../../services/result_service';
import { toast } from "react-toastify";
import {
  BookOpen,
  ArrowLeft,
  Clock,
  Tag,
  User,
  Calendar,
  Edit,
  Play,
  Plus,
  CheckCircle,
  AlertCircle,
  XCircle,
  FileText,
  BarChart3,
  Award,
  Globe,
  Power,
  PowerOff
} from 'lucide-react';

const QuizDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { user } = useSelector((state) => state.auth);
  const { currentQuiz, isLoading, isError, message } = useSelector((state) => state.quiz);
  const { questions, isLoading: questionsLoading } = useSelector((state) => state.question);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [userResult, setUserResult] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // Get active status from currentQuiz object (stored in database)
  const isQuizActive = currentQuiz?.isActive !== false; 

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (id) {
      dispatch(getQuizById(id));
      dispatch(getQuestionsByQuiz(id));
      checkUserAttempt();
    }
    return () => {
      dispatch(reset());
      dispatch(clearCurrentQuiz());
      dispatch(resetQuestions());
    };
  }, [dispatch, id]);

  const checkUserAttempt = async () => {
    try {
      const results = await resultService.getUserResults();
      const userResults = Array.isArray(results) ? results : results.results || [];
      const attempt = userResults.find(r => {
        const quizId = r.quizId?._id || r.quizId;
        return quizId === id;
      });
      if (attempt) {
        setHasAttempted(true);
        setUserResult(attempt);
      }
    } catch (error) {
      console.error('Failed to check user attempt:', error);
    }
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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status] || styles.draft}`}>
        <Icon size={16} className="mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handlePublish = async () => {
    if (questions.length < 5) {
      toast.error('Quiz must have at least 5 questions before publishing');
      return;
    }
    
    setIsPublishing(true);
    try {
      const publishData = { 
        title: currentQuiz.title,
        description: currentQuiz.description,
        category: currentQuiz.category,
        timeLimit: currentQuiz.timeLimit,
        status: 'published',
        isActive: true
      };
      await dispatch(updateQuiz({ quizId: id, quizData: publishData }));
      toast.success('Quiz published successfully!');
      // Refresh quiz data
      dispatch(getQuizById(id));
    } catch (error) {
      toast.error('Failed to publish quiz');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleToggleActive = async () => {
    const newStatus = !isQuizActive;
    const updateData = {
      title: currentQuiz.title,
      description: currentQuiz.description,
      category: currentQuiz.category,
      timeLimit: currentQuiz.timeLimit,
      status: currentQuiz.status,
      isActive: newStatus
    };
    await dispatch(updateQuiz({ quizId: id, quizData: updateData }));
    toast.success(`Quiz ${newStatus ? 'activated' : 'deactivated'} successfully!`);
    // Refresh quiz data
    dispatch(getQuizById(id));
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
    {/* <div className="min-h-screen bg-white"> */}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/quizzes')}
          className="inline-flex items-center text-gray-600 hover:text-orange-500 transition-colors  overflow-hidden"
        >
          <ArrowLeft size={20} className="mr-1" />
          Back to Quizzes
        </button>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {/* <div className=" bg-gradient-to-b from-primary-100 to-primary-400"> */}

          {/* Header */}
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  {isAdmin && getStatusBadge(currentQuiz.status)}
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
                  <>
                    {currentQuiz.status === 'draft' && (
                      <button
                        onClick={handlePublish}
                        disabled={isPublishing || questions.length < 5}
                        className={`inline-flex items-center justify-center px-4 py-2 rounded-lg transition-colors font-medium shadow-md ${
                          questions.length >= 5
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        title={questions.length < 5 ? `Add ${5 - questions.length} more question${questions.length === 4 ? '' : 's'} to publish` : 'Publish Quiz'}
                      >
                        <Globe size={18} className="mr-2" />
                        {isPublishing ? 'Publishing...' : 'Publish Quiz'}
                      </button>
                    )}
                    {/* Activate/Deactivate Button for Published Quizzes */}
                    {currentQuiz.status === 'published' && (
                      <button
                        onClick={handleToggleActive}
                        className={`inline-flex items-center justify-center px-4 py-2 rounded-lg transition-colors font-medium shadow-md ${
                          isQuizActive
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                        title={isQuizActive ? 'Deactivate Quiz' : 'Activate Quiz'}
                      >
                        {isQuizActive ? (
                          <>
                            <PowerOff size={18} className="mr-2" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Power size={18} className="mr-2" />
                            Activate
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/quizzes/${currentQuiz._id}/questions`)}
                      className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
                    >
                      <Plus size={18} className="mr-2" />
                       Questions
                    </button>
                    <button
                      onClick={() => navigate(`/quizzes/edit/${currentQuiz._id}`)}
                      className="inline-flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium shadow-md"
                    >
                      <Edit size={18} className="mr-2" />
                      Edit Quiz
                    </button>
                  </>
                )}
                {/* Show Start Quiz button only if quiz is active */}
                {currentQuiz.status === 'published' && !isAdmin && isQuizActive && (
                  hasAttempted ? (
                    <div className="text-center">
                      <p className="text-sm text-gray-500 mb-2">You have already taken this quiz</p>
                      <button
                        onClick={() => navigate(`/quizzes/${currentQuiz._id}/review/${userResult._id}`)}
                        className="inline-flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium shadow-md"
                      >
                        <CheckCircle size={18} className="mr-2" />
                        View Result
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => navigate(`/quizzes/${currentQuiz._id}/take`)}
                      className="inline-flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium shadow-md"
                    >
                      <Play size={18} className="mr-2" />
                      Start Quiz
                    </button>
                  )
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

              {/* Questions Count */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-800">
                      {questionsLoading ? '...' : questions.length}
                    </p>
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
                  {/* <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                    <span className="text-gray-600">Quiz ID</span>
                    <span className="font-mono text-sm text-gray-800">{currentQuiz._id}</span>
                  </div> */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="text-gray-800">{formatDate(currentQuiz.updatedAt)}</span>
                  </div>
                  {isAdmin && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                      <span className="text-gray-600">Status</span>
                      <span className="capitalize text-gray-800">{currentQuiz.status}</span>
                    </div>
                  )}
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

              {/* Status Messages - Only for Admin */}
              {isAdmin && currentQuiz.status === 'draft' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center text-yellow-700">
                    <AlertCircle size={20} className="mr-2" />
                    <span>This quiz is in draft mode. Users cannot see it until you publish it.</span>
                  </div>
                </div>
              )}

              {/* Deactivation Message - Show to all users when quiz is inactive */}
              {currentQuiz.status === 'published' && !isQuizActive && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center text-red-700">
                    <PowerOff size={20} className="mr-2" />
                    <span>This quiz is temporarily deactivated.</span>
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