import React from 'react';
import './App.css';
import HomeScreen from './screens/HomeScreen';
import LoginSreen from './screens/LoginSreen';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
function App() {
  const user = null;
  return (
    <div className="app">
      <Router>
        {!user ? (<LoginSreen />) : (
          <Routes>
            <Route path="/" element={<HomeScreen />} />
          </Routes>
        )}
      </Router>
    </div>
  );
}

export default App;
