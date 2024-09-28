import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function GoogleFailure() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4 text-center">
        <h1 className="text-2xl font-bold text-red-600">Login failed!</h1>
        <p className="text-gray-700">You'll be redirected to the login page in a while...</p>
      </div>
    </div>
  );
}

export default GoogleFailure;