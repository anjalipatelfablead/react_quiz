import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getQuizById, reset as resetQuiz, clearCurrentQuiz } from '../../redux/slices/quizSlice';
import { getQuestionsByQuiz, reset as resetQuestions } from '../../redux/slices/questionSlice';
import { getResultById, reset as resetResult, clearCurrentResult } from '../../redux/slices/resultSlice';
import {
    CheckCircle,
    XCircle,
    ArrowLeft,
    Home,
    AlertCircle,
    Clock
} from 'lucide-react';

const QuestionReview = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { quizId, resultId } = useParams();
    const location = useLocation();

    const { currentQuiz, isLoading: quizLoading } = useSelector((state) => state.quiz);
    const { questions, isLoading: questionsLoading } = useSelector((state) => state.question);
    const { currentResult, isLoading: resultLoading } = useSelector((state) => state.result);

    // Get test results from navigation state (for immediate view after quiz)
    const testResults = location.state?.testResults;
    const selectedAnswers = location.state?.selectedAnswers || {};

    useEffect(() => {
        if (quizId) {
            dispatch(getQuizById(quizId));
            dispatch(getQuestionsByQuiz(quizId));
        }
        // If resultId is provided, fetch the result from backend
        if (resultId) {
            dispatch(getResultById(resultId));
        }
        return () => {
            dispatch(resetQuiz());
            dispatch(clearCurrentQuiz());
            dispatch(resetQuestions());
            dispatch(resetResult());
            dispatch(clearCurrentResult());
        };
    }, [dispatch, quizId, resultId]);

    const getOptionLabel = (index) => {
        return String.fromCharCode(65 + index);
    };

    const handleBackToQuizzes = () => {
        navigate('/quizzes');
    };

    const handleGoToDetail = () => {
        navigate(`/quizzes/${quizId}`);
    };

    if (quizLoading || questionsLoading || resultLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (!currentQuiz) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                    <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Quiz Not Found</h2>
                    <button
                        onClick={handleBackToQuizzes}
                        className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        Back to Quizzes
                    </button>
                </div>
            </div>
        );
    }

    // If no test results and no current result from backend, show error
    if (!testResults && !currentResult) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-md">
                    <AlertCircle size={48} className="mx-auto text-yellow-500 mb-4" />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">No Test Results</h2>
                    <p className="text-gray-600 mb-4">No test results found. Please take the quiz first.</p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={handleGoToDetail}
                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            Go to Quiz
                        </button>
                        <button
                            onClick={handleBackToQuizzes}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            izzes
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Calculate display data from either testResults (immediate) or currentResult (from backend)
    const displayData = testResults || {
        percentage: currentResult ? ((currentResult.score / currentResult.totalMarks) * 100).toFixed(1) : 0,
        correctAnswers: currentResult ? currentResult.answers.filter(a => a.isCorrect).length : 0,
        answeredQuestions: currentResult ? currentResult.answers.length : 0,
        totalQuestions: questions.length,
        obtainedMarks: currentResult ? currentResult.score : 0,
        totalMarks: currentResult ? currentResult.totalMarks : 0,
        timeTaken: currentResult ? currentResult.timeTaken : 0,
    };

    // Format time taken (seconds to MM:SS)
    const formatTimeTaken = (seconds) => {
        if (!seconds || seconds <= 0) return 'N/A';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    // Build selectedAnswers map from currentResult if available
    const resultAnswersMap = currentResult ? 
        currentResult.answers.reduce((acc, ans) => {
            acc[ans.questionId._id || ans.questionId] = ans.selectedAnswer;
            return acc;
        }, {}) : {};

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={handleBackToQuizzes}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Test Results</h1>
                        <p className="text-gray-600">{currentQuiz.title}</p>
                    </div>
                </div>

                {/* Results Summary Card */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
                    <div className="text-center mb-8">
                        <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${
                            parseFloat(displayData.percentage) >= 60 ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                            {parseFloat(displayData.percentage) >= 60 ? (
                                <CheckCircle size={48} className="text-green-600" />
                            ) : (
                                <XCircle size={48} className="text-red-600" />
                            )}
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">
                            {parseFloat(displayData.percentage) >= 60 ? 'Congratulations!' : 'Keep Practicing!'}
                        </h2>
                        <p className="text-gray-600">
                            You scored <span className="font-bold text-orange-600">{displayData.percentage}%</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="bg-blue-50 rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold text-blue-600">{displayData.percentage}%</p>
                            <p className="text-sm text-gray-600">Score</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold text-green-600">{displayData.correctAnswers}</p>
                            <p className="text-sm text-gray-600">Correct</p>
                        </div>
                        <div className="bg-orange-50 rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold text-orange-600">{displayData.answeredQuestions}/{displayData.totalQuestions}</p>
                            <p className="text-sm text-gray-600">Attempted</p>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-4 text-center">
                            <p className="text-3xl font-bold text-purple-600">{displayData.obtainedMarks}/{displayData.totalMarks}</p>
                            <p className="text-sm text-gray-600">Marks</p>
                        </div>
                        <div className="bg-teal-50 rounded-xl p-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                                <Clock size={20} className="text-teal-600" />
                                <p className="text-2xl font-bold text-teal-600">{formatTimeTaken(displayData.timeTaken)}</p>
                            </div>
                            <p className="text-sm text-gray-600">Time Taken</p>
                        </div>
                    </div>
                </div>

                {/* Question Review */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Question Review</h3>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {questions.map((question, index) => {
                            // Use resultAnswersMap if available (from backend), otherwise use selectedAnswers (immediate)
                            const userAnswer = resultAnswersMap[question._id] !== undefined 
                                ? resultAnswersMap[question._id] 
                                : selectedAnswers[question._id];
                            const isCorrect = userAnswer === question.correctAnswer;
                            const isAnswered = userAnswer !== undefined;
                            return (
                                <div 
                                    key={question._id} 
                                    className={`p-4 rounded-lg border ${
                                        isCorrect 
                                            ? 'border-green-200 bg-green-50' 
                                            : isAnswered 
                                                ? 'border-red-200 bg-red-50' 
                                                : 'border-gray-200 bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                            isCorrect 
                                                ? 'bg-green-500 text-white' 
                                                : isAnswered 
                                                    ? 'bg-red-500 text-white' 
                                                    : 'bg-gray-300 text-gray-600'
                                        }`}>
                                            {index + 1}
                                        </span>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800 mb-2">{question.questionText}</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                                                {question.options.map((option, optIndex) => (
                                                    <div 
                                                        key={optIndex} 
                                                        className={`p-2 rounded text-sm ${
                                                            option === question.correctAnswer
                                                                ? 'bg-green-100 text-green-800 border border-green-300'
                                                                : userAnswer === option && option !== question.correctAnswer
                                                                    ? 'bg-red-100 text-red-800 border border-red-300'
                                                                    : 'bg-white border border-gray-200'
                                                        }`}
                                                    >
                                                        {getOptionLabel(optIndex)}. {option}
                                                        {option === question.correctAnswer && (
                                                            <span className="ml-2 text-green-600 font-medium">(Correct)</span>
                                                        )}
                                                        {userAnswer === option && (
                                                            <span className="ml-2 text-blue-600 font-medium">(Your Answer)</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            {!isAnswered && <p className="text-sm text-gray-500">Not answered</p>}
                                            <p className="text-xs text-gray-400 mt-2">Marks: {question.marks}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                    <button
                        onClick={handleBackToQuizzes}
                        className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg bg-gray-200 hover:bg-gray-400 cursor-pointer transition-colors font-medium"
                    >
                        <Home size={18} className="mr-2" />
                        Back to Quizzes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuestionReview;
