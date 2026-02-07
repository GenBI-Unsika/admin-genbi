import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { ConfirmProvider } from './contexts/ConfirmContext.jsx';
import './index.css'; // index.css kamu (berisi token warna + plugin FlyonUI)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfirmProvider>
        <App />
      </ConfirmProvider>
    </BrowserRouter>
    <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
  </React.StrictMode>,
);
