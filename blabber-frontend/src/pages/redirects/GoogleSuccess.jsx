import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext'

function GoogleSuccess() {
  const navigate = useNavigate();
  const { state } = useAuthContext();

  useEffect(() => {
    if (!state?.user) {
      navigate('/login');
      return;
    }
    const timer = setTimeout(() => {
      navigate('/');
    }, 3000);
    return () => clearTimeout(timer);
  }, [state.user, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4 text-center">
        <h1 className="text-2xl font-bold text-green-600">You're logged in successfully!</h1>
        <p className="text-gray-700">You'll be redirected in a while...</p>
      </div>
    </div>
  );
}

export default GoogleSuccess;