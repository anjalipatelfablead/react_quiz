import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Camera, Edit2, Save, X, User as UserIcon, Mail, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { updateProfile, reset } from '../../redux/slices/authSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isLoading, isSuccess, isError, message } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    oldPassword: '',
    password: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        oldPassword: '',
        password: '', // Password stays empty unless changing
      });
      if (user.profileImage) {
        setImagePreview(`http://localhost:3030${user.profileImage}`);
      }
    }
  }, [user]);

  useEffect(() => {
    if (isSuccess && isEditing) {
      setIsEditing(false);
      setFormData(prev => ({ ...prev, oldPassword: '', password: '' }));
      setFieldErrors({});
      // Reset success state after some time
      setTimeout(() => {
        dispatch(reset());
      }, 3000);
    }
  }, [isSuccess, isEditing, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (isEditing) {
      fileInputRef.current.click();
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      username: user.username || '',
      email: user.email || '',
      oldPassword: '',
      password: '',
    });
    setProfileImage(null);
    setFieldErrors({});
    if (user.profileImage) {
      setImagePreview(`http://localhost:3030${user.profileImage}`);
    } else {
      setImagePreview(null);
    }
    dispatch(reset());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFieldErrors({});

    // Validate old password if new password is being set
    if (formData.password && !formData.oldPassword) {
      setFieldErrors({ oldPassword: 'Old password is required to set a new password' });
      return;
    }

    const updateData = {
      username: formData.username,
      email: formData.email,
    };

    if (formData.password) {
      updateData.oldPassword = formData.oldPassword;
      updateData.password = formData.password;
    }

    if (profileImage) {
      updateData.profileImage = profileImage;
    }

    dispatch(updateProfile(updateData));
  };

  return (
    <div className=" min-h-screen overflow-hidden  bg-gradient-to-br from-orange-50 via-white to-orange-100 ">
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 ">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-15">
          {/* Header/Banner */}
          <div className="h-32 bg-gradient-to-r from-orange-400 to-orange-600"></div>

          <div className="relative px-6 pb-8">
            {/* Profile Image Section */}
            <div className="relative flex justify-center -mt-16 mb-6">
              <div className="relative">
                <div
                  className={`w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100 flex items-center justify-center ${isEditing ? 'cursor-pointer hover:opacity-90' : ''}`}
                  onClick={triggerFileInput}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-orange-100 flex items-center justify-center text-orange-500">
                      <UserIcon size={48} />
                    </div>
                  )}

                  {isEditing && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-full overflow-hidden">
                      <div className="w-32 h-32 rounded-full bg-black/20 flex items-center justify-center">
                        <Camera className="text-white" size={24} />
                      </div>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">{user?.username}</h1>
              <p className="text-gray-500">{user?.email}</p>
              <div className="mt-2 flex justify-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {user?.role?.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Messages */}
            {isError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center text-red-700">
                <AlertCircle size={20} className="mr-2 flex-shrink-0" />
                <p className="text-sm">{message}</p>
              </div>
            )}

            {isSuccess && !isEditing && (
              <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-lg flex items-center text-green-700">
                <CheckCircle2 size={20} className="mr-2 flex-shrink-0" />
                <p className="text-sm">{message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <UserIcon size={18} />
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-orange-500 focus:border-orange-500 text-sm transition-all ${isEditing ? 'border-gray-300 bg-white' : 'border-transparent bg-gray-50 cursor-not-allowed'
                        }`}
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      readOnly
                      className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-orange-500 focus:border-orange-500 text-sm transition-all ${isEditing ? 'border-gray-300 bg-white' : 'border-transparent bg-gray-50 cursor-not-allowed'
                        }`}
                    />
                  </div>
                </div>

                {/* Old Password Field - Required when setting new password */}
                <div className={isEditing ? 'block' : 'hidden'}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Old Password <span className="text-gray-400 font-normal">(required to change password)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Shield size={18} />
                    </div>
                    <input
                      type="password"
                      name="oldPassword"
                      value={formData.oldPassword}
                      onChange={handleChange}
                      placeholder="Enter your current password"
                      className={`block w-full pl-10 pr-3 py-2.5 border rounded-lg focus:ring-orange-500 focus:border-orange-500 text-sm ${fieldErrors.oldPassword ? 'border-red-500' : 'border-gray-300'}`}
                    />
                  </div>
                  {fieldErrors.oldPassword && (
                    <p className="mt-1 text-xs text-red-500">{fieldErrors.oldPassword}</p>
                  )}
                </div>

                {/* New Password Field - Only show/editable during edit */}
                <div className={isEditing ? 'block' : 'hidden'}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Shield size={18} />
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter new password"
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 text-sm"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Min 8 chars, uppercase, lowercase, number & special char
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-gray-100 flex justify-end space-x-3">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm text-sm font-medium cursor-pointer"
                  >
                    <Edit2 size={16} className="mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 cursor-pointer"
                    >
                      <X size={16} className="mr-2" />
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm text-sm font-medium cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : (
                        <>
                          <Save size={16} className="mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
