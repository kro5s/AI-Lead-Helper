import { Button } from '@alfalab/core-components/button';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo/Logo';
import { ROUTES } from '../../constants/routes';
import { useAuthState } from '../../hooks/useAuthState';
import { setMockAccessToken } from '../../utils/auth';
import styles from './AuthPage.module.css';

type LocationState = {
  from?: Location;
};

export function AuthPage() {
  const authenticated = useAuthState();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState | null;
  const returnPath = locationState?.from?.pathname ?? ROUTES.SIGNIFICANT_EVENTS;

  if (authenticated) {
    return <Navigate replace to={returnPath} />;
  }

  const handleSsoLogin = () => {
    setMockAccessToken();
    navigate(returnPath, { replace: true });
  };

  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <Logo />
        <Button className={styles.loginButton} size={48} view="primary" onClick={handleSsoLogin}>
          Войти через SSO
        </Button>
      </div>
    </main>
  );
}
