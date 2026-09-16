import { Routes, Route } from "react-router-dom";
import TestBoard from "./pages/TestBoard";

export default function App() {
  return (
    <Routes>
      <Route path="/test-board" element={<TestBoard />} />
    </Routes>
  );
}