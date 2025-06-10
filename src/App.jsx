import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import PlayEditor from './PlayEditor';
import PlayLibrary from './components/PlayLibrary';
import PlaybookLibrary from './components/PlaybookLibrary';
import SignInModal from './components/SignInModal';
import LandingPage from './LandingPage';

import { Home, Book, BookOpen, Users } from 'lucide-react';
import TeamsPage from './pages/TeamsPage.jsx';
import logo from './assets/huddlup_logo_white_w_trans.png';


const AppContent = ({ user, openSignIn }) => {

  const [selectedPlay, setSelectedPlay] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLoadPlay = (play) => {
    setSelectedPlay(play);
    navigate('/editor');  // Use navigate to stay within SPA and preserve state
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">

      {/* Header */}
      {location.pathname !== '/landing' && location.pathname !== '/' && (
      <header className="w-full bg-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="HuddlUp Logo" className="h-8" />
            <h1 className="text-xl font-bold">Design. Huddle. Dominate.</h1>
          </div>
          <nav className="flex flex-wrap gap-2 items-center">
            <Link
              to="/"
              className="flex items-center bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
            >
              Home
            </Link>
            <Link
              to="/editor"
              className="flex items-center bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
            >
              <Home className="w-4 h-4 mr-1" /> Editor
            </Link>
            <Link
              to="/library"
              className="flex items-center bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
            >
              <Book className="w-4 h-4 mr-1" /> Play Library
            </Link>
            <Link
              to="/playbooks"
              className="flex items-center bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
            >
              <BookOpen className="w-4 h-4 mr-1" /> Playbooks
            </Link>
            <Link
              to="/teams"
              className="flex items-center bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
            >
              <Users className="w-4 h-4 mr-1" /> Teams
            </Link>
            {user ? (
              <>
                <span className="mx-2 text-sm">{user.email}</span>
                <button
                  onClick={() => signOut(auth)}
                  className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={openSignIn}
                className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
              >
                Sign In
              </button>
            )}
            </nav>

        </div>
      </header>
      )}


      {/* Main Content */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route
            path="/editor"
            element={<PlayEditor loadedPlay={selectedPlay} openSignIn={openSignIn} />}
          />
          <Route
            path="/library"
            element={
              <PlayLibrary
                onSelectPlay={handleLoadPlay}
                user={user}
                openSignIn={openSignIn}
              />
            }
          />
          <Route
            path="/playbooks"
            element={<PlaybookLibrary user={user} openSignIn={openSignIn} />}
          />
          <Route path="/teams" element={<TeamsPage />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [showSignInModal, setShowSignInModal] = useState(false);

  const openSignIn = useCallback(() => setShowSignInModal(true), []);


  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return unsub;
  }, []);

  return (
    <Router>
      <AppContent user={user} openSignIn={openSignIn} />
      {showSignInModal && (
        <SignInModal onClose={() => setShowSignInModal(false)} />
      )}

    </Router>
  );
};

export default App;
