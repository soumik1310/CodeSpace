import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { loginUser } from "../authSlice";
import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

const loginSchema = z.object({
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password is too weak")
});

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to keep solving."
      footer={
        <>
          Don't have an account?{' '}
          <NavLink to="/signup" className="auth-link">Sign up</NavLink>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <label htmlFor="emailId" className="auth-label">Email</label>
          <input
            id="emailId"
            type="email"
            autoComplete="email"
            placeholder="john@example.com"
            aria-invalid={errors.emailId ? 'true' : 'false'}
            className="auth-input"
            {...register('emailId')}
          />
          {errors.emailId && (
            <p className="auth-error">{errors.emailId.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="auth-label">Password</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={errors.password ? 'true' : 'false'}
              className="auth-input pr-11"
              {...register('password')}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-[#8b93c4] transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-white"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="auth-error">{errors.password.message}</p>
          )}
        </div>

        <div className="pt-3">
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Logging in...
              </>
            ) : 'Log in'}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
}

export default Login;
