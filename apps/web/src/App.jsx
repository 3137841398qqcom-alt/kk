import { BrowserRouter, Routes, Route } from "react-router-dom";
import Player from "./components/Player";
import QueuePanel from "./components/QueuePanel";
import HomePage from "./components/HomePage";
import SearchPage from "./components/SearchPage";
import LibraryPage from "./components/LibraryPage";
import "./App.css";

function AppLayout() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/library" element={<LibraryPage />} />
      </Routes>
      <QueuePanel />
      <Player />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
