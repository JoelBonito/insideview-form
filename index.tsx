import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SupabaseStatusProvider } from './lib/SupabaseStatusContext';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <SupabaseStatusProvider>
      <App />
    </SupabaseStatusProvider>
  </React.StrictMode>
);