import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ShoppingBag, Eye, EyeOff, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const fd = new FormData(e.currentTarget);
    const result = await login(fd.get('email') as string, fd.get('password') as string);
    setIsLoading(false);
    if (result.success) {
      navigate('/admin', { replace: true });
    } else {
      setError(result.error || 'Identifiants incorrects.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shadow-lg">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none">MimiÉlégance</p>
            <p className="text-gray-400 text-xs">Administration</p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-[2rem] border border-gray-800 p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-accent/10 rounded-xl flex items-center justify-center">
              <Lock className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Accès Administrateur</h1>
              <p className="text-gray-500 text-xs">Zone sécurisée — connexion requise</p>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-red-950/60 border border-red-800 text-red-400 text-xs rounded-xl px-4 py-3 mb-5"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Email
              </label>
              <input
                name="email"
                type="email"
                required
                defaultValue="admin@mimielegance.ci"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all placeholder:text-gray-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 pr-12 text-sm text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all placeholder:text-gray-600"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-accent text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-accent/90 transition-all active:scale-[0.98] disabled:opacity-60 shadow-lg shadow-accent/20 mt-2"
            >
              {isLoading ? 'Vérification...' : 'Accéder au tableau de bord'}
            </button>
          </form>

          <div className="mt-6 p-3 bg-gray-800/50 rounded-xl border border-gray-800">
            <p className="text-gray-500 text-xs text-center">
              Email par défaut : <code className="text-accent">admin@mimielegance.ci</code><br />
              Mot de passe par défaut : <code className="text-accent">Admin2024!</code>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
