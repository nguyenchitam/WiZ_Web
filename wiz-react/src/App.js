import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import BulbList from "./components/BulbList";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" exact={true} element={<BulbList />} />
      </Routes>
    </Router>
  );
};

export default App;
