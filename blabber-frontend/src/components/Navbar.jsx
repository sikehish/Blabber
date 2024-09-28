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
    <nav className="bg-gray-800 p-4 flex justify-between items-center">
      {/* Left side - Blabber logo */}
      <div className="text-white text-2xl font-bold">
        <Link to="/" className="logo-bg">
          Blabber
        </Link>
      </div>

      {/* Right side - Navigation links and user greeting */}
      <div className="flex items-center space-x-4">
        {state?.user ? (
          <>
            <span className="text-white text-lg">
              Hey, <strong>{state.user.name}</strong>!
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/" className="text-white hover:text-purple-400">
              Home
            </Link>
            <Link to="/login" className="text-white hover:text-purple-400">
              Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
