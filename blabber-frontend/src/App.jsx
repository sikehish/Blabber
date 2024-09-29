import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import GoogleSuccess from './pages/redirects/GoogleSuccess';
import GoogleFailure from './pages/redirects/GoogleFailure';
import SignInPage from './pages/SignInPage';
import HomePage from './pages/Home';
import Navbar from "./components/Navbar";
import Footer from './components/Footer';
import { useAuthContext } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './pages/Dashboard';

function App() {
  const { state } = useAuthContext();
  
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={state?.user ? <Navigate to="/dashboard" /> : <HomePage />} />
        <Route path="/success" element={state?.user ? <GoogleSuccess /> : <Navigate to="/" />} />
        <Route path="/failed" element={!state?.user ? <GoogleFailure /> : <Navigate to="/" />} />
        <Route path="/login" element={!state?.user ? <SignInPage /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={state?.user ? <Dashboard /> : <Navigate to="/login" />} />
      </Routes>
      <ToastContainer />
      <Footer />
    </Router>
  );
}

export default App;
