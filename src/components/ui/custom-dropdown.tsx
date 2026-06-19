import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomDropdownOption {
  name: string;
  price?: number | null;
}

interface CustomDropdownProps {
  options: CustomDropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  required?: boolean;
  name: string;
}

const CustomDropdown = ({ options, value, onChange, placeholder, label, required, name }: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", isOpen ? "z-50" : "z-10")} ref={dropdownRef}>
      <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </label>
      <div className={cn("relative", isOpen ? "z-50" : "z-20")}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-3 px-5 py-3 bg-card border border-border rounded-xl text-sm font-bold shadow-soft hover:border-accent hover:shadow-md transition-all active:scale-95"
        >
          <span className={cn(!value && "text-muted-foreground")}>
            {value || placeholder}
          </span>
          <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180")} />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2, type: "spring" }}
              className="absolute left-0 right-0 top-full mt-2 z-[9999] bg-card border border-border rounded-2xl shadow-elegant overflow-hidden"
            >
              <div className="max-h-64 overflow-y-auto">
                {options.map((option) => (
                  <button
                    key={option.name}
                    type="button"
                    onClick={() => {
                      onChange(option.name);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-6 py-4 text-sm transition-all duration-300 hover:pl-8 hover:pr-4 hover:bg-secondary relative overflow-hidden group/item flex justify-between",
                      value === option.name ? "text-accent font-bold bg-accent/5" : "text-foreground/70"
                    )}
                  >
                    <span className={cn(
                      "absolute left-0 top-0 bottom-0 w-1 bg-accent transition-all duration-300",
                      value === option.name ? "opacity-100" : "opacity-0 -translate-x-full group-hover/item:opacity-100 group-hover/item:translate-x-0"
                    )} />
                    <span>{option.name}</span>
                    {option.price !== undefined && option.price > 0 && (
                      <span className="text-accent font-bold ml-2">{option.price.toLocaleString()} FCFA</span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <input
          type="hidden"
          name={name}
          value={value}
          required={required}
        />
      </div>
    </div>
  );
};

export { CustomDropdown, type CustomDropdownOption };