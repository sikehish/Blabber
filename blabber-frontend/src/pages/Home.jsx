import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

function Home() {
  const {state} =useAuthContext()
  const navigate=useNavigate()
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Main content */}
      <div className="flex-grow flex items-center justify-center">
        <main className="flex flex-col items-center mt-8 px-4 text-center">
          {/* Blabber logo */}
          <h1 className="text-9xl mb-4 superlarge logo-bg">Blabber</h1>
          <div className="container mx-auto w-2/3">
            <h2 className="text-2xl font-semibold mb-4">
              Generate custom meeting recaps, reports, and transcripts using AI
            </h2>
            <p className="mb-8">
              Use Blabber to generate meeting recaps, reports, and transcripts for your meetings, interviews, and other conversations.
            </p>
            <button   onClick={() => state?.user ? navigate("/") : navigate("/login")} className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-blue-700">
              Get Started
            </button>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full py-4 bg-gray-100 text-center">
        &copy; {new Date().getFullYear()} Blabber. All rights reserved.
      </footer>
    </div>
  );
}

export default Home;
