import { useEffect, useState } from 'react';
import MeetCard from '../components/MeetCard';

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
      // Fetch the auto-enabled state for the user from the server
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
    setAutoEnabled(!autoEnabled); // Toggle the state

    // Send updated autoEnabled state to the server
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
    <div className="relative">
      <div className="flex flex-col items-center p-6">
        <div className="flex justify-between w-full items-center mb-4">
          <h1 className="text-2xl font-bold">Meet Dashboard</h1>
          
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

        {loading && (
          <div className="text-lg text-gray-500">Loading meets...</div>
        )}

        {error && (
          <div className="text-red-500 mb-4">{error}</div>
        )}

        <div className="flex flex-wrap justify-center">
          {!error && meets.length === 0 && !loading && (
            <div className="text-lg text-gray-500">No meets available.</div>
          )}

          {meets.map(meet => (
            <MeetCard
              key={meet._id}
              meet={meet}
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
            />
          ))}
        </div>
      </div>

      {/* Dim background when modal is open */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black opacity-50 z-40"></div>
      )}
    </div>
  );
};

export default Dashboard;
