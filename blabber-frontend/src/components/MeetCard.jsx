import { useState } from 'react';
import Modal from 'react-modal';

// Helper function to format time to 12-hour AM/PM format with full date
const formatTime = (dateString) => {
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: 'numeric', 
    second: 'numeric', 
    hour12: true 
  };
  return new Date(dateString).toLocaleString('en-US', options);
};

// Helper function to calculate meeting duration
const calculateDuration = (start, end) => {
  const startTime = new Date(start);
  const endTime = new Date(end);
  const durationMs = endTime - startTime;

  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.ceil((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours} hour(s) ${minutes} minute(s)`;
};

const reportTypes = [
    { value: 'normal', label: 'Report' },
    { value: 'speaker_ranking', label: 'Speaker Report' },
    { value: 'sentiment', label: 'Sentiment Report' }
  ];
  
  const reportFormats = [
    { value: 'pdf', label: 'PDF' },
    { value: 'docx', label: 'DOCX' }
  ];
  
  // Modal Styles
  const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      padding: '20px',
      maxWidth: '400px',
      width: '100%',
      borderRadius: '10px',
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.1)', // Light transparent background
      zIndex: 1000, // Ensure it stays on top
    },
  };
  const MeetCard = ({ meet }) => {
    const [isModalOpen, setIsModalOpen] = useState(false); // Move modal state here
    const [reportType, setReportType] = useState('');
    const [reportFormat, setReportFormat] = useState('');
    const [meetingTitle, setMeetingTitle] = useState(meet.meetingTitle); // Use meet title from props
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
    const openModal = () => {
      setIsModalOpen(true);
      setMeetingTitle(meet.meetingTitle); // Ensure the correct title is set when modal opens
    };
  
    const closeModal = () => {
      setIsModalOpen(false);
      setMeetingTitle(meet.meetingTitle); // Reset title when modal closes
    };
  
    const handleGenerateReport = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
  
      const payload = {
        meeting_title: meetingTitle,
        report_type: reportType,
        report_format: reportFormat,
        meeting_id: meet._id,
      };
  
      try {
        const response = await fetch('/api/get-report', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to generate report');
        }
  
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
  
        const link = document.createElement('a');
        link.href = url;
        const fileExtension = reportFormat === 'pdf' ? 'pdf' : 'docx';
        link.download = `${meetingTitle.replace(/\s+/g, '_')}_report.${fileExtension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        meet.meetingTitle=meetingTitle
        closeModal();
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 m-4 w-full md:w-80 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex flex-col items-start">
                <h2 className="text-2xl font-bold text-blue-600 mb-2">{meet.meetingTitle}</h2>
                <p className="text-sm text-gray-500 mb-4">Hosted by <span className="font-semibold">{meet.convenor}</span></p>

                <div className="w-full border-b border-gray-300 mb-4"></div>

                <p className="mb-2">
                    <strong className="text-gray-600">Email:</strong> {meet.blabberEmail}
                </p>

                <p className="mb-2">
                    <strong className="text-gray-600">Start Time:</strong> {formatTime(meet.meetingStartTimeStamp)}
                </p>

                <p className="mb-2">
                    <strong className="text-gray-600">End Time:</strong> {formatTime(meet.meetingEndTimeStamp)}
                </p>

                <p className="mb-4">
                    <strong className="text-gray-600">Duration:</strong> {calculateDuration(meet.meetingStartTimeStamp, meet.meetingEndTimeStamp)}
                </p>

                <div className="w-full border-b border-gray-300 mb-4"></div>

                <p className="mb-2">
                    <strong className="text-gray-600">Speakers:</strong> {meet.speakers.length > 0 ? meet.speakers.join(', ') : 'No speakers'}
                </p>

                <p className="mb-2">
                    <strong className="text-gray-600">Attendees:</strong> {meet.attendees.length > 0 ? meet.attendees.join(', ') : 'No attendees'}
                </p>
            </div>

            <button
                onClick={openModal}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                Generate Report
            </button>

            {/* Modal for Report Generation */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel="Generate Report Modal"
            >
                <h2 className="text-xl font-bold mb-4">Generate Report for {meetingTitle}</h2>

                <form onSubmit={handleGenerateReport}>
                    {/* Meeting Title */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Meeting Title:</label>
                        <input
                            type="text"
                            value={meetingTitle}
                            onChange={(e) => setMeetingTitle(e.target.value)}
                            className="border rounded w-full py-2 px-3 text-gray-700"
                        />
                    </div>

                    {/* Report Type Dropdown */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Report Type:</label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="border rounded w-full py-2 px-3 text-gray-700"
                            required
                        >
                            <option value="">Select Report Type</option>
                            {reportTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Report Format Dropdown */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Report Format:</label>
                        <select
                            value={reportFormat}
                            onChange={(e) => setReportFormat(e.target.value)}
                            className="border rounded w-full py-2 px-3 text-gray-700"
                            required
                        >
                            <option value="">Select Report Format</option>
                            {reportFormats.map((format) => (
                                <option key={format.value} value={format.value}>
                                    {format.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        {error && <p className="text-red-500 mb-4">{error}</p>}

                        <button
                            type="button"
                            className="mr-2 px-4 py-2 bg-gray-300 rounded"
                            onClick={closeModal}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`px-4 py-2 bg-blue-500 text-white rounded ${loading ? 'opacity-50' : 'hover:bg-blue-600'}`}
                            disabled={loading}
                        >
                            {loading ? 'Generating...' : 'Generate Report'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default MeetCard;
