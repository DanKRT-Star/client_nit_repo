import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../context/authUtils';

export default function RoleRedirect() {
  const { user } = useAuth();
  return user?.role === UserRole.LECTURER
    ? <Navigate to="/lecturer" replace />
    : <Navigate to="/student" replace />;
}