import { Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

function Navbar() {
  const { state, dispatch } = useAuthContext();

  async function handleLogout() {
    await fetch("/api/oauth/logout");
    toast.success("Logged out!");
    dispatch({ type: "LOGOUT" });
  }

  return (
    <nav className="bg-purple-900 p-4 flex justify-between items-center">
      {/* Left side - Blabber logo */}
      <div className="text-white text-2xl font-bold hover:rounded-lg hover:bg-white p-1">
        <Link to="/" className="nav-name">
          Blabber
        </Link>
      </div>

      {/* Right side - Navigation links and user greeting */}
      <div className="flex items-center space-x-4">
        {state?.user ? (
          <>
           <Link to="/home" className="text-white hover:text-blue-900 hover:rounded-lg hover:bg-white p-1">
              Home
            </Link>
             <Link to="/dashboard" className="text-white hover:text-blue-900 hover:rounded-lg hover:bg-white p-1">
              Dashboard
            </Link>
            <span className="text-white text-lg">
              Hey, <strong>{state.user.name}</strong>!
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white py-1 px-2 rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/" className="text-white hover:text-blue-900 hover:rounded-lg hover:bg-white p-1">
              Home
            </Link>
            <Link to="/login" className="text-white hover:text-blue-900 hover:rounded-lg hover:bg-white p-1">
              Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
