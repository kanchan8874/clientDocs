/**
 * MAIN.JS - React App ka Entry Point
 * 
 * Yeh file React application ko start karti hai.
 * 
 * Flow:
 * 1. HTML file me 'root' element find karta hai
 * 2. Usme React app render karta hai
 * 3. App.js component load hota hai (jo routing handle karta hai)
 * 
 * Entry Point = Application ka starting point - yaha se sab kuch start hota hai
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';      // Main App component - routing aur layout handle karta hai
import './index.css';             // Global CSS styles

// React app ko HTML me render karo
// document.getElementById('root') - index.html me root element hai
// ReactDOM.createRoot() - React 18 ka new way hai app render karne ka
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* StrictMode - Development me extra checks karta hai (warnings, etc.) */}
    <App />
  </React.StrictMode>
);
