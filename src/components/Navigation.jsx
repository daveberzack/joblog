import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav>
      <div className="container">
        <Link to="/" className="logo">
          JobLog
        </Link>
        
        <div className="nav-links">
          <Link
            to="/"
            className={isActive('/') ? 'active' : ''}
          >
            Home
          </Link>
          <Link
            to="/jobs"
            className={isActive('/jobs') ? 'active' : ''}
          >
            My Jobs
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;