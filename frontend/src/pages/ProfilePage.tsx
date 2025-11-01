import { useUserProfile } from '../hooks';
import '../styles/ProfilePage.css';

export default function ProfilePage() {
  const { profile, isLoading } = useUserProfile();

  if (isLoading) {
    return (
      <div className="profile-loading">
        <span className="spinner large"></span>
        <p>Carregando perfil...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-error">
        <h2>Erro ao carregar perfil</h2>
        <p>Não foi possível carregar as informações do seu perfil.</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Meu Perfil</h1>
          <p>Informações da sua conta</p>
        </div>

        <div className="profile-card">
          <div className="profile-avatar-section">
            {profile.picture ? (
              <img
                src={profile.picture}
                alt={profile.name || 'User'}
                className="profile-avatar-large"
              />
            ) : (
              <div className="profile-avatar-placeholder">
                <svg
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            )}
          </div>

          <div className="profile-info">
            <div className="profile-info-item">
              <label>Nome</label>
              <div className="profile-info-value">
                {profile.name || 'Não informado'}
              </div>
            </div>

            <div className="profile-info-item">
              <label>Email</label>
              <div className="profile-info-value">
                {profile.email || 'Não informado'}
              </div>
            </div>

            <div className="profile-info-item">
              <label>ID do Usuário</label>
              <div className="profile-info-value profile-id">
                {profile.userId}
              </div>
            </div>
          </div>
        </div>

        <div className="profile-stats">
          <h2>Estatísticas</h2>
          <p className="profile-stats-description">
            Seus dados de processamento são privados e isolados. Apenas você
            pode visualizá-los e gerenciá-los.
          </p>
          <div className="profile-stats-grid">
            <div className="stat-card">
              <svg
                className="stat-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="stat-label">Em breve</div>
              <div className="stat-value">Em breve</div>
            </div>

            <div className="stat-card">
              <svg
                className="stat-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <div className="stat-label">Em breve</div>
              <div className="stat-value">Em breve</div>
            </div>

            <div className="stat-card">
              <svg
                className="stat-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <div className="stat-label">Em Breve</div>
              <div className="stat-value">Em breve</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
