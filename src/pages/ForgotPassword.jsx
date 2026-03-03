import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, MailCheck } from "lucide-react";
import userService from '../services/user_service';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [emailSent, setEmailSent] = useState(false);

    // Handle email submission to request password reset
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});
        setIsLoading(true);

        // Validate email
        if (!email) {
            setFieldErrors({ email: 'Email is required' });
            setIsLoading(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setFieldErrors({ email: 'Invalid email format' });
            setIsLoading(false);
            return;
        }

        try {
            await userService.forgotPassword(email);
            setEmailSent(true);
        } catch (err) {
            setError(err.message || 'Failed to process request. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

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
                            Forgot Password
                        </h2>
                    </div>
                    <p className="text-center text-sm text-gray-600">
                        {emailSent 
                            ? 'Check your email for reset instructions' 
                            : 'Enter your email address to reset your password'}
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="text-sm text-red-600 text-center">{error}</p>
                    </div>
                )}

                {/* Email Sent Success View */}
                {emailSent ? (
                    <div className="text-center py-8">
                        <div className="mb-6">
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <MailCheck size={32} className="text-green-600" />
                            </div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <p className="text-green-800 font-medium mb-1">Email Sent Successfully!</p>
                            <p className="text-sm text-green-700">
                                We've sent a password reset link to <strong>{email}</strong>
                            </p>
                        </div>
                        <p className="text-sm text-gray-600 mb-6">
                            Please check your email and click on the reset password button to create a new password.
                            The link will expire in 30 minutes.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    setEmailSent(false);
                                    setEmail('');
                                }}
                                className="w-full py-3 px-4 text-sm font-medium tracking-widest text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors rounded"
                            >
                                SEND AGAIN
                            </button>
                            <Link
                                to="/login"
                                className="block w-full py-3 px-4 text-sm font-medium tracking-widest text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors text-center"
                            >
                                BACK TO LOGIN
                            </Link>
                        </div>
                    </div>
                ) : (
                    /* Email Form */
                    <form className="space-y-6" onSubmit={handleEmailSubmit}>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail size={18} className="text-primary-600" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                className={`block w-full pl-10 pr-3 py-2 bg-transparent border-0 border-b ${fieldErrors.email ? 'border-red-400' : 'border-gray-400'} placeholder-gray-700 text-gray-800 text-sm focus:outline-none focus:border-primary-600 focus:ring-0 transition-colors`}
                                placeholder="Email ID"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (fieldErrors.email) {
                                        setFieldErrors({ ...fieldErrors, email: '' });
                                    }
                                }}
                            />
                            {fieldErrors.email && (
                                <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
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
                                        PROCESSING...
                                    </span>
                                ) : (
                                    'SEND RESET LINK'
                                )}
                            </button>
                        </div>
                    </form>
                )}

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

export default ForgotPassword;
