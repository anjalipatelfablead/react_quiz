import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/slices/authSlice';
import { getAllQuizzes } from '../redux/slices/quizSlice';
import userService from '../services/user_service';
import resultService from '../services/result_service';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import {
    BookOpen,
    Users,
    ClipboardList,
    BarChart3,
    CheckCircle,
    Trophy,
    Clock,
    TrendingUp,
    Award,
    FileText,
    PieChart
} from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const { quizzes } = useSelector((state) => state.quiz);
    const { darkMode } = useSelector((state) => state.theme);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalAttempts, setTotalAttempts] = useState(0);
    const [userAttempts, setUserAttempts] = useState(0);
    const [topUsers, setTopUsers] = useState([]);
    const [recentAttempts, setRecentAttempts] = useState([]);
    const [userStatsData, setUserStatsData] = useState({
        highestScore: 0,
        averageScore: 0
    });

    useEffect(() => {
        dispatch(getAllQuizzes());
        // Fetch data based on role
        if (user?.role === 'admin') {
            fetchAdminData();
        } else {
            fetchUserData();
        }
    }, [dispatch, user]);

    const fetchAdminData = async () => {
        try {
            // Fetch total users
            const userData = await userService.getAllUsers();
            const users = Array.isArray(userData) ? userData : userData.users || [];
            const onlyUsers = users.filter(u => u.role === 'user');
            setTotalUsers(onlyUsers.length);

            // Fetch all attempts
            const resultData = await resultService.getAllResults();
            const results = Array.isArray(resultData) ? resultData : resultData.results || [];
            setTotalAttempts(results.length);

            // Process latest 10 user scores for bar chart
            const sortedResults = [...results].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const latest10 = sortedResults.slice(0, 10).map(r => ({
                username: r.userId?.username || 'Anonymous',
                score: r.totalMarks > 0 ? Math.round((r.score / r.totalMarks) * 100) : 0,
                quiz: r.quizId?.title || 'Unknown Quiz'
            }));
            setTopUsers(latest10);
        } catch (error) {
            console.error('Failed to fetch admin data:', error);
        }
    };

    const fetchUserData = async () => {
        try {
            // Fetch user's attempts
            const resultData = await resultService.getUserResults();
            const results = Array.isArray(resultData) ? resultData : resultData.results || [];
            setUserAttempts(results.length);
            
            // Sort by date (newest first) and take latest 3
            const sortedResults = [...results].sort((a, b) => 
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            
            // Get latest 3 attempts
            const latestThree = sortedResults.slice(0, 3).map(result => ({
                id: result._id,
                quiz: result.quizId?.title || 'Unknown Quiz',
                quizId: result.quizId?._id || result.quizId,
                score: result.totalMarks > 0 ? Math.round((result.score / result.totalMarks) * 100) : 0,
                date: new Date(result.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                })
            }));
            setRecentAttempts(latestThree);
            
            // Calculate highest and average scores
            if (results.length > 0) {
                const scores = results.map(r => r.totalMarks > 0 ? (r.score / r.totalMarks) * 100 : 0);
                const highest = Math.max(...scores);
                const average = scores.reduce((a, b) => a + b, 0) / scores.length;
                setUserStatsData({
                    highestScore: Math.round(highest),
                    averageScore: Math.round(average)
                });
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    // Get actual quiz counts
    const publishedQuizzes = quizzes.filter(q => q.status === 'published').length;
    const totalQuizzes = quizzes.length || 0;

    // Admin stats with dynamic data
    const adminStats = {
        totalQuizzes: totalQuizzes,
        totalUsers: totalUsers,
        totalAttempts: totalAttempts,
        analyticsSummary: {
            avgScore: '78%',
            completionRate: '85%',
            activeUsers: 45
        }
    };

    // User stats with dynamic available quizzes and attempts
    const userStats = {
        availableQuizzes: publishedQuizzes,
        attemptedQuizzes: userAttempts,
        highestScore: userStatsData.highestScore,
        averageScore: userStatsData.averageScore,
        recentAttempts: recentAttempts
    };

    const isAdmin = user?.role === 'admin';

    const StatCard = ({ icon: Icon, value, label, color, onClick }) => (
        <div 
            onClick={onClick}
            className={`${darkMode ? 'bg-gray-800 border-gray-700 border' : 'bg-white border-gray-100'} rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}`}
        >
            <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${color}`}>
                    <Icon size={24} className="text-white" />
                </div>
                <div>
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{value}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-primary-100 to-primary-400'}`}>
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Header */}
                <div className="mb-8">
                    <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        Welcome back, <span className="text-orange-500">{user?.username || 'User'}</span>!
                    </h1>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-2`}>
                        {isAdmin ? 'Here is your admin dashboard overview.' : 'Ready to test your knowledge today?'}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {isAdmin ? (
                        <>
                            <StatCard
                                icon={BookOpen}
                                value={adminStats.totalQuizzes}
                                label="Total Quizzes"
                                color="bg-blue-500"
                                onClick={() => navigate('/quizzes')}
                            />
                            <StatCard
                                icon={Users}
                                value={adminStats.totalUsers}
                                label="Total Users"
                                color="bg-green-500"
                                onClick={() => navigate('/users')}
                            />
                            <StatCard
                                icon={ClipboardList}
                                value={adminStats.totalAttempts}
                                label="Total Attempts"
                                color="bg-purple-500"
                                onClick={() => navigate('/reports')}
                            />
                            <StatCard
                                icon={BarChart3}
                                value={adminStats.analyticsSummary.avgScore}
                                label="Average Score"
                                color="bg-orange-500"
                            />
                        </>
                    ) : (
                        <>
                            <StatCard
                                icon={BookOpen}
                                value={userStats.availableQuizzes}
                                label="Available Quizzes"
                                color="bg-blue-500"
                            />
                            <StatCard
                                icon={CheckCircle}
                                value={userStats.attemptedQuizzes}
                                label="Attempted Quizzes"
                                color="bg-green-500"
                            />
                            <StatCard
                                icon={Trophy}
                                value={`${userStats.highestScore}%`}
                                label="Highest Score"
                                color="bg-yellow-500"
                            />
                            <StatCard
                                icon={TrendingUp}
                                value={`${userStats.averageScore}%`}
                                label="Average Score"
                                color="bg-purple-500"
                            />
                        </>
                    )}
                </div>

                {/* Content Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2">
                        {isAdmin ? (
                            /* Admin Analytics Section */
                            <div className={`${darkMode ? 'bg-gray-800 border-gray-700 border' : 'bg-white border-gray-100'} rounded-xl shadow-md p-6 transition-colors`}>
                                <div className="flex items-center space-x-2 mb-6">
                                    <BarChart3 className="text-orange-500" size={24} />
                                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Analytics Summary</h2>
                                </div>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 text-center`}>
                                            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{adminStats.analyticsSummary.avgScore}</p>
                                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Average Score</p>
                                        </div>
                                        <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 text-center`}>
                                            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{adminStats.analyticsSummary.completionRate}</p>
                                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Completion Rate</p>
                                        </div>
                                        <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 text-center`}>
                                            <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{adminStats.analyticsSummary.activeUsers}</p>
                                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>Active Users Today</p>
                                        </div>
                                    </div>
                                    <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} pt-6`}>
                                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-4`}>Recent Activity</h3>
                                        <div className="space-y-3">
                                            <div className={`flex items-center justify-between p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                                                <div className="flex items-center space-x-3">
                                                    <FileText className="text-gray-400" size={18} />
                                                    <span className={darkMode ? 'text-gray-200' : 'text-gray-700'}>New quiz "Advanced JavaScript" created</span>
                                                </div>
                                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>2 hours ago</span>
                                            </div>
                                            <div className={`flex items-center justify-between p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                                                <div className="flex items-center space-x-3">
                                                    <Users className="text-gray-400" size={18} />
                                                    <span className={darkMode ? 'text-gray-200' : 'text-gray-700'}>5 new users registered</span>
                                                </div>
                                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>5 hours ago</span>
                                            </div>
                                            <div className={`flex items-center justify-between p-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
                                                <div className="flex items-center space-x-3">
                                                    <Award className="text-gray-400" size={18} />
                                                    <span className={darkMode ? 'text-gray-200' : 'text-gray-700'}>Quiz "React Hooks" completed 12 times</span>
                                                </div>
                                                <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>1 day ago</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* User Recent Attempts Section */
                            <div className={`${darkMode ? 'bg-gray-800 border-gray-700 border' : 'bg-white border-gray-100'} rounded-xl shadow-md p-6 transition-colors`}>
                                <div className="flex items-center space-x-2 mb-6">
                                    <Clock className="text-orange-500" size={24} />
                                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Recent Attempts</h2>
                                </div>
                                <div className="space-y-4">
                                    {userStats.recentAttempts.length > 0 ? (
                                        userStats.recentAttempts.map((attempt, index) => (
                                            <div key={index} className={`flex items-center justify-between p-4 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} transition-colors cursor-pointer rounded-lg`}
                                                onClick={() => navigate(`/quizzes/${attempt.quizId}/review/${attempt.id}`)}>
                                                <div className="flex items-center space-x-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${attempt.score >= 90 ? 'bg-green-100 text-green-600' :
                                                        attempt.score >= 70 ? 'bg-yellow-100 text-yellow-600' :
                                                            'bg-red-100 text-red-600'
                                                        }`}>
                                                        <Trophy size={18} />
                                                    </div>
                                                    <div>
                                                        <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{attempt.quiz}</p>
                                                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{attempt.date}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-xl font-bold ${attempt.score >= 90 ? 'text-green-600' :
                                                        attempt.score >= 70 ? 'text-yellow-600' :
                                                            'text-red-600'
                                                        }`}>
                                                        {attempt.score}%
                                                    </p>
                                                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Score</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className={`text-center py-8 ${darkMode ? 'bg-gray-700' : ''} rounded-lg`}>
                                            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No attempts yet. Start taking quizzes to see your progress!</p>
                                        </div>
                                    )}
                                </div>
                                <button className={`w-full mt-6 py-3 text-center text-orange-500 font-medium hover:text-orange-600 transition-colors ${darkMode ? 'border border-orange-500/30 hover:bg-orange-500/10' : 'hover:bg-orange-50'} rounded-lg`}
                                onClick={ () => navigate('/my-attempts') }>
                                    View All Attempts
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <div className={`${darkMode ? 'bg-gray-800 border-gray-700 border' : 'bg-white border-gray-100'} rounded-xl shadow-md p-6 transition-colors`}>
                            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>
                                {isAdmin ? 'Quick Actions' : 'Quick Links'}
                            </h3>
                            <div className="space-y-3">
                                {isAdmin ? (
                                    <>
                                        <button className={`w-full py-2 px-4 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium ${darkMode ? 'border border-gray-600' : ''}`}
                                            onClick={() => navigate('/quizzes/create')}
                                        >
                                            Create New Quiz
                                        </button>
                                        <button
                                            onClick={() => navigate('/users')}
                                            className="w-full py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                                        >
                                            Manage Users
                                        </button>
                                        <button className={`w-full py-2 px-4 ${darkMode ? 'border border-gray-600 text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'} rounded-lg transition-colors text-sm font-medium`}
                                            onClick={() => navigate('/reports')}
                                        >
                                            View Reports
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button className={`w-full py-2 px-4 ${darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-800 text-white hover:bg-gray-900'} rounded-lg transition-colors text-sm font-medium`}
                                            onClick={() => navigate('/quizzes')}
                                        >
                                            Browse Quizzes
                                        </button>
                                        <button className="w-full py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                                            onClick={() => navigate('/profile')} >
                                            View Profile
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* User Info Card */}
                        <div className={`${darkMode ? 'bg-gray-800 border-gray-700 border' : 'bg-white border-gray-100'} rounded-xl shadow-md p-6 transition-colors`}>
                            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Account Info</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Username</span>
                                    <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{user?.username}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Email</span>
                                    <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{user?.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Role</span>
                                    <span className={`font-medium capitalize ${isAdmin ? 'text-purple-600' : 'text-blue-600'}`}>
                                        {user?.role}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Admin Quiz Status Charts */}
                {isAdmin && (
                    <div className="space-y-10 mt-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Quiz Distribution Chart */}
                            <div className={`${darkMode ? 'bg-gray-800 border-gray-700 border' : 'bg-white border-gray-100 shadow-xl'} rounded-2xl p-8 transition-all hover:shadow-2xl`}>
                                <div className="flex items-center space-x-3 mb-8">
                                    <div className="p-2 bg-blue-500 rounded-lg">
                                        <PieChart size={24} className="text-white" />
                                    </div>
                                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Quiz Distribution</h2>
                                </div>
                                <div className="h-80 relative">
                                    <Pie 
                                        data={{
                                            labels: ['Published', 'Archived', 'Active', 'Deactive'],
                                            datasets: [{
                                                data: [
                                                    quizzes.filter(q => q.status === 'published').length,
                                                    quizzes.filter(q => q.status === 'archived').length,
                                                    quizzes.filter(q => q.isActive === true).length,
                                                    quizzes.filter(q => q.isActive === false).length,
                                                ],
                                                backgroundColor: [
                                                    'rgba(59, 130, 246, 0.8)', // blue-500
                                                    'rgba(239, 68, 68, 0.8)',  // red-500
                                                    'rgba(16, 185, 129, 0.8)', // green-500
                                                    'rgba(245, 158, 11, 0.8)', // orange-500
                                                ],
                                                borderColor: darkMode ? '#1f2937' : '#ffffff',
                                                borderWidth: 3,
                                                hoverOffset: 20
                                            }]
                                        }}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: {
                                                    position: 'bottom',
                                                    labels: {
                                                        color: darkMode ? '#d1d5db' : '#4b5563',
                                                        padding: 25,
                                                        font: { 
                                                            size: 14,
                                                            weight: 'bold'
                                                        },
                                                        usePointStyle: true,
                                                        pointStyle: 'circle'
                                                    }
                                                },
                                                tooltip: {
                                                    backgroundColor: darkMode ? '#374151' : '#ffffff',
                                                    titleColor: darkMode ? '#ffffff' : '#1f2937',
                                                    bodyColor: darkMode ? '#d1d5db' : '#4b5563',
                                                    borderColor: darkMode ? '#4b5563' : '#e5e7eb',
                                                    borderWidth: 1,
                                                    padding: 12,
                                                    displayColors: true,
                                                    callbacks: {
                                                        label: (context) => {
                                                            const label = context.label || '';
                                                            const value = context.formattedValue || '';
                                                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                                            const percentage = Math.round((context.raw / total) * 100);
                                                            return ` ${label}: ${value} (${percentage}%)`;
                                                        }
                                                    }
                                                }
                                            },
                                            layout: {
                                                padding: 10
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Latest 10 Users Report Chart */}
                            <div className={`${darkMode ? 'bg-gray-800 border-gray-700 border' : 'bg-white border-gray-100 shadow-xl'} rounded-2xl p-8 transition-all hover:shadow-2xl`}>
                                <div className="flex items-center space-x-3 mb-8">
                                    <div className="p-2 bg-orange-500 rounded-lg">
                                        <BarChart3 className="text-white" size={24} />
                                    </div>
                                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Latest Results</h2>
                                </div>
                                <div className="h-80 relative">
                                    {topUsers.length > 0 ? (
                                        <Bar 
                                            data={{
                                                labels: topUsers.map(u => u.username),
                                                datasets: [{
                                                    label: 'Score %',
                                                    data: topUsers.map(u => u.score),
                                                    backgroundColor: 'rgba(249, 115, 22, 1)', // orange-500
                                                    borderColor: 'rgba(249, 115, 22, 1)',
                                                    borderWidth: 1,
                                                    borderRadius: 8,
                                                    hoverBackgroundColor: 'rgba(249, 115, 22, 0.8)',
                                                }]
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                plugins: {
                                                    legend: {
                                                        display: false
                                                    },
                                                    tooltip: {
                                                        backgroundColor: darkMode ? '#374151' : '#ffffff',
                                                        titleColor: darkMode ? '#ffffff' : '#1f2937',
                                                        bodyColor: darkMode ? '#d1d5db' : '#4b5563',
                                                        borderColor: darkMode ? '#4b5563' : '#e5e7eb',
                                                        borderWidth: 1,
                                                        padding: 12,
                                                        callbacks: {
                                                            label: (context) => {
                                                                const result = topUsers[context.dataIndex];
                                                                return ` Score: ${context.raw}% (${result.quiz})`;
                                                            }
                                                        }
                                                    }
                                                },
                                                scales: {
                                                    y: {
                                                        beginAtZero: true,
                                                        max: 100,
                                                        grid: {
                                                            color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                                            drawBorder: false
                                                        },
                                                        ticks: {
                                                            color: darkMode ? '#9ca3af' : '#4b5563',
                                                            font: {
                                                                size: 12
                                                            },
                                                            callback: (value) => `${value}%`
                                                        }
                                                    },
                                                    x: {
                                                        grid: {
                                                            display: false
                                                        },
                                                        ticks: {
                                                            color: darkMode ? '#9ca3af' : '#4b5563',
                                                            font: {
                                                                size: 11
                                                            },
                                                            maxRotation: 45,
                                                            minRotation: 45
                                                        }
                                                    }
                                                }
                                            }}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full space-y-3">
                                            <div className={`p-4 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                                <BarChart3 size={48} className="text-gray-400" />
                                            </div>
                                            <p className={`text-lg font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No performance data available yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quiz Distribution Summary Cards */}
                        {/* <div className={`${darkMode ? 'bg-gray-800 border-gray-700 border' : 'bg-white border-gray-100 shadow-xl'} rounded-2xl p-8 transition-all hover:shadow-2xl`}>
                            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'} mb-8 text-center`}>Quiz Distribution Summary</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className={`${darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-blue-50 hover:bg-blue-100'} p-5 rounded-2xl transition-all text-center border ${darkMode ? 'border-blue-500/20' : 'border-blue-200'}`}>
                                    <p className={`text-3xl font-black ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{quizzes.filter(q => q.status === 'published').length}</p>
                                    <p className={`text-sm font-semibold uppercase tracking-wider mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Published</p>
                                </div>
                                <div className={`${darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-red-50 hover:bg-red-100'} p-5 rounded-2xl transition-all text-center border ${darkMode ? 'border-red-500/20' : 'border-red-200'}`}>
                                    <p className={`text-3xl font-black ${darkMode ? 'text-red-400' : 'text-red-600'}`}>{quizzes.filter(q => q.status === 'archived').length}</p>
                                    <p className={`text-sm font-semibold uppercase tracking-wider mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Archived</p>
                                </div>
                                <div className={`${darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-emerald-50 hover:bg-emerald-100'} p-5 rounded-2xl transition-all text-center border ${darkMode ? 'border-emerald-500/20' : 'border-emerald-200'}`}>
                                    <p className={`text-3xl font-black ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{quizzes.filter(q => q.isActive === true).length}</p>
                                    <p className={`text-sm font-semibold uppercase tracking-wider mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Active</p>
                                </div>
                                <div className={`${darkMode ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-orange-50 hover:bg-orange-100'} p-5 rounded-2xl transition-all text-center border ${darkMode ? 'border-orange-500/20' : 'border-orange-200'}`}>
                                    <p className={`text-3xl font-black ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>{quizzes.filter(q => q.isActive === false).length}</p>
                                    <p className={`text-sm font-semibold uppercase tracking-wider mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Deactive</p>
                                </div>
                            </div>
                        </div> */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
