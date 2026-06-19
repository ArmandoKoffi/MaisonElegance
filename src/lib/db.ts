// ============================================================
// UTILITY FUNCTIONS (pour la compatibilité, car on utilise maintenant Supabase)
// ============================================================

// Generate a unique order number
export function generateOrderNumber(): string {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `CMD-${date}-${random}`;
}

// ============================================================
// NOTE :
// Cette base de données Dexie (client-side) n'est plus utilisée !
// Toutes les données sont maintenant stockées sur Supabase.
// ============================================================
