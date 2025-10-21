import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';

export default function RoleRedirect() {
  const { user } = useAuth();
  return user?.role === UserRole.MENTOR
    ? <Navigate to="/mentor" replace />
    : <Navigate to="/student" replace />;
}