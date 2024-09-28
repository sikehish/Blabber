
const SignInPage = () => {
const handleGoogleSignIn = (e) => {
    e.preventDefault();
    // const callbackUrl ="/api/oauth/google";
	    const callbackUrl= "http://localhost:3000/api/oauth/google"
    window.open(callbackUrl, "_self");
};
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 to-blue-500 flex flex-col justify-center items-center">
      {/* Header */}
      <div className="bg-white shadow-lg rounded-lg p-10 max-w-lg text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-5">Welcome to Blabber</h1>
        <p className="text-lg text-gray-700 mb-6">Your one-stop solution for smart, real-time meeting transcripts and summaries.</p>
        
        {/* Features */}
        <div className="mb-6">
          <ul className="text-left text-gray-600 space-y-2">
            <li>🎤 <span className="font-medium">Real-time Transcripts</span> for all your meetings.</li>
            <li>🧠 <span className="font-medium">AI-powered Summaries</span> for easy meeting insights.</li>
            <li>🔍 <span className="font-medium">Speaker Identification</span> to track who said what.</li>
            <li>📊 <span className="font-medium">Organized History</span> of all your meeting reports.</li>
          </ul>
        </div>

        {/* Sign in with Google Button */}
        <button
          onClick={handleGoogleSignIn}
          className="flex items-center justify-center w-full bg-red-500 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-red-600 transition duration-200"
        >
          <img src="https://yt3.googleusercontent.com/viNp17XpEF-AwWwOZSj_TvgobO1CGmUUgcTtQoAG40YaYctYMoUqaRup0rTxxxfQvWw3MvhXesw=s900-c-k-c0x00ffffff-no-rj" alt="Google Logo" className="w-6 h-6 mr-2" />
          Sign In with Google
        </button>

        {/* Additional Info */}
        <p className="mt-6 text-gray-500 text-sm">
          Secure and seamless Google sign-in. We respect your privacy and only collect necessary information for the app to work.
        </p>
      </div>

      {/* Footer */}
      <footer className="mt-10 text-center text-white">
        <p>&copy; 2024 Blabber. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default SignInPage;
