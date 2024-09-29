
function Welcome() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 text-gray-800 pt-20">
      <header className="text-center mb-10">
        <h1 className="text-6xl font-bold text-purple-900 mb-4">Welcome to Blabber!</h1>
        <p className="text-xl text-gray-900">Your AI-powered meeting companion</p>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <section className="mb-10">
          <h2 className="text-3xl font-semibold text-purple-700 mb-4">What is Blabber?</h2>
          <p className="text-lg leading-relaxed text-gray-800">
            Blabber is a Chrome extension designed to help you manage and document your meetings seamlessly. With its AI-enabled features, you can easily keep track of your meetings, attendees, and speakers while generating comprehensive reports.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-3xl font-semibold text-purple-700 mb-4">Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-6 border border-purple-300 rounded-lg shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
              <span className="text-6xl mb-2">📋</span>
              <h3 className="font-semibold text-lg">Track Your Meetings</h3>
              <p className="text-sm text-gray-900">Easily keep track of your meets and attendees.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 border border-purple-300 rounded-lg shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
              <span className="text-6xl mb-2">📝</span>
              <h3 className="font-semibold text-lg">Generate Reports</h3>
              <p className="text-sm text-gray-900">Create customizable reports in PDF and DOCX formats.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 border border-purple-300 rounded-lg shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
              <span className="text-6xl mb-2">✉️</span>
              <h3 className="font-semibold text-lg">Email Reports</h3>
              <p className="text-sm text-gray-900">Send reports directly to users' email addresses.</p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-3xl font-semibold text-purple-700 mb-4">Reporting Customizations</h2>
          <p className="text-lg leading-relaxed text-gray-700 mb-4">
            Customize your reports with different styles:
          </p>
          <ul className="list-disc pl-8 text-gray-900 space-y-2">
            <li>📊 <strong>Speaker-Based Reports:</strong> Focus on individual speakers and their contributions.</li>
            <li>⏱️ <strong>Interval-Based Reports:</strong> Analyze discussions based on time intervals.</li>
            <li>💬 <strong>Sentiment-Based Reports:</strong> Get insights into the emotional tone of the meeting.</li>
            <li>🗒️ <strong>General Reports:</strong> Overview of all meeting details and key points.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-3xl font-semibold text-purple-700 mb-4">Screenshots Included!</h2>
          <p className="text-lg leading-relaxed text-gray-700">
            Capture screenshots during your meetings and include them in your reports for better context and clarity.
          </p>
        </section>
      </main>

      <footer className="mt-10 mb-4">
        <p className="text-sm text-gray-500">Made with ❤️ by the Blabber team</p>
      </footer>
    </div>
  );
}

export default Welcome;
