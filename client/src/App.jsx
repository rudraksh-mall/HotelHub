import { useState } from "react";
import Navbar from "./components/Navbar";
import { Route,Routes, useLocation } from "react-router-dom";
import Home from "./Pages/Home";
function App() {
  const isOwnerPath = useLocation().pathname.includes("owner");
  return (
    <div>
      {!isOwnerPath && <Navbar />}
      <div className="min-h-[70vh]">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
