import React from 'react';
import { Link } from 'react-router-dom';
import logo from './assets/huddlup_logo_white_w_trans.png';
import playImage from './assets/test_play_for_marketing.png';
import playbookBg from './assets/playbook_bg.png';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Header */}
      <header className="w-full bg-gray-800">
        <div className="w-full flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-3">
          <img src={logo} alt="huddlup logo" className="h-8" />
            <h1 className="text-xl font-bold">Flag Football Play Designer</h1>
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
      <section
        className="hero flex flex-col items-center justify-center text-center py-20 relative"
        style={{
          backgroundImage: `url(${playbookBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <img src={playImage} alt="Play Design" className="max-w-md mb-6 z-10" />
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
            <h3 className="text-xl font-semibold mb-2 text-[#7AC142]">Design</h3>
            <p>Create and customize flag football plays with ease.</p>
          </div>
          <div className="p-4">
            <h3 className="text-xl font-semibold mb-2 text-[#7AC142]">Huddle</h3>
            <p>Get ideas from curated playbooks and a global library, then easily share with your team.</p>
          </div>
          <div className="p-4">
            <h3 className="text-xl font-semibold mb-2 text-[#7AC142]">Dominate</h3>
            <p>Put your plays into action and lead your team to victory.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-[#B2B7BB] text-center py-4 mt-auto">
        &copy; 2024 huddlup
      </footer>
    </div>
  );
};

export default LandingPage;
