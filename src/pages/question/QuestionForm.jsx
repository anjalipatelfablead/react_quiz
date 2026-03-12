import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getQuizById } from '../../redux/slices/quizSlice';
import { createQuestion, updateQuestion, getQuestionsByQuiz, reset, clearCurrentQuestion, deleteQuestion, updateQuestionsOrder } from '../../redux/slices/questionSlice';
import { toast } from "react-toastify";
import {
    ArrowLeft,
    Plus,
    Trash2,
    Save,
    AlertCircle,
    HelpCircle,
    CheckCircle2,
    X,
    Edit3,
    GripVertical
} from 'lucide-react';

const QuestionForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { quizId, questionId } = useParams();
    const isEditMode = Boolean(questionId);

    const { user } = useSelector((state) => state.auth);
    const { currentQuiz } = useSelector((state) => state.quiz);
    const { questions, isLoading, isCreateSuccess, isUpdateSuccess, isError, message } = useSelector((state) => state.question);
    const { darkMode } = useSelector((state) => state.theme);

    // State for multiple questions
    const [questionsList, setQuestionsList] = useState([
        {
            id: Date.now(),
            questionText: '',
            options: ['', '', '', ''],
            correctAnswer: '',
            marks: 1
        }
    ]);

    const [errors, setErrors] = useState({});
    const [activeTab, setActiveTab] = useState('add'); // 'add' or 'manage'

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedQuestionId, setSelectedQuestionId] = useState(null);

    const [showEditModal, setShowEditModal] = useState(false);
    const [editQuestionData, setEditQuestionData] = useState(null);

    // Drag and drop state
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverItem, setDragOverItem] = useState(null);
    const [localQuestions, setLocalQuestions] = useState([]);
    const [hasOrderChanged, setHasOrderChanged] = useState(false);

    useEffect(() => {
        setLocalQuestions([...questions]);
    }, [questions]);

    const handleEditClick = (question) => {
        setEditQuestionData({ ...question }); // clone question
        setShowEditModal(true);
    };

    // Drag and drop handlers
    const handleDragStart = (e, index) => {
        setDraggedItem(index);
        e.dataTransfer.effectAllowed = 'move';
        // Set a transparent drag image or none
        const dragImage = new Image();
        dragImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        e.dataTransfer.setDragImage(dragImage, 0, 0);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (draggedItem === null || draggedItem === index) return;
        setDragOverItem(index);
    };

    const handleDragLeave = () => {
        setDragOverItem(null);
    };

    const handleDrop = (e, dropIndex) => {
        e.preventDefault();
        if (draggedItem === null || draggedItem === dropIndex) {
            setDraggedItem(null);
            setDragOverItem(null);
            return;
        }

        const newQuestions = [...localQuestions];
        const draggedQuestion = newQuestions[draggedItem];
        
        // Remove from old position
        newQuestions.splice(draggedItem, 1);
        // Insert at new position
        newQuestions.splice(dropIndex, 0, draggedQuestion);
        
        // Update order property
        const updatedQuestions = newQuestions.map((q, idx) => ({
            ...q,
            order: idx
        }));
        
        setLocalQuestions(updatedQuestions);
        setHasOrderChanged(true);
        setDraggedItem(null);
        setDragOverItem(null);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
        setDragOverItem(null);
    };

    const saveQuestionOrder = async () => {
        const questionsToUpdate = localQuestions.map((q, index) => ({
            _id: q._id,
            order: index
        }));
        
        await dispatch(updateQuestionsOrder(questionsToUpdate));
        setHasOrderChanged(false);
        toast.success("Question order saved successfully!");
    };

    useEffect(() => {
        if (quizId) {
            dispatch(getQuizById(quizId));
            dispatch(getQuestionsByQuiz(quizId));
        }
        return () => {
            dispatch(reset());
            dispatch(clearCurrentQuestion());
        };
    }, [dispatch, quizId]);

    useEffect(() => {
        if (isCreateSuccess) {
            toast.success("Questions added successfully!");
            setQuestionsList([{
                id: Date.now(),
                questionText: '',
                options: ['', '', '', ''],
                correctAnswer: '',
                marks: 1
            }]);
            dispatch(reset());
        }
    }, [isCreateSuccess, dispatch]);

    useEffect(() => {
        if (isUpdateSuccess) {
            toast.success("Question updated successfully!");
            dispatch(reset());
        }
    }, [isUpdateSuccess, dispatch]);

    const addNewQuestion = () => {
        setQuestionsList([...questionsList, {
            id: Date.now(),
            questionText: '',
            options: ['', '', '', ''],
            correctAnswer: '',
            marks: 1
        }]);
    };

    const removeQuestion = (id) => {
        if (questionsList.length > 1) {
            setQuestionsList(questionsList.filter(q => q.id !== id));
        }
    };

    const updateQuestionField = (id, field, value) => {
        setQuestionsList(questionsList.map(q => {
            if (q.id === id) {
                return { ...q, [field]: value };
            }
            return q;
        }));
    };

    const updateOption = (questionId, optionIndex, value) => {
        setQuestionsList(questionsList.map(q => {
            if (q.id === questionId) {
                const newOptions = [...q.options];
                newOptions[optionIndex] = value;
                return { ...q, options: newOptions };
            }
            return q;
        }));
    };

    const validateQuestions = () => {
        const newErrors = {};
        let isValid = true;

        questionsList.forEach((q, index) => {
            if (!q.questionText.trim()) {
                newErrors[`question_${index}`] = 'Question text is required';
                isValid = false;
            }

            q.options.forEach((opt, optIndex) => {
                if (!opt.trim()) {
                    newErrors[`option_${index}_${optIndex}`] = 'Option is required';
                    isValid = false;
                }
            });

            if (!q.correctAnswer) {
                newErrors[`correct_${index}`] = 'Select correct answer';
                isValid = false;
            }

            if (q.marks < 1) {
                newErrors[`marks_${index}`] = 'Marks must be at least 1';
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateQuestions()) {
            toast.error("Please fill all required fields");
            return;
        }

        // Submit all questions
        for (const question of questionsList) {
            const questionData = {
                quizId,
                questionText: question.questionText,
                options: question.options,
                correctAnswer: question.correctAnswer,
                marks: question.marks
            };

            await dispatch(createQuestion(questionData));
        }
    };

    // const handleDeleteQuestion = async (qId) => {
    //     if (window.confirm('Are you sure you want to delete this question?')) {
    //         await dispatch(deleteQuestion(qId));
    //         toast.success("Question deleted successfully!");
    //     }
    // };

    const handleDeleteClick = (qId) => {
        setSelectedQuestionId(qId);
        setShowDeleteModal(true);
    };

    const confirmDeleteQuestion = async () => {
        if (!selectedQuestionId) return;
        // console.log("deleteQuestion:", deleteQuestion);

        await dispatch(deleteQuestion(selectedQuestionId));

        setShowDeleteModal(false);
        setSelectedQuestionId(null);

        toast.success("Question deleted successfully!");
    };

    // Redirect if not admin
    if (user?.role !== 'admin') {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-primary-100 to-primary-400'}`}>
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white/90 backdrop-blur-sm'} rounded-xl shadow-md p-8 text-center max-w-md`}>
                    <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                    <h2 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Access Denied</h2>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Only administrators can manage questions.</p>
                    <button
                        onClick={() => navigate(`/quizzes/${quizId}`)}
                        className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        Back to Quiz
                    </button>
                </div>
            </div>
        );
    }

    if (!currentQuiz) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-primary-100 to-primary-400'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-primary-100 to-primary-400'}`}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(`/quizzes/${quizId}`)}
                        className={`inline-flex items-center transition-colors mb-4 ${darkMode ? 'text-gray-400 hover:text-orange-400' : 'text-gray-600 hover:text-orange-500'}`}
                    >
                        <ArrowLeft size={20} className="mr-1" />
                        Back to Quiz
                    </button>
                    <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        <span className="text-orange-500">Manage</span> Questions
                    </h1>
                    <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Quiz: <span className="font-semibold">{currentQuiz.title}</span>
                    </p>
                </div>

                {/* Tabs */}
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white/90 backdrop-blur-sm'} rounded-xl shadow-md mb-6 overflow-hidden`}>
                    <div className={`flex border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                        <button
                            onClick={() => setActiveTab('add')}
                            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${activeTab === 'add'
                                ? (darkMode ? 'text-orange-400 border-b-2 border-orange-500 bg-orange-500/10' : 'text-orange-500 border-b-2 border-orange-500 bg-orange-50')
                                : (darkMode ? 'text-gray-400 hover:text-orange-400' : 'text-gray-600 hover:text-orange-500')
                                }`}
                        >
                            <Plus size={18} className="inline mr-2" />
                            Add Questions
                        </button>
                        <button
                            onClick={() => setActiveTab('manage')}
                            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${activeTab === 'manage'
                                ? (darkMode ? 'text-orange-400 border-b-2 border-orange-500 bg-orange-500/10' : 'text-orange-500 border-b-2 border-orange-500 bg-orange-50')
                                : (darkMode ? 'text-gray-400 hover:text-orange-400' : 'text-gray-600 hover:text-orange-500')
                                }`}
                        >
                            <Edit3 size={18} className="inline mr-2" />
                            Manage Questions ({questions.length})
                        </button>
                    </div>
                </div>

                {/* Add Questions Tab */}
                {activeTab === 'add' && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {questionsList.map((question, index) => (
                            <div
                                key={question.id}
                                className={`${darkMode ? 'bg-gray-800' : 'bg-white/90 backdrop-blur-sm'} rounded-xl shadow-md overflow-hidden`}
                            >
                                {/* Question Header */}
                                <div className={`p-4 border-b flex items-center justify-between ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50'}`}>
                                    <div className="flex items-center space-x-2">
                                        <HelpCircle className="text-orange-500" size={20} />
                                        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Question {index + 1}</h3>
                                    </div>
                                    {questionsList.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeQuestion(question.id)}
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>

                                {/* Question Body */}
                                <div className="p-6 space-y-6">
                                    {/* Question Text */}
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Question Text *
                                        </label>
                                        <textarea
                                            value={question.questionText}
                                            onChange={(e) => updateQuestionField(question.id, 'questionText', e.target.value)}
                                            placeholder="Enter your question here..."
                                            rows={2}
                                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors resize-none ${
                                                darkMode 
                                                ? (errors[`question_${index}`] ? 'border-red-900/50 bg-red-900/20 text-red-200' : 'border-gray-700 bg-gray-900 text-white')
                                                : (errors[`question_${index}`] ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white')
                                                }`}
                                        />
                                        {errors[`question_${index}`] && (
                                            <p className="mt-1 text-sm text-red-500">{errors[`question_${index}`]}</p>
                                        )}
                                    </div>

                                    {/* Options */}
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Options *
                                        </label>
                                        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {question.options.map((option, optIndex) => (
                                                <div key={optIndex} className="flex items-center space-x-2">
                                                <input
                                                    type="radio"
                                                    name={`correct_${question.id}`}
                                                    checked={question.correctAnswer === option}
                                                    onChange={() => updateQuestionField(question.id, 'correctAnswer', option)}
                                                    className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                                                />
                                                <input
                                                    type="text"
                                                    value={option}
                                                    onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                                                    placeholder={`Option ${optIndex + 1}`}
                                                    className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors ${
                                                    errors[`option_${index}_${optIndex}`] ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                                    }`}
                                                />
                                                </div>
                                            ))}
                                        </div> */}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {question.options.map((option, optIndex) => {
                                                const optionLabel = String.fromCharCode(65 + optIndex); // A, B, C, D

                                                return (
                                                    <div key={optIndex} className="flex items-center space-x-2">

                                                        {/* Label (A, B, C, D) */}

                                                        <input
                                                            type="radio"
                                                            name={`correct_${question.id}`}
                                                            checked={question.correctAnswer === option}
                                                            onChange={() =>
                                                                updateQuestionField(question.id, 'correctAnswer', option)
                                                            }
                                                            className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                                                        />
                                                        <span className={`font-semibold w-5 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                                                            {optionLabel}.
                                                        </span>

                                                        <input
                                                            type="text"
                                                            value={option}
                                                            onChange={(e) =>
                                                                updateOption(question.id, optIndex, e.target.value)
                                                            }
                                                            placeholder={`Option ${optionLabel}`}
                                                            className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors ${
                                                                darkMode
                                                                    ? (errors[`option_${index}_${optIndex}`] ? 'border-red-900/50 bg-red-900/20 text-red-200' : 'border-gray-700 bg-gray-900 text-white')
                                                                    : (errors[`option_${index}_${optIndex}`] ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white')
                                                                }`}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {errors[`correct_${index}`] && (
                                            <p className="mt-1 text-sm text-red-500">{errors[`correct_${index}`]}</p>
                                        )}
                                    </div>

                                    {/* Marks */}
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                            Marks *
                                        </label>
                                        <input
                                            type="number"
                                            value={question.marks}
                                            onChange={(e) => updateQuestionField(question.id, 'marks', parseInt(e.target.value) || 1)}
                                            min="1"
                                            className={`w-32 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors ${
                                                darkMode
                                                    ? (errors[`marks_${index}`] ? 'border-red-900/50 bg-red-900/20 text-red-200' : 'border-gray-700 bg-gray-900 text-white')
                                                    : (errors[`marks_${index}`] ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white')
                                                }`}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add More Button */}
                        <button
                            type="button"
                            onClick={addNewQuestion}
                            className={`w-full py-4 border-2 border-dashed rounded-xl text-orange-500 transition-colors flex items-center justify-center space-x-2 ${
                                darkMode 
                                ? 'border-gray-700 hover:bg-gray-800 hover:border-orange-500' 
                                : 'border-gray-300 hover:bg-orange-50 hover:border-orange-400'
                            }`}
                        >
                            <Plus size={20} />
                            <span>Add Another Question</span>
                        </button>

                        {/* Submit Button */}
                        <div className={`flex items-center justify-end space-x-4 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                            <button
                                type="button"
                                onClick={() => navigate(`/quizzes/${quizId}`)}
                                className={`px-6 py-2 border rounded-lg transition-colors font-medium cursor-pointer ${
                                    darkMode 
                                    ? 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700' 
                                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="inline-flex items-center px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} className="mr-2" />
                                        Save All Questions
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}

                {/* Manage Questions Tab */}
                {activeTab === 'manage' && (
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white/90 backdrop-blur-sm'} rounded-xl shadow-md overflow-hidden`}>
                        <div className={`p-6 border-b flex items-center justify-between ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50'}`}>
                            <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Existing Questions</h2>
                            {hasOrderChanged && (
                                <button
                                    onClick={saveQuestionOrder}
                                    className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium shadow-md"
                                >
                                    <Save size={18} className="mr-2" />
                                    Save Order
                                </button>
                            )}
                        </div>
                        <div className="p-6">
                            {localQuestions.length === 0 ? (
                                <div className="text-center py-12">
                                    <HelpCircle size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-300'}`} />
                                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No questions added yet.</p>
                                    <button
                                        onClick={() => setActiveTab('add')}
                                        className="mt-4 text-orange-500 hover:text-orange-600 font-medium"
                                    >
                                        Add your first question
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <p className={`text-sm mb-4 flex items-center ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                        <GripVertical size={16} className="mr-1" />
                                        Drag and drop to reorder questions
                                    </p>
                                    {localQuestions.map((q, index) => (
                                        <div
                                            key={q._id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, index)}
                                            onDragOver={(e) => handleDragOver(e, index)}
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) => handleDrop(e, index)}
                                            onDragEnd={handleDragEnd}
                                            className={`border rounded-xl p-4 transition-all cursor-grab active:cursor-grabbing ${
                                                draggedItem === index
                                                    ? (darkMode ? 'opacity-50 border-orange-500 bg-orange-500/10' : 'opacity-50 border-orange-300 bg-orange-50')
                                                    : dragOverItem === index
                                                        ? (darkMode ? 'border-orange-500 bg-orange-500/10 shadow-lg' : 'border-orange-400 bg-orange-50 shadow-md transform scale-[1.02]')
                                                        : (darkMode ? 'border-gray-700 bg-gray-900/50 hover:shadow-md hover:border-orange-500/50' : 'border-gray-200 hover:shadow-md hover:border-orange-200')
                                            }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start flex-1">
                                                    <div className={`flex items-center justify-center w-8 h-8 mr-3 transition-colors ${darkMode ? 'text-gray-600 hover:text-orange-400' : 'text-gray-400 hover:text-orange-500'}`}>
                                                        <GripVertical size={20} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <span className="bg-orange-100 text-orange-600 text-xs font-medium px-2 py-1 rounded">
                                                                Q{index + 1}
                                                            </span>
                                                            <span className={`${darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600'} text-xs font-medium px-2 py-1 rounded`}>
                                                                {q.marks} mark{q.marks > 1 ? 's' : ''}
                                                            </span>
                                                        </div>
                                                        <p className={`font-medium mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{q.questionText}</p>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                            {q.options.map((opt, optIndex) => (
                                                                <div
                                                                    key={optIndex}
                                                                    className={`flex items-center space-x-2 text-sm ${opt === q.correctAnswer
                                                                        ? 'text-green-500 font-medium'
                                                                        : (darkMode ? 'text-gray-400' : 'text-gray-600')
                                                                        }`}
                                                                >
                                                                    <span className={`font-semibold w-6 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                                                        {String.fromCharCode(65 + optIndex)}.
                                                                    </span>
                                                                    {opt === q.correctAnswer ? (
                                                                        <CheckCircle2 size={14} className="text-green-500" />
                                                                    ) : (
                                                                        <X size={14} className={darkMode ? 'text-gray-600' : 'text-gray-400'} />
                                                                    )}
                                                                    <span>{opt}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2 ml-4">
                                                    <button
                                                        onClick={() => handleEditClick(q)}
                                                        className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-blue-400 hover:bg-blue-900/30' : 'text-blue-500 hover:bg-blue-50'}`}
                                                    >
                                                        <Edit3 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(q._id)}
                                                        className={`p-2 rounded-lg transition-colors ${darkMode ? 'text-red-400 hover:bg-red-900/30' : 'text-red-500 hover:bg-red-50'}`}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-xl w-full max-w-md p-6 animate-fadeIn`}>

                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            <div className={`${darkMode ? 'bg-red-900/30' : 'bg-red-100'} p-3 rounded-full`}>
                                <Trash2 className="text-red-500" size={28} />
                            </div>
                        </div>

                        {/* Title */}
                        <h3 className={`text-lg font-semibold text-center mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                            Delete Question?
                        </h3>

                        <p className={`text-sm text-center mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            This action cannot be undone. Are you sure you want to delete this question?
                        </p>

                        {/* Buttons */}
                        <div className="flex justify-center space-x-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className={`px-4 py-2 rounded-lg border transition ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                            >
                                Cancel
                            </button>

                            <button
                                onClick={confirmDeleteQuestion}
                                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition shadow-md"
                            >
                                Yes, Delete
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {showEditModal && editQuestionData && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative animate-fadeIn`}>

                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                                 Edit Question
                            </h3>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className={`transition ${darkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* Question Text */}
                        <div className="mb-6">
                            <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Question Text
                            </label>
                            <textarea
                                value={editQuestionData.questionText}
                                onChange={(e) =>
                                    setEditQuestionData({
                                        ...editQuestionData,
                                        questionText: e.target.value
                                    })
                                }
                                rows={2}
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition ${
                                    darkMode ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-800'
                                }`}
                            />
                        </div>

                        {/* Options */}
                        <div className="mb-6">
                            <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Options (Select correct answer)
                            </label>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {editQuestionData.options.map((opt, index) => {
                                    const label = String.fromCharCode(65 + index); // A B C D

                                    return (
                                        <div
                                            key={index}
                                            className={`flex items-center space-x-3 p-3 rounded-xl border transition ${
                                                editQuestionData.correctAnswer === opt
                                                    ? (darkMode ? "border-green-500 bg-green-500/10" : "border-green-500 bg-green-50")
                                                    : (darkMode ? "border-gray-700 bg-gray-900" : "border-gray-200 bg-white")
                                                }`}
                                        >
                                            {/* Radio */}
                                            <input
                                                type="radio"
                                                name="editCorrectAnswer"
                                                checked={editQuestionData.correctAnswer === opt}
                                                onChange={() =>
                                                    setEditQuestionData({
                                                        ...editQuestionData,
                                                        correctAnswer: opt
                                                    })
                                                }
                                                className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                                            />

                                            {/* Label A B C D */}
                                            <span className={`font-bold w-6 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                                                {label}.
                                            </span>

                                            {/* Input */}
                                            <input
                                                type="text"
                                                value={opt}
                                                onChange={(e) => {
                                                    const updatedOptions = [...editQuestionData.options];
                                                    updatedOptions[index] = e.target.value;

                                                    setEditQuestionData({
                                                        ...editQuestionData,
                                                        options: updatedOptions
                                                    });
                                                }}
                                                className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${
                                                    darkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-800'
                                                }`}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Marks */}
                        <div className="mb-6">
                            <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Marks
                            </label>
                            <input
                                type="number"
                                value={editQuestionData.marks}
                                min="1"
                                onChange={(e) =>
                                    setEditQuestionData({
                                        ...editQuestionData,
                                        marks: parseInt(e.target.value) || 1
                                    })
                                }
                                className={`w-32 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none ${
                                    darkMode ? 'border-gray-700 bg-gray-900 text-white' : 'border-gray-300 bg-white text-gray-800'
                                }`}
                            />
                        </div>

                        {/* Footer Buttons */}
                        <div className={`flex justify-end space-x-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className={`px-5 py-2 rounded-xl border transition font-medium ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                            >
                                Cancel
                            </button>

                            <button
                                onClick={async () => {
                                    await dispatch(updateQuestion({
                                        questionId: editQuestionData._id,
                                        questionData: editQuestionData
                                    }));
                                    setShowEditModal(false);
                                    toast.success("Question updated successfully!");
                                }}
                                className="px-6 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition font-medium shadow-md"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionForm;
