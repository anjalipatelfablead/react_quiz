import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, reset } from '../redux/slices/authSlice';
import { User, Mail, Lock, CheckCircle } from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    profileImage: null,
  });

  const [fieldErrors, setFieldErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const { username, email, password, confirmPassword } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, isLoading, isError, isSuccess, message, errors } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isError && errors) {
      setFieldErrors((prevErrors) => ({
        ...prevErrors,
        ...errors
      }));
    }

    if (isSuccess && user) {
      // Redirect based on user role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    }

    return () => {
      dispatch(reset());
    };
  }, [user, isError, isSuccess, navigate, dispatch]);

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === 'profileImage') {
      setFormData((prevState) => ({
        ...prevState,
        profileImage: e.target.files[0],
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
      // Clear field error when user starts typing
      if (fieldErrors[name]) {
        setFieldErrors((prevErrors) => ({
          ...prevErrors,
          [name]: '',
        }));
      }
    }
  };

  // Clear errors on reset
  useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const onSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: 'Passwords do not match',
      }));
      return;
    }

    const userData = {
      username,
      email,
      password,
      profileImage: formData.profileImage,
    };

    dispatch(register(userData));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-100 to-primary-400 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-card-bg/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-card-border">
        <div className="mb-8">
          <h2 className="text-center text-2xl tracking-wide font-bold text-gray-900 uppercase">
            Join <span className="text-orange-500">Fablead Quiz</span>
          </h2>
        </div>

        <form className="space-y-5" onSubmit={onSubmit}>
          {isError && message && !errors && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-600 text-center">{message}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-primary-600" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                className={`block w-full pl-10 pr-3 py-2 bg-transparent border-0 border-b ${fieldErrors.username ? 'border-red-400' : 'border-gray-400'} placeholder-gray-700 text-gray-800 text-sm focus:outline-none focus:border-primary-600 focus:ring-0 transition-colors`}
                placeholder="Username"
                value={username}
                onChange={onChange}
              />
              {fieldErrors.username && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.username}</p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-primary-600 " />
              </div>
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="email"
                className={`block w-full pl-10 pr-3 py-2 bg-transparent border-0 border-b ${fieldErrors.email ? 'border-red-400' : 'border-gray-400'} placeholder-gray-700 text-gray-800 text-sm focus:outline-none focus:border-primary-600 focus:ring-0 transition-colors`}
                placeholder="Email ID"
                value={email}
                onChange={onChange}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-primary-600 " />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                className={`block w-full pl-10 pr-3 py-2 bg-transparent border-0 border-b ${fieldErrors.password ? 'border-red-400' : 'border-gray-400'} placeholder-gray-700 text-gray-800 text-sm focus:outline-none focus:border-primary-600 focus:ring-0 transition-colors`}
                placeholder="Password"
                value={password}
                onChange={onChange}
              />
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CheckCircle size={18} className="text-primary-600 " />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                className={`block w-full pl-10 pr-3 py-2 bg-transparent border-0 border-b ${fieldErrors.confirmPassword ? 'border-red-400' : 'border-gray-400'} placeholder-gray-700 text-gray-800 text-sm focus:outline-none focus:border-primary-600 focus:ring-0 transition-colors`}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={onChange}
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <div className="pt-2">
              <label className="block text-sm text-gray-600 mb-2">Profile Image <span className="text-gray-400">(Optional)</span></label>
              <input
                id="profileImage"
                name="profileImage"
                type="file"
                accept="image/*"
                className="block w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:text-xs file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300 cursor-pointer"
                onChange={onChange}
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 text-sm font-medium tracking-widest text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  SIGNING UP...
                </span>
              ) : (
                'SIGN UP'
              )}
            </button>
          </div>

          <div className="text-center pt-4 border-t border-gray-300/50">
            <p className="text-xs text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-700 hover:text-primary-800 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
