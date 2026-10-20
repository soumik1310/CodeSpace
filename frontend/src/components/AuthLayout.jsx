import ParticleBackground from './ParticleBackground';
import '../auth.css';

function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-stage">
      <div aria-hidden="true" className="auth-glow" />
      <ParticleBackground />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
        <div className="auth-card">
          <div className="mb-6 text-center">
            <p className="auth-brand mb-3">Code Space</p>
            <h1 className="auth-title">{title}</h1>
            {subtitle && <p className="auth-subtitle mt-1">{subtitle}</p>}
          </div>

          {children}

          {footer && <div className="auth-footer mt-6 text-center">{footer}</div>}
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;