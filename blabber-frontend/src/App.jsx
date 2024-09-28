import { useState } from 'react'

function App() {

  return (
    <div className=''>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <header className="bg-gray-100 w-full py-4">
          <h1 className="text-white text-4xl px-5 text-left logo-bg">Blabber</h1>
        </header>
        <main className="flex flex-col items-center mt-8 px-4">
          <h1 className="text-9xl mb-4 superlarge logo-bg">Blabber</h1>
          <div className='container mx-auto w-1/2 text-center'>
          <h2 className="text-2xl font-semibold mb-4">Generate custom meeting recaps, reports, and transcripts using AI</h2>
          <p className="text-center mb-8">
            Use Blabber to generate meeting recaps, reports, and transcripts for your meetings, interviews, and other conversations.
          </p>
          <button className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-blue-700">
            Get Started
          </button>
          </div>
        </main>
        <footer className="w-full py-4 bg-gray-100 text-center mt-auto">
          &copy; {new Date().getFullYear()} Blabber. All rights reserved.
        </footer>
      </div>
    </div>
  )
}

export default App
