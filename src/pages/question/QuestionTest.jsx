import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getQuizById, reset as resetQuiz, clearCurrentQuiz } from '../../redux/slices/quizSlice';
import { getQuestionsByQuiz, reset as resetQuestions } from '../../redux/slices/questionSlice';
import { submitQuiz, reset as resetResult } from '../../redux/slices/resultSlice';
import {
    ChevronLeft,
    ChevronRight,
    Flag,
    Clock,
    AlertCircle,
    ArrowLeft
} from 'lucide-react';

const QuestionTest = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { quizId } = useParams();

    const { currentQuiz, isLoading: quizLoading } = useSelector((state) => state.quiz);
    const { questions, isLoading: questionsLoading } = useSelector((state) => state.question);
    const { darkMode } = useSelector((state) => state.theme);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [markedQuestions, setMarkedQuestions] = useState([]);
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [startTime, setStartTime] = useState(null);

    const [shuffledQuestions, setShuffledQuestions] = useState([]);

    useEffect(() => {
        if (quizId) {
            dispatch(getQuizById(quizId));
            dispatch(getQuestionsByQuiz(quizId));
        }
        return () => {
            dispatch(resetQuiz());
            dispatch(clearCurrentQuiz());
            dispatch(resetQuestions());
            dispatch(resetResult());
        };
    }, [dispatch, quizId]);

    // Initialize timer when quiz loads
    useEffect(() => {
        if (currentQuiz?.timeLimit && timeLeft === null) {
            setTimeLeft(currentQuiz.timeLimit * 60); // Convert to seconds
            setStartTime(Date.now()); // Record start time
        }
    }, [currentQuiz, timeLeft]);

    // Timer countdown
    useEffect(() => {
        if (timeLeft === null || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    submitTest();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    useEffect(() => {
        if (questions.length > 0) {
            const shuffled = questions.map(q => ({
                ...q,
                shuffledOptions: shuffleArray(q.options)
            }));

            setShuffledQuestions(shuffled);
        }
    }, [questions]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerSelect = (questionId, option) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: option
        }));
    };

    const toggleMarkQuestion = (questionId) => {
        setMarkedQuestions(prev =>
            prev.includes(questionId)
                ? prev.filter(id => id !== questionId)
                : [...prev, questionId]
        );
    };

    const goToNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const goToPreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const goToQuestion = (index) => {
        setCurrentQuestionIndex(index);
    };

    const submitTest = async () => {
        setIsSubmitting(true);

        // Calculate local results for display
        let correctCount = 0;
        let totalMarks = 0;
        let obtainedMarks = 0;

        // questions.forEach(question => {
        shuffledQuestions.forEach(question => {
            totalMarks += question.marks;
            if (selectedAnswers[question._id] === question.correctAnswer) {
                correctCount++;
                obtainedMarks += question.marks;
            }
        });

        const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

        // Calculate time taken in seconds
        const timeTaken = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;

        const testResults = {
            totalQuestions: questions.length,
            answeredQuestions: Object.keys(selectedAnswers).length,
            correctAnswers: correctCount,
            totalMarks,
            obtainedMarks,
            percentage: percentage.toFixed(2),
            timeTaken
        };

        // Format answers for backend API
        const answers = Object.entries(selectedAnswers).map(([questionId, selectedAnswer]) => ({
            questionId,
            selectedAnswer
        }));

        try {
            // Submit to backend
            const result = await dispatch(submitQuiz({ quizId, answers, timeTaken })).unwrap();

            // Redirect to review page with results
            navigate(`/quizzes/${quizId}/review/${result.result._id}`, {
                state: {
                    testResults,
                    selectedAnswers
                }
            });
        } catch (error) {
            console.error('Failed to submit quiz:', error);
            alert('Failed to submit quiz. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getOptionLabel = (index) => {
        return String.fromCharCode(65 + index); // A, B, C, D...
    };

    const shuffleArray = (array) => {
        return [...array]
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
    };

    if (quizLoading || questionsLoading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-50 via-white to-orange-100'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (!currentQuiz) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-50 via-white to-orange-100'}`}>
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-8 text-center`}>
                    <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                    <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Quiz Not Found</h2>
                    <button
                        onClick={() => navigate('/quizzes')}
                        className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        Back to Quizzes
                    </button>
                </div>
            </div>
        );
    }

    // Test Taking View
    // const currentQuestion = questions[currentQuestionIndex];
    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    const answeredCount = Object.keys(selectedAnswers).length;

    return (
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-50 via-white to-orange-100'}`}>
            {/* Header */}
            <div className={`shadow-sm border-b sticky top-0 z-10 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(`/quizzes/${quizId}`)}
                                className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{currentQuiz.title}</h1>
                                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Question {currentQuestionIndex + 1} of {questions.length}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {timeLeft !== null && (
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                                    timeLeft < 60 
                                    ? (darkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700') 
                                    : (darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-100 text-gray-700')
                                    }`}>
                                    <Clock size={18} />
                                    <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
                                </div>
                            )}
                            <div className={`text-sm hidden sm:block ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                <span className={`font-medium ${darkMode ? 'text-orange-400' : 'text-gray-800'}`}>{answeredCount}</span> / {questions.length} Answered
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Question Panel */}
                    <div className="flex-1">
                        {currentQuestion && (
                            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-6`}>
                                <div className="flex items-start justify-between mb-6">
                                    <h3 className={`text-lg font-medium flex-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                        <span className="text-orange-500 font-bold mr-2">Q{currentQuestionIndex + 1}.</span>
                                        {currentQuestion.questionText}
                                    </h3>
                                    <button
                                        onClick={() => toggleMarkQuestion(currentQuestion._id)}
                                        className={`ml-4 p-2 rounded-lg transition-colors ${markedQuestions.includes(currentQuestion._id)
                                            ? (darkMode ? 'bg-yellow-900/30 text-yellow-500' : 'bg-yellow-100 text-yellow-600')
                                            : (darkMode ? 'bg-gray-700 text-gray-500 hover:text-yellow-500' : 'bg-gray-100 text-gray-400 hover:text-yellow-600')
                                            }`}
                                        title="Mark for review"
                                    >
                                        <Flag size={20} />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {/* {currentQuestion.options.map((option, index) => ( */}
                                    {currentQuestion.shuffledOptions.map((option, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleAnswerSelect(currentQuestion._id, option)}
                                            className={`w-full p-4 text-left rounded-lg border-2 transition-all ${selectedAnswers[currentQuestion._id] === option
                                                ? (darkMode ? 'border-orange-500 bg-orange-500/10 text-orange-400' : 'border-orange-500 bg-orange-50 text-orange-800')
                                                : (darkMode ? 'border-gray-700 bg-gray-750 text-gray-300 hover:border-orange-500/50 hover:bg-orange-500/5' : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50')
                                                }`}
                                        >
                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-medium mr-3 ${
                                                selectedAnswers[currentQuestion._id] === option
                                                ? 'bg-orange-500 text-white'
                                                : (darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-700')
                                            }`}>
                                                {getOptionLabel(index)}
                                            </span>
                                            {option}
                                        </button>
                                    ))}
                                </div>

                                <div className={`flex items-center justify-between mt-8 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                    <button
                                        onClick={goToPreviousQuestion}
                                        disabled={currentQuestionIndex === 0}
                                        className={`flex items-center px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}
                                    >
                                        <ChevronLeft size={20} className="mr-1" />
                                        Previous
                                    </button>
                                    {currentQuestionIndex === questions.length - 1 ? (
                                        <button
                                            onClick={() => setShowSubmitConfirm(true)}
                                            disabled={isSubmitting}
                                            className="flex items-center px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-md"
                                        >
                                            {isSubmitting ? 'Submitting...' : 'Submit'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={goToNextQuestion}
                                            disabled={!selectedAnswers[currentQuestion._id]}
                                            className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                                        >
                                            Next
                                            <ChevronRight size={20} className="ml-1" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {questions.length === 0 && (
                            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-8 text-center`}>
                                <AlertCircle size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                                <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>No Questions Available</h3>
                                <p className={darkMode ? 'text-gray-500' : 'text-gray-500'}>This quiz doesn't have any questions yet.</p>
                                <button
                                    onClick={() => navigate('/quizzes')}
                                    className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-md"
                                >
                                    Back to Quizzes
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Question Navigation Panel */}
                    <div className="lg:w-72">
                        <div className={`rounded-xl shadow-md p-4 sticky top-24 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            <h4 className={`font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Question Navigator</h4>
                            <div className="grid grid-cols-5 gap-2">
                                {questions.map((question, index) => {
                                    const isAnswered = selectedAnswers[question._id] !== undefined;
                                    const isMarked = markedQuestions.includes(question._id);
                                    const isCurrent = currentQuestionIndex === index;

                                    return (
                                        <button
                                            key={question._id}
                                            onClick={() => goToQuestion(index)}
                                            className={`aspect-square rounded-lg text-sm font-medium transition-all ${isCurrent
                                                ? 'bg-orange-500 text-white ring-2 ring-orange-300'
                                                : isAnswered
                                                    ? (darkMode ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-green-100 text-green-700 border border-green-300')
                                                    : isMarked
                                                        ? (darkMode ? 'bg-yellow-900/30 text-yellow-500 border border-yellow-800' : 'bg-yellow-100 text-yellow-700 border border-yellow-300')
                                                        : (darkMode ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
                                                }`}
                                        >
                                            {index + 1}
                                            {isMarked && <span className="block text-xs">★</span>}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="mt-4 space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded border ${darkMode ? 'bg-green-900/30 border-green-800' : 'bg-green-100 border-green-300'}`}></div>
                                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Answered</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded border ${darkMode ? 'bg-yellow-900/30 border-yellow-800' : 'bg-yellow-100 border-yellow-300'}`}></div>
                                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Marked for review</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-orange-500"></div>
                                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Current</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}></div>
                                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Not visited</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Submit Confirmation Modal */}
            {showSubmitConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowSubmitConfirm(false)}></div>
                    <div className={`relative rounded-xl shadow-xl w-full max-w-md p-6 z-10 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Submit Test?</h3>
                        <div className="space-y-2 mb-6">
                            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>You have answered <span className={`font-medium ${darkMode ? 'text-orange-400' : 'text-gray-800'}`}>{answeredCount}</span> out of <span className={`font-medium ${darkMode ? 'text-orange-400' : 'text-gray-800'}`}>{questions.length}</span> questions.</p>
                            {answeredCount < questions.length && (
                                <p className="text-yellow-600 text-sm">You have {questions.length - answeredCount} unanswered questions.</p>
                            )}
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowSubmitConfirm(false)}
                                className={`px-4 py-2 transition-colors ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`}
                            >
                                Continue Test
                            </button>
                            <button
                                onClick={submitTest}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionTest;
