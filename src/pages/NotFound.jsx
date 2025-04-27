import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="text-center mt-20">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">404 - Page Not Found</h1>
      <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
      <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Go to Login
      </Link>
    </div>
  );
}

export default NotFound;