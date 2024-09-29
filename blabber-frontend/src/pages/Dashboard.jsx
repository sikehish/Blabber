// src/Dashboard.jsx
import { useEffect, useState } from 'react';
import MeetCard from '../components/MeetCard';

const Dashboard = () => {
  const [meets, setMeets] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    const fetchMeets = async () => {
      setLoading(true); // Start loading
      setError(null); // Reset any previous errors

      try {
        const response = await fetch('/api/meet', {
            method: "GET",
            credentials: 'include'
        }); // Adjust the URL if needed

        const data = await response.json();
        console.log(data)
        if(!(response.ok)) throw(data)
        setMeets(data || []); // Assuming your API returns an object with a "meets" array
      } catch (error) {
        setError(error.message); // Set error message
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchMeets();
  }, []);

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-2xl font-bold mb-4">Meet Dashboard</h1>

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
          <MeetCard key={meet._id} meet={meet} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
