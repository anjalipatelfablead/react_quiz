import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import userService from '../services/user_service';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    // Redirect to forgot password if no token
    useEffect(() => {
        if (!token) {
            navigate('/forgot-password');
        }
    }, [token, navigate]);

    // Handle password reset
    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});
        setIsLoading(true);

        // Validate passwords
        const errors = {};
        if (!newPassword) {
            errors.newPassword = 'New password is required';
        } else {
            // Password must be at least 8 characters with uppercase, lowercase, number, and special char
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(newPassword)) {
                errors.newPassword = 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character';
            }
        }

        if (!confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (newPassword !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setIsLoading(false);
            return;
        }

        try {
            await userService.resetPassword(token, newPassword);
            // Redirect to login page after successful password reset
            navigate('/login', { state: { message: 'Password reset successful. Please login with your new password.' } });
        } catch (err) {
            setError(err.message || 'Failed to reset password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary-100 to-primary-400 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-card-bg/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-card-border">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center mb-4">
                        <Link to="/login" className="text-gray-600 hover:text-primary-600 transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <h2 className="text-center text-2xl tracking-wide font-bold text-gray-900 uppercase flex-1 pr-6">
                            Reset Password
                        </h2>
                    </div>
                    <p className="text-center text-sm text-gray-600">
                        Create a new password for your account
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-red-600 text-center">{error}</p>
                    </div>
                )}

                {/* Password Reset Form */}
                <form className="space-y-6" onSubmit={handlePasswordReset}>
                    {/* New Password */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock size={18} className="text-primary-600" />
                        </div>
                        <input
                            id="newPassword"
                            name="newPassword"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            className={`block w-full pl-10 pr-10 py-2 bg-transparent border-0 border-b ${fieldErrors.newPassword ? "border-red-400" : "border-gray-400"} placeholder-gray-700 text-gray-800 text-sm focus:outline-none focus:border-primary-600 focus:ring-0 transition-colors`}
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => {
                                setNewPassword(e.target.value);
                                if (fieldErrors.newPassword) {
                                    setFieldErrors({ ...fieldErrors, newPassword: '' });
                                }
                            }}
                        />
                        <div
                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff size={18} className="text-gray-500 hover:text-primary-600 transition-colors" />
                            ) : (
                                <Eye size={18} className="text-gray-500 hover:text-primary-600 transition-colors" />
                            )}
                        </div>
                        {fieldErrors.newPassword && (
                            <p className="mt-1 text-xs text-red-500">{fieldErrors.newPassword}</p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock size={18} className="text-primary-600" />
                        </div>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            className={`block w-full pl-10 pr-10 py-2 bg-transparent border-0 border-b ${fieldErrors.confirmPassword ? "border-red-400" : "border-gray-400"} placeholder-gray-700 text-gray-800 text-sm focus:outline-none focus:border-primary-600 focus:ring-0 transition-colors`}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                if (fieldErrors.confirmPassword) {
                                    setFieldErrors({ ...fieldErrors, confirmPassword: '' });
                                }
                            }}
                        />
                        <div
                            className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? (
                                <EyeOff size={18} className="text-gray-500 hover:text-primary-600 transition-colors" />
                            ) : (
                                <Eye size={18} className="text-gray-500 hover:text-primary-600 transition-colors" />
                            )}
                        </div>
                        {fieldErrors.confirmPassword && (
                            <p className="mt-1 text-xs text-red-500">{fieldErrors.confirmPassword}</p>
                        )}
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
                                    UPDATING...
                                </span>
                            ) : (
                                'UPDATE PASSWORD'
                            )}
                        </button>
                    </div>
                </form>

                {/* Back to Login Link */}
                <div className="text-center pt-4 border-t border-gray-300/50 mt-6">
                    <p className="text-xs text-gray-600">
                        Remember your password?{' '}
                        <Link to="/login" className="font-medium text-primary-700 hover:text-primary-800 transition-colors">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
