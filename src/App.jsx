import AppRoutes from './routes/user_route';
import Navbar from './components/navbar';
import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />
      <AppRoutes />
    </div>
  );
}

export default App;
