import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, LogIn, UserPlus, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

const AuthPage = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || '/mon-compte';

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const fd = new FormData(e.currentTarget);
    const result = await login(fd.get('email') as string, fd.get('password') as string);
    setIsLoading(false);
    if (result.success) {
      toast.success('Bon retour parmi nous !');
      navigate(from, { replace: true });
    } else {
      toast.error(result.error);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const fd = new FormData(e.currentTarget);
    const password = fd.get('password') as string;
    const confirm = fd.get('confirmPassword') as string;
    if (password !== confirm) {
      toast.error('Les mots de passe ne correspondent pas.');
      setIsLoading(false);
      return;
    }
    const result = await register({
      firstName: fd.get('firstName') as string,
      lastName: fd.get('lastName') as string,
      email: fd.get('email') as string,
      phone: fd.get('phone') as string,
      address: fd.get('address') as string,
      city: fd.get('city') as string,
      password,
    });
    setIsLoading(false);
    if (result.success) {
      toast.success('Compte créé avec succès ! Bienvenue !');
      navigate(from, { replace: true });
    } else {
      toast.error(result.error);
    }
  };

  const inputClass = "w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all placeholder:text-muted-foreground";
  const labelClass = "block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2";

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4 py-20">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-10 group">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <span className="font-serif text-3xl tracking-wider">Mimi<span className="text-accent">Élégance</span></span>
        </Link>

        {/* Tab Switcher */}
        <div className="flex bg-card rounded-2xl p-1.5 mb-8 border border-border shadow-soft">
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                mode === m ? 'bg-accent text-white shadow-md' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {m === 'login' ? 'Se connecter' : 'Créer un compte'}
            </button>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-[2rem] border border-border shadow-elegant p-8">
          <AnimatePresence mode="wait">
            {mode === 'login' ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-8">
                  <h1 className="font-serif text-3xl mb-2">Bon retour !</h1>
                  <p className="text-muted-foreground text-sm">Connectez-vous pour accéder à votre espace.</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className={labelClass}>Email</label>
                    <input name="email" type="email" required className={inputClass} placeholder="votre@email.com" />
                  </div>
                  <div>
                    <label className={labelClass}>Mot de passe</label>
                    <div className="relative">
                      <input name="password" type={showPassword ? 'text' : 'password'} required className={inputClass + ' pr-12'} placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-accent text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-accent/90 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 shadow-glow"
                  >
                    <LogIn className="w-4 h-4" />
                    {isLoading ? 'Connexion...' : 'Se connecter'}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-8">
                  <h1 className="font-serif text-3xl mb-2">Rejoignez-nous !</h1>
                  <p className="text-muted-foreground text-sm">Créez votre compte pour passer commande facilement.</p>
                </div>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Prénom</label>
                      <input name="firstName" required className={inputClass} placeholder="Ama" />
                    </div>
                    <div>
                      <label className={labelClass}>Nom</label>
                      <input name="lastName" required className={inputClass} placeholder="Konan" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input name="email" type="email" required className={inputClass} placeholder="votre@email.com" />
                  </div>
                  <div>
                    <label className={labelClass}>Téléphone (WhatsApp)</label>
                    <input name="phone" type="tel" required className={inputClass} placeholder="+225 0700000000" />
                  </div>
                  <div>
                    <label className={labelClass}>Adresse de livraison</label>
                    <input name="address" className={inputClass} placeholder="Quartier, rue..." />
                  </div>
                  <div>
                    <label className={labelClass}>Ville</label>
                    <input name="city" className={inputClass} placeholder="Abidjan" />
                  </div>
                  <div>
                    <label className={labelClass}>Mot de passe</label>
                    <div className="relative">
                      <input name="password" type={showPassword ? 'text' : 'password'} required minLength={6} className={inputClass + ' pr-12'} placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Confirmer le mot de passe</label>
                    <input name="confirmPassword" type={showPassword ? 'text' : 'password'} required className={inputClass} placeholder="••••••••" />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-accent text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-accent/90 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 shadow-glow"
                  >
                    <UserPlus className="w-4 h-4" />
                    {isLoading ? 'Création...' : 'Créer mon compte'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
