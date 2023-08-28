import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { TourProvider } from "@reactour/tour";
import { VStack, Text } from "@chakra-ui/react";

import { Home, Workspace, VideoQuery } from "./pages";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/workspace" element={<Workspace />} />
      <Route path="/videoquery" element={<VideoQuery />} />
    </Routes>
  );
};

export default App;
