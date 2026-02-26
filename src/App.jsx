import { useState } from 'react';
import AppRoutes from './routes/user_route';
import Navbar from './components/navbar';
import Sidebar from './components/sidebar';
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="App">
      <Navbar onMenuClick={openSidebar} />
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <AppRoutes />
    </div>
  );
}

export default App;
