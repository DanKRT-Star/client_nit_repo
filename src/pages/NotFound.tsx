import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  
  return (
    <div>
      <h1>404 Not Found</h1>
      <button onClick={() => navigate('/')}>Go to Home</button>
    </div>
  );
}