import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GoogleSuccess from './pages/redirects/GoogleSuccess';
import GoogleFailure from './pages/redirects/GoogleFailure'; // Fixed import statement
import SignInPage from './pages/SignInPage';
import HomePage from './pages/Home';
import Navbar from "./components/Navbar";
import Footer from './components/Footer';
import { useAuthContext } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './pages/dashboard';

function App() {
  const { state } = useAuthContext();

  return (
    <Router>
      <Navbar />
      <Routes>
      {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      {state?.user ?  <Route path="/success" element={<GoogleSuccess />}/> :<Route path="/" element={<HomePage />} /> }
      {!(state?.user) ? <Route path="/failed" element={<GoogleFailure />}/> : <Route path="/" element={<HomePage />} />}
      {!(state.user) ? <Route path="/login" element={<SignInPage />} />: <Route path="/" element={<HomePage />} />}
      <Route path="/" element={<HomePage />} />
      </Routes>
      <ToastContainer />
      <Footer />
    </Router>
  );
}

export default App;
