import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import PlayEditor from './PlayEditor';
import PlayLibrary from './components/PlayLibrary';
import PlaybookLibrary from './components/PlaybookLibrary';
import SignInModal from './components/SignInModal';
import LandingPage from './LandingPage';

import { House, LibraryBig, LogOut, BookOpen, Users, Globe } from 'lucide-react';
import TeamsPage from './pages/TeamsPage.jsx';
import logo from './assets/huddlup_logo_white_w_trans.png';


const AppContent = ({ user, openSignIn }) => {

  const [selectedPlay, setSelectedPlay] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.email === import.meta.env.VITE_SITE_OWNER_EMAIL;

  const handleLoadPlay = (play) => {
    setSelectedPlay(play);
    navigate('/editor');  // Use navigate to stay within SPA and preserve state
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">

      {/* Header */}
      {location.pathname !== '/landing' && location.pathname !== '/' && (
      <header className="w-full bg-gray-800">
        <div className="w-full flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="huddlup logo" className="h-8" />
            <h1 className="text-xl font-bold">Design. Huddle. Dominate.</h1>
          </div>
          <nav className="flex flex-nowrap gap-2 items-center">
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
              <House className="w-4 h-4 mr-1" /> Editor
            </Link>
            <Link
              to="/library"
              className="flex items-center bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
            >
              <LibraryBig className="w-4 h-4 mr-1" /> Play Library
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
            {isAdmin && (
              <Link
                to="/all-plays"
                className="flex items-center bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
              >
                <Globe className="w-4 h-4 mr-1" /> All Plays
              </Link>
            )}
            {user ? (
              <>
                <span className="mx-2 text-sm">{user.email}</span>
                <button
                  onClick={() => signOut(auth)}
                  className="flex items-center bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
                >
                  <LogOut className="w-4 h-4 mr-1" /> Sign Out
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
          <Route
            path="/teams"
            element={<TeamsPage user={user} openSignIn={openSignIn} />}
          />
          {isAdmin && (
            <Route
              path="/all-plays"
              element={
                <PlayLibrary
                  onSelectPlay={handleLoadPlay}
                  user={user}
                  openSignIn={openSignIn}
                  adminMode
                />
              }
            />
          )}
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
