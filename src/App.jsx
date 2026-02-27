import { useState } from 'react';
import AppRoutes from './routes/app_route';
import Navbar from './components/navbar';
import Sidebar from './components/sidebar';
import './App.css';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="App">
      <Navbar onMenuClick={openSidebar} />
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <AppRoutes />

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
