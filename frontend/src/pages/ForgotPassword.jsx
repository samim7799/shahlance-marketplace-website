import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { AuthShell, AuthBrandingPanel, FieldWithIcon, ErrorAlert, SuccessAlert } from './Login';
import { authService } from '../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    try {
      await authService.requestPasswordReset(email);
      setSuccess('If an account exists for this email, a reset link has been sent. Check your inbox.');
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally { setSubmitting(false); }
  };

  return (
    <AuthShell right={<AuthBrandingPanel title="Locked out? We’ll help you back in." subtitle="Enter the email you signed up with and we’ll send a secure reset link." />}>
      <div>
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 btn-hover">
          <ArrowLeft size={14} /> Back to sign in
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold text-white tracking-tight">Forgot password?</h1>
        <p className="mt-1.5 text-sm text-slate-400">We’ll send a password reset link to your email.</p>

        {error && <ErrorAlert message={error} />}
        {success && <SuccessAlert message={success} />}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <FieldWithIcon Icon={Mail}>
            <input
              autoFocus
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="w-full bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-500"
            />
          </FieldWithIcon>
          <button
            disabled={submitting}
            className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-900 font-semibold btn-hover inline-flex items-center justify-center gap-2"
          >
            {submitting ? <span className="h-4 w-4 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" /> : <><Send size={16} /> Send reset link</>}
          </button>
        </form>
      </div>
    </AuthShell>
  );
}
