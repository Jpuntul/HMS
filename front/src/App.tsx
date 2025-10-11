import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PersonList from "./pages/PersonList";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/persons" element={<PersonList />} />
      </Routes>
    </Router>
  );
}

export default App;
