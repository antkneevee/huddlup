import React from 'react';
import { Link } from 'react-router-dom';
import logo from './assets/huddlup_logo_white_w_trans.png';
import playImage from './assets/test_play_for_marketing.png';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Header */}
      <header className="w-full bg-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="HuddlUp Logo" className="h-8" />
            <h1 className="text-xl font-bold">huddlup</h1>
          </div>
          <Link
            to="/editor"
            className="bg-[#7AC142] text-black font-semibold px-4 py-1 rounded hover:bg-[#002A5C] hover:text-white"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="hero flex flex-col items-center justify-center text-center py-20 relative">
        <img src={playImage} alt="Play Design" className="max-w-md mb-6 z-10" />
        <h2 className="text-4xl font-bold mb-4">Design. Huddle. Dominate.</h2>
        <Link
          to="/editor"
          className="bg-[#7AC142] text-black px-6 py-3 rounded font-semibold hover:bg-[#002A5C] hover:text-white transition-colors z-10"
        >
          Get Started
        </Link>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div className="p-4">
            <h3 className="text-xl font-semibold mb-2 text-[#7AC142]">Design Plays</h3>
            <p>Create and customize flag football plays with ease.</p>
          </div>
          <div className="p-4">
            <h3 className="text-xl font-semibold mb-2 text-[#7AC142]">Collaborate &amp; Share</h3>
            <p>Work with your team and share strategies instantly.</p>
          </div>
          <div className="p-4">
            <h3 className="text-xl font-semibold mb-2 text-[#7AC142]">Win Games</h3>
            <p>Execute your plays on the field and dominate the game.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-[#B2B7BB] text-center py-4 mt-auto">
        &copy; 2024 HuddlUp
      </footer>
    </div>
  );
};

export default LandingPage;
