import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, LogIn, UserPlus, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { cities as villes, neighborhoodsAbidjan as adressesAbidjan } from '@/lib/shipping';
import { CustomDropdown } from '@/components/ui/custom-dropdown';

const AuthPage = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const { login, register, isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || '/mon-compte';

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate, from]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const fd = new FormData(e.currentTarget);
    const result = await login(fd.get('phone') as string, fd.get('pin') as string);
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
    const pin = fd.get('pin') as string;
    const confirmPin = fd.get('confirmPin') as string;
    
    const firstName = (fd.get('firstName') as string).trim();
    const lastName = (fd.get('lastName') as string).trim();
    const phone = (fd.get('phone') as string).trim();

    if (!firstName || !lastName || !phone || !pin) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      setIsLoading(false);
      return;
    }

    if (selectedCity === "Abidjan" && !selectedAddress) {
      toast.error('Veuillez sélectionner un quartier pour Abidjan.');
      setIsLoading(false);
      return;
    }

    if (pin.length !== 4) {
      toast.error('Le code PIN doit comporter 4 chiffres.');
      setIsLoading(false);
      return;
    }

    if (pin !== confirmPin) {
      toast.error('Les codes PIN ne correspondent pas.');
      setIsLoading(false);
      return;
    }
    const result = await register({
      firstName,
      lastName,
      phone,
      address: selectedAddress,
      city: selectedCity,
      pin,
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center p-4 py-20">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-6">
            <ShoppingBag className="w-10 h-10 text-accent animate-pulse" />
          </div>
          <h2 className="font-serif text-3xl mb-4">Chargement...</h2>
        </div>
      </div>
    );
  }

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
        <div className="bg-card rounded-[2rem] border border-border shadow-elegant p-8 relative overflow-visible">
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
                    <label className={labelClass}>Numéro de téléphone</label>
                    <input 
                      name="phone" 
                      type="tel" 
                      required 
                      className={inputClass} 
                      placeholder="+2250700000000"
                      onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^\d+]/g, '')}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Code PIN (4 chiffres)</label>
                    <div className="relative">
                      <input 
                        name="pin" 
                        type={showPassword ? 'text' : 'password'} 
                        required 
                        maxLength={4}
                        pattern="\d{4}"
                        className={inputClass + ' pr-12'} 
                        placeholder="••••" 
                        onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '')}
                      />
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
                  <p className="text-muted-foreground text-sm">Créez votre compte en quelques secondes.</p>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 mb-6 text-xs text-blue-700 dark:text-blue-300">
                  <p className="font-semibold mb-1">Pourquoi ces informations ?</p>
                  <p>Vos coordonnées nous servent à traiter et livrer votre commande rapidement. Votre compte vous permet de suivre l'état de votre commande en temps réel.</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl p-4 mb-6 text-xs text-amber-700 dark:text-amber-300">
                  <p className="font-semibold mb-1">Info importante</p>
                  <p>Si vous ne sélectionnez pas de ville/adresse, vous devrez venir chercher votre commande vous-même.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Prénom</label>
                      <input 
                        name="firstName" 
                        required 
                        className={inputClass} 
                        placeholder="Ama"
                        onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^a-zA-ZÀ-ÿ\s\-']/g, '')}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Nom</label>
                      <input 
                        name="lastName" 
                        required 
                        className={inputClass} 
                        placeholder="Konan"
                        onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^a-zA-ZÀ-ÿ\s\-']/g, '')}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Téléphone (WhatsApp)</label>
                    <input 
                      name="phone" 
                      type="tel" 
                      required 
                      className={inputClass} 
                      placeholder="+2250700000000"
                      pattern="^\+?[0-9]{8,15}$"
                      maxLength={15}
                      onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^\d+]/g, '')}
                    />
                  </div>
                  <CustomDropdown
                    name="city"
                    label="Ville"
                    options={villes}
                    value={selectedCity}
                    onChange={(val) => {
                      setSelectedCity(val);
                      if (val !== "Abidjan") {
                        setSelectedAddress("");
                      }
                    }}
                    placeholder="Sélectionnez une ville (optionnel)"
                    required={false}
                  />
                  <AnimatePresence>
                    {selectedCity === "Abidjan" && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-visible"
                      >
                        <div className="pt-4">
                          <CustomDropdown
                            name="address"
                            label="Adresse de livraison (Quartier)"
                            options={adressesAbidjan}
                            value={selectedAddress}
                            onChange={setSelectedAddress}
                            placeholder="Sélectionnez un quartier"
                            required={false}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Code PIN (4 chiffres)</label>
                      <input 
                        name="pin" 
                        type={showPassword ? 'text' : 'password'} 
                        required 
                        maxLength={4}
                        pattern="\d{4}"
                        className={inputClass} 
                        placeholder="••••" 
                        onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '')}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Confirmer PIN</label>
                      <input 
                        name="confirmPin" 
                        type={showPassword ? 'text' : 'password'} 
                        required 
                        maxLength={4}
                        pattern="\d{4}"
                        className={inputClass} 
                        placeholder="••••" 
                        onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '')}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end">
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-xs text-muted-foreground hover:text-accent flex items-center gap-1 transition-colors">
                      {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {showPassword ? 'Masquer' : 'Afficher'} le code PIN
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-accent text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-accent/90 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 shadow-glow"
                  >
                    <UserPlus className="w-4 h-4" />
                    {isLoading ? 'Création...' : 'Créer mon compte et commander'}
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
