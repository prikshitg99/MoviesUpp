import React, { useState, useEffect } from 'react';
import './App.css';
//components
import Main from './components/Main';

function App() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const toggleMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`App ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <button className="toggle-mode-btn" onClick={toggleMode}>
        {darkMode ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
      </button>
      <h1 className="app-title">MoviesUpp <br/><br/>By Prikshit Grover<br/><br/></h1>
      <Main darkMode={darkMode} toggleMode={toggleMode} />
    </div>
  );
}

export default App;