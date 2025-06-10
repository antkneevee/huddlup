import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // ensure Tailwind is imported
import { TeamsContextProvider } from './context/TeamsContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TeamsContextProvider>
      <App />
    </TeamsContextProvider>
  </React.StrictMode>
);
