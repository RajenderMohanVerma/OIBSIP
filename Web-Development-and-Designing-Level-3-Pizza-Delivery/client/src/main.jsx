import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            background: '#fffdf8',
            color: '#201914',
            border: '1px solid #e8ddd0',
            boxShadow: '0 4px 12px rgba(32,25,20,0.12)',
          },
          success: {
            iconTheme: { primary: '#4f8a4f', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#b33a3a', secondary: '#fff' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);

