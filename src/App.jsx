import React from 'react';
// src/main.jsx o src/App.jsx
import 'bootstrap/dist/css/bootstrap.min.css';
import CardComponent from './components/CardComponent';

function App() {
  return (
    <div className="App">
      <h1>Pokemon Cards</h1>
      <CardComponent />
    </div>
  );
}

export default App;

