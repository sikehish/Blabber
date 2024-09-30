import { useEffect, useState } from 'react';
import MeetCard from '../components/MeetCard';
import { FaExclamationCircle, FaSpinner, FaCalendarTimes } from 'react-icons/fa';

const Dashboard = () => {
  const [meets, setMeets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [autoEnabled, setAutoEnabled] = useState(false); // State for auto-enabled toggle

  useEffect(() => {
    const fetchMeets = async () => {
      setLoading(true); // Start loading
      setError(null); // Reset any previous errors

      try {
        const response = await fetch('/api/meet', {
          method: "GET",
          credentials: 'include'
        });

        const data = await response.json();
        if (!response.ok) throw (data);
        setMeets(data || []); // Assuming your API returns an array of meets
      } catch (error) {
        setError(error.message); // Set error message
      } finally {
        setLoading(false); // End loading
      }
    };

    const fetchAutoEnabled = async () => {
      try {
        const response = await fetch('/api/auto-enabled', {
          method: 'GET',
          credentials: 'include',
        });
        const { autoEnabled } = await response.json();
        setAutoEnabled(autoEnabled || false);
      } catch (error) {
        console.error("Error fetching auto-enabled status:", error);
      }
    };

    fetchMeets();
    fetchAutoEnabled();
  }, []);

  const handleToggleChange = async () => {
    setAutoEnabled(!autoEnabled);

    try {
      await fetch('/api/auto-enabled', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ autoEnabled: !autoEnabled }),
      });
    } catch (error) {
      console.error("Error updating auto-enabled status:", error);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center p-6">
      <div className="flex justify-between w-full items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Meet Dashboard</h1>

        <div className="flex items-center">
          <span className="mr-2 text-gray-700">Get email report after every meet</span>
          <button
            className={`relative inline-flex items-center h-6 rounded-full w-11 focus:outline-none ${autoEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
            onClick={handleToggleChange}
          >
            <span
              className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform ${
                autoEnabled ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center mt-10">
          <FaSpinner className="animate-spin text-blue-500 text-4xl mb-2" />
          <span className="text-xl font-semibold text-blue-500">Loading meets...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex flex-col items-center justify-center mt-10">
          <FaExclamationCircle className="text-red-500 text-4xl mb-2" />
          <span className="text-xl font-semibold text-red-500">{error}</span>
        </div>
      )}

      {/* No Meets Available State */}
      {!loading && !error && meets.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-10">
          <FaCalendarTimes className="text-gray-500 text-4xl mb-2" />
          <span className="text-xl font-semibold text-gray-500">No meets available.</span>
        </div>
      )}

      {/* Meet Cards */}
      <div className="flex flex-wrap justify-center mt-6">
        {meets.map(meet => (
          <MeetCard
            key={meet._id}
            meet={meet}
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
          />
        ))}
      </div>

      {/* Dim background when modal is open */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black opacity-50 z-40"></div>
      )}
    </div>
  );
};

export default Dashboard;
