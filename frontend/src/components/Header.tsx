import { useAuth0 } from '@auth0/auth0-react';
import '../styles/Header.css';

interface HeaderProps {
  onProfileClick?: () => void;
}

export default function Header({ onProfileClick }: HeaderProps) {
  const { user, logout, isAuthenticated } = useAuth0();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="header-title">BoraEntregar</h1>
        </div>

        <div className="header-right">
          <button
            className="user-info user-info-clickable"
            onClick={onProfileClick}
            title="Ver perfil"
          >
            {user?.picture && (
              <img
                src={user.picture}
                alt={user.name || 'User'}
                className="user-avatar"
              />
            )}
            <div className="user-details">
              <span className="user-name">{user?.name || user?.email}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </button>

          <button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className="logout-button"
          >
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}
