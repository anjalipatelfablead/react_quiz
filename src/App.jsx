import AppRoutes from './routes/app_route';
import './App.css';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <div className="App min-h-screen bg-gray-50">
      <AppRoutes />
      <ChatWidget />

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />
    </div>
  );
}

export default App;