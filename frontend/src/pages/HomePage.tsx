interface HomeProps {
  onGetStarted: () => void;
}

export default function Home({ onGetStarted }: HomeProps) {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        {/* Video Background */}
        <div className="video-background">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="hero-video"
            onError={(e) => console.error('Video error:', e)}
            onLoadedData={() => console.log('Video loaded successfully')}
          >
            <source src="/videos/boraentregar.animated.mp4" type="video/mp4" />
            Seu navegador não suporta vídeos.
          </video>
          <div className="video-overlay"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Sistema Inteligente de Rotas</span>
          </div>

          <h1 className="hero-title">
            Organize suas entregas de forma{' '}
            <span className="highlight">simples e eficiente</span>
          </h1>

          <p className="hero-description">
            Agrupe automaticamente seus endereços de entrega por proximidade geográfica.
            Economize tempo, reduza custos e otimize suas rotas em poucos cliques.
          </p>

          <div className="hero-actions">
            <button onClick={onGetStarted} className="btn-primary">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Começar Agora
            </button>

            <button className="btn-secondary" onClick={() => {
              const featuresSection = document.getElementById('features');
              featuresSection?.scrollIntoView({ behavior: 'smooth' });
            }}>
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Saber Mais
            </button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-card card-1">
            <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Planilha</span>
          </div>

          <div className="visual-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>

          <div className="visual-card card-2">
            <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span>Rotas Otimizadas</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2>Como Funciona</h2>
          <p>Três passos simples para otimizar suas entregas:</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-number">1</div>
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3>Envie sua Planilha</h3>
            <p>Faça upload do seu arquivo Excel com os endereços de entrega. Formato simples e compatível.</p>
          </div>

          <div className="feature-card">
            <div className="feature-number">2</div>
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <h3>Processamento Automático</h3>
            <p>Nossa inteligência agrupa os endereços por proximidade de forma automática e instantânea.</p>
          </div>

          <div className="feature-card">
            <div className="feature-number">3</div>
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <h3>Baixe o Resultado</h3>
            <p>Receba sua planilha otimizada com as rotas agrupadas, pronta para usar.</p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="section-header">
          <h2>Benefícios</h2>
          <p>Veja o que você ganha usando o BoraEntregar</p>
        </div>

        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3>Economize Tempo</h3>
            <p>Reduza horas de planejamento manual para segundos de processamento automático.</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3>Reduza Custos</h3>
            <p>Otimize rotas e diminua gastos com combustível e tempo de deslocamento.</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3>Aumente a Produtividade</h3>
            <p>Faça mais entregas em menos tempo com rotas inteligentes e organizadas.</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3>Simples e Seguro</h3>
            <p>Interface intuitiva para usuários de todos os níveis. Seus dados estão protegidos.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Pronto para otimizar suas entregas?</h2>
          <p>Comece agora e veja a diferença na organização das suas rotas.</p>
          <button onClick={onGetStarted} className="btn-cta">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Otimizar rota
          </button>
        </div>
      </section>
    </div>
  );
}
