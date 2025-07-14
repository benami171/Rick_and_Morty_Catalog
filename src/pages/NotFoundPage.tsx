import { useNavigate } from "react-router-dom";

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 text-center">
          <h1 className="display-1">404</h1>
          <h2 className="mb-4">Page Not Found</h2>
          <p className="lead">
            The page you're looking for doesn't exist in this dimension.
          </p>
          <button 
            className="btn btn-primary btn-lg" 
            onClick={() => navigate('/')}
          >
            Return to Characters
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
