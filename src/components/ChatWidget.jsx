import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { MessageCircle, X, ChevronRight, HelpCircle, Send } from 'lucide-react';
import { getAllQuizzes } from '../redux/slices/quizSlice';

const ChatWidget = () => {
    const dispatch = useDispatch();
    const { quizzes } = useSelector((state) => state.quiz);
    const { darkMode } = useSelector((state) => state.theme);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', text: 'Hello! I am your Quiz Assistant. How can I help you today?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);

    const questions = [
        { id: 'start', question: 'How to start quiz', answer: 'To start a quiz, browse the "Quizzes" list from the dashboard, select a quiz, and click "Start Quiz".' },
        { id: 'rules', question: 'Quiz rules', answer: '1. Time limit applies.\n2. No refreshing.\n3. One correct answer.\n4. No retakes unless permitted.' },
        { id: 'timer', question: 'Timer information', answer: 'Timer starts automatically. Remaining time is at the top. Quiz auto-submits if time runs out.' },
        { id: 'marks', question: 'Marks calculation', answer: 'Scores are based on correct answers. No negative marking.' }
    ];

    useEffect(() => {
        if (isOpen && quizzes.length === 0) {
            dispatch(getAllQuizzes());
        }
    }, [isOpen, quizzes.length, dispatch]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (text) => {
        const userMessage = text || inputValue;
        if (!userMessage.trim()) return;

        setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
        if (!text) setInputValue('');

        // Bot Logic
        setTimeout(() => {
            const input = userMessage.toLowerCase().trim();
            let botResponse = '';

            const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'];
            
            if (greetings.some(g => input === g || input.startsWith(g + ' '))) {
                botResponse = "Hello! How can I assist you with your quizzes today?";
            } else if (input.includes('latest') && input.includes('quiz')) {
                const latest = quizzes
                    .filter(q => q.status === 'published')
                    .slice(0, 3)
                    .map(q => q.title)
                    .join(', ');
                botResponse = latest ? `The latest quizzes are: ${latest}` : "We don't have any published quizzes at the moment.";
            } else if (input.includes('language')) {
                const languageList = [
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
                    'History'
                ];
                botResponse = `Available languages and categories:\n\n${languageList.map(lang => `• ${lang}`).join('\n')}`;
            } else if (input.includes('math')) {
                botResponse = "Currently, we don't have specialized math questions, but you can try anything else from our category list!";
            } else {
                // Check if it matches predefined questions
                const matched = questions.find(q => input.includes(q.question.toLowerCase()) || input.includes(q.id));
                if (matched) {
                    botResponse = matched.answer;
                } else {
                    botResponse = "I'm sorry, I don't understand that. You can ask about 'latest quizzes', 'languages', 'quiz rules', or 'how to start'.";
                }
            }

            setMessages(prev => [...prev, { type: 'bot', text: botResponse }]);
        }, 500);
    };

    const toggleChat = () => {
        // if (isOpen) {
        //     // Reset conversation when closing
        //     setMessages([
        //         { type: 'bot', text: 'Hello! I am your Quiz Assistant. How can I help you today?' }
        //     ]);
        //     setInputValue('');
        // }
        setIsOpen(!isOpen);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen && (
                <div className={`${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'} rounded-2xl shadow-2xl w-80 sm:w-96 h-[500px] mb-4 overflow-hidden border flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300`}>
                    {/* Header */}
                    <div 
                        style={{ background: 'linear-gradient(135deg, #6C63FF, #9333EA)' }}
                        className="p-4 text-white flex items-center justify-between flex-shrink-0"
                    >
                        <div className="flex items-center gap-2">
                            <HelpCircle size={20} />
                            <span className="font-semibold text-lg">Quiz Help</span>
                        </div>
                        <button onClick={toggleChat} className="hover:bg-white/10 p-1 rounded-full transition-colors cursor-pointer">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className={`flex-1 overflow-y-auto p-4 ${darkMode ? 'bg-slate-950' : 'bg-gray-50'} space-y-4 custom-scrollbar`}>
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div 
                                    style={msg.type === 'user' ? { background: 'linear-gradient(135deg, #6C63FF, #9333EA)' } : {}}
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
                                    msg.type === 'user' 
                                    ? 'text-white rounded-tr-none' 
                                    : `${darkMode ? 'bg-slate-800 text-slate-100 border-slate-700' : 'bg-white text-gray-800 border-gray-100'} border rounded-tl-none`
                                }`}>
                                    <p className="whitespace-pre-line">{msg.text}</p>
                                </div>
                            </div>
                        ))}

                        {/* Quick Options (Always visible at start if only welcome msg) */}
                        {messages.length === 1 && (
                            <div className="space-y-2 mt-2">
                                <p className={`text-xs font-medium px-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Quick help:</p>
                                <div className="flex flex-wrap gap-2">
                                    {questions.map(q => (
                                        <button 
                                            key={q.id}
                                            onClick={() => handleSend(q.question)}
                                            className={`text-xs px-3 py-1.5 rounded-full border transition-colors shadow-sm ${
                                                darkMode 
                                                ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' 
                                                : 'bg-white border-gray-200 text-gray-700 hover:bg-[#F3F2FF]'
                                            }`}
                                        >
                                            {q.question}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className={`p-3 border-t flex-shrink-0 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
                        <form 
                            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                            className="flex items-center gap-2"
                        >
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Type your message..."
                                className={`flex-1 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-[#6C63FF] transition-all outline-none ${
                                    darkMode 
                                    ? 'bg-slate-800 text-slate-100 focus:bg-slate-700 placeholder:text-slate-500' 
                                    : 'bg-gray-100 text-gray-800 focus:bg-white placeholder:text-gray-400'
                                }`}
                            />
                            <button 
                                type="submit"
                                disabled={!inputValue.trim()}
                                style={!inputValue.trim() ? {} : { background: 'linear-gradient(135deg, #6C63FF, #9333EA)' }}
                                className={`text-white p-2 rounded-full transition-colors shadow-md cursor-pointer ${
                                    !inputValue.trim() 
                                    ? (darkMode ? 'bg-slate-700 opacity-50' : 'bg-gray-400 opacity-50') 
                                    : ''
                                }`}
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {!isOpen && (
                <button
                    onClick={toggleChat}
                    style={{ background: 'linear-gradient(135deg, #6C63FF, #9333EA)' }}
                    className="text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-110 flex items-center justify-center cursor-pointer"
                    aria-label="Help Chat"
                >
                    <MessageCircle size={24} />
                </button>
            )}
        </div>
    );
};

export default ChatWidget;