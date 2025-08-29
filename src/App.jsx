import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import JobListPage from './pages/JobListPage';

function App() {
  return (
    <Router>
      <div>
        <Navigation />
        <main className="container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/jobs" element={<JobListPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
