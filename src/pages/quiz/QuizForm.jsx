import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { createQuiz, updateQuiz, getQuizById, reset, clearCurrentQuiz } from '../../redux/slices/quizSlice';
import { toast } from "react-toastify";

import {
  BookOpen,
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle,
  Clock,
  Tag,
  FileText,
  Type,
  AlertTriangle
} from 'lucide-react';

const QuizForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  
  const { user } = useSelector((state) => state.auth);
  const { currentQuiz, isLoading, isCreateSuccess, isUpdateSuccess, isError, message } = useSelector((state) => state.quiz);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    timeLimit: 30,
    status: 'draft'
  });

  const [errors, setErrors] = useState({});
  // const [showSuccess, setShowSuccess] = useState(false);

  // Predefined categories
  const categories = [
    'JavaScript',
    'React',
    'Node.js',
    'Python',
    'Java',
    'Database',
    'DevOps',
    'General Knowledge',
    'Mathematics',
    'Science',
    'History',
    'Other'
  ];

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(getQuizById(id));
    }
    return () => {
      dispatch(reset());
      dispatch(clearCurrentQuiz());
    };
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (isEditMode && currentQuiz) {
      setFormData({
        title: currentQuiz.title || '',
        description: currentQuiz.description || '',
        category: currentQuiz.category || '',
        timeLimit: currentQuiz.timeLimit || 30,
        status: currentQuiz.status || 'draft'
      });
    }
  }, [currentQuiz, isEditMode]);

  // useEffect(() => {
  //   if (isSuccess) {
  //     setShowSuccess(true);
  //     setTimeout(() => {
  //       setShowSuccess(false);
  //       if (!isEditMode) {
  //         // Reset form after successful creation
  //         setFormData({
  //           title: '',
  //           description: '',
  //           category: '',
  //           timeLimit: 30,
  //           status: 'draft'
  //         });
  //       }
  //     }, 2000);
  //   }
  // }, [isSuccess, isEditMode]);

useEffect(() => {
  if (isCreateSuccess && !isEditMode) {
    toast.success("Quiz created successfully!");
    setFormData({
      title: '',
      description: '',
      category: '',
      timeLimit: 30,
      status: 'draft'
    });
    dispatch(reset());
  }
}, [isCreateSuccess, isEditMode, dispatch]);

useEffect(() => {
  if (isUpdateSuccess && isEditMode) {
    toast.success("Quiz updated successfully!");
    dispatch(reset());
  }
}, [isUpdateSuccess, isEditMode, dispatch]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.timeLimit || formData.timeLimit < 1) {
      newErrors.timeLimit = 'Time limit must be at least 1 minute';
    } else if (formData.timeLimit > 180) {
      newErrors.timeLimit = 'Time limit cannot exceed 180 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'timeLimit' ? parseInt(value) || '' : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (isEditMode) {
      await dispatch(updateQuiz({ quizId: id, quizData: formData }));
    } else {
      await dispatch(createQuiz(formData));
    }
  };

  const handleCancel = () => {
    navigate('/quizzes');
  };

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-100 to-primary-400 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-md p-8 text-center max-w-md">
          <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Only administrators can create or edit quizzes.</p>
          <button
            onClick={() => navigate('/quizzes')}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-100 to-primary-400">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="inline-flex items-center text-gray-600 hover:text-orange-500 transition-colors mb-4"
          >
            <ArrowLeft size={20} className="mr-1" />
            Back to Quizzes
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            {isEditMode ? (
              <><span className="text-orange-500">Edit</span> Quiz</>
            ) : (
              <><span className="text-orange-500">Create</span> New Quiz</>
            )}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditMode 
              ? 'Update the quiz details below.' 
              : 'Fill in the details below to create a new quiz.'}
          </p>
        </div>

        {/* Success Message */}
        {/* {showSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 animate-fade-in">
            <div className="flex items-center text-green-600">
              <CheckCircle size={20} className="mr-2" />
              <span className="font-medium">
                {isEditMode ? 'Quiz updated successfully!' : 'Quiz created successfully!'}
              </span>
            </div>
          </div>
        )} */}

        {/* Error Message */}
        {isError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center text-red-600">
              <AlertCircle size={20} className="mr-2" />
              <span>{message}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center space-x-2">
              <BookOpen className="text-orange-500" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">Quiz Information</h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                <Type size={16} className="inline mr-1" />
                Quiz Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter quiz title"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors ${
                  errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                <FileText size={16} className="inline mr-1" />
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter quiz description"
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors resize-none ${
                  errors.description ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.description}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Category and Time Limit Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag size={16} className="inline mr-1" />
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors bg-white ${
                    errors.category ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.category}
                  </p>
                )}
              </div>

              {/* Time Limit */}
              <div>
                <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock size={16} className="inline mr-1" />
                  Time Limit (minutes) *
                </label>
                <input
                  type="number"
                  id="timeLimit"
                  name="timeLimit"
                  value={formData.timeLimit}
                  onChange={handleChange}
                  min="1"
                  max="180"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-colors ${
                    errors.timeLimit ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
                {errors.timeLimit && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.timeLimit}
                  </p>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex flex-wrap gap-3">
                {['draft', 'published', 'archived'].map((status) => (
                  <label
                    key={status}
                    className={`inline-flex items-center px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                      formData.status === status
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      checked={formData.status === status}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="capitalize font-medium">{status}</span>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {formData.status === 'draft' && 'Quiz is not visible to users yet.'}
                {formData.status === 'published' && 'Quiz will be visible to all users.'}
                {formData.status === 'archived' && 'Quiz is archived and hidden from users.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save size={20} className="mr-2" />
                    {isEditMode ? 'Update Quiz' : 'Create Quiz'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuizForm;
