import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { House, LibraryBig, LogOut, BookOpen } from 'lucide-react';
import { auth } from '../firebase';
import logo from '../assets/huddlup_logo_white_w_trans.png';
import { useTeamsContext } from '../context/TeamsContext.jsx';

const NavBar = ({ user, openSignIn }) => {
  const location = useLocation();
  const { teams, selectedTeamId, setSelectedTeamId } = useTeamsContext();
  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  const handleChange = (e) => {
    setSelectedTeamId(e.target.value);
  };

  if (location.pathname === '/landing' || location.pathname === '/') {
    return null;
  }

  return (
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
          {teams.length > 0 && (
            <div className="flex items-center gap-2">
              {selectedTeam && selectedTeam.teamLogoUrl && (
                <img
                  src={selectedTeam.teamLogoUrl}
                  alt={`${selectedTeam.teamName} logo`}
                  className="h-6 w-6 object-cover rounded"
                />
              )}
              <select
                value={selectedTeamId}
                onChange={handleChange}
                className="bg-gray-700 text-white px-2 py-1 rounded text-sm"
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.teamName}
                  </option>
                ))}
              </select>
            </div>
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
  );
};

export default NavBar;
