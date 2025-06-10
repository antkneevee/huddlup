import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import PlayEditor from './PlayEditor';
import PlayLibrary from './components/PlayLibrary';
import PlaybookLibrary from './components/PlaybookLibrary';
import SignInModal from './components/SignInModal';
import LandingPage from './LandingPage';
import NavBar from './components/NavBar.js';

const AppContent = ({ user, openSignIn }) => {

  const [selectedPlay, setSelectedPlay] = useState(null);
  const navigate = useNavigate();

  const handleLoadPlay = (play) => {
    setSelectedPlay(play);
    navigate('/editor');  // Use navigate to stay within SPA and preserve state
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <NavBar user={user} openSignIn={openSignIn} />

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
