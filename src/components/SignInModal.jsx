import React, { useState } from 'react';
import { auth } from '../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { X } from 'lucide-react';
import logo from '../assets/huddlup_logo_white_w_trans.png';

const SignInModal = ({ onClose }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="relative bg-gray-800 text-white rounded p-6 w-full max-w-sm">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>
        <div className="text-center mb-4">
          <img src={logo} alt="huddlup logo" className="h-10 mx-auto" />
        </div>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="p-2 rounded bg-gray-700 text-white"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="p-2 rounded bg-gray-700 text-white"
            required
          />
          <button
            type="submit"
            className="mt-2 px-3 py-1 rounded bg-blue-600 hover:bg-blue-500"
          >
            {isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>
        <button
          onClick={() => setIsRegister(!isRegister)}
          className="text-sm text-blue-300 mt-2"
        >
          {isRegister ? 'Already have an account?' : 'Need an account?'}
        </button>
      </div>
    </div>
  );
};


export default SignInModal;
