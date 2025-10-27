import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import './index.css'
import App from './App.tsx'

const domain = import.meta.env.VITE_AUTH0_DOMAIN || 'boraentregar.us.auth0.com'
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || 'eMCgaFN2GuusR1v0FNZ3A8jBV1A6jnow'
const audience = import.meta.env.VITE_AUTH0_AUDIENCE || 'https://boraentregar.us.auth0.com/api/v2/'
const redirectUri = import.meta.env.VITE_AUTH0_CALLBACK_URL || window.location.origin

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: audience,
        scope: 'openid profile email'
      }}
    >
      <App />
    </Auth0Provider>
  </StrictMode>,
)
