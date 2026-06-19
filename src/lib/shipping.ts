// Shared shipping price data
export const cities = [
  { name: "Abidjan", price: null },
  { name: "San-Pédro", price: null },
  { name: "Bouaké", price: null },
  { name: "Yamoussoukro", price: null },
  { name: "Korhogo", price: null }
];

export const neighborhoodsAbidjan = [
  { name: "ANYAMA", price: 1500 },
  { name: "ABOBO", price: 1500 },
  { name: "ADJAME", price: 1500 },
  { name: "ATTECOUBE", price: 1500 },
  { name: "ADJOUFOU", price: 1500 },
  { name: "ANANI", price: 2000 },
  { name: "BINGERVILLE", price: 1500 },
  { name: "BASSAM", price: 2500 },
  { name: "COCODY", price: 1500 },
  { name: "GONZAGUEVILLE", price: 1500 },
  { name: "KOUMASSI", price: 1500 },
  { name: "MARCORY", price: 1500 },
  { name: "PLATEAU", price: 1500 },
  { name: "PORT-BOUET", price: 1500 },
  { name: "SONGON", price: 2000 },
  { name: "TREICHVILLE", price: 1500 },
  { name: "VRIDI", price: 1500 },
  { name: "YOPOUGON", price: 1500 }
];

// Group Abidjan neighborhoods by price for display
export const groupedNeighborhoods = () => {
  const groups: Record<number, string[]> = {};
  for (const n of neighborhoodsAbidjan) {
    if (!groups[n.price]) groups[n.price] = [];
    groups[n.price].push(n.name);
  }
  return Object.entries(groups).sort(([a], [b]) => Number(a) - Number(b));
};

/**
 * Robust shipping cost calculation with breakdown
 * Handles case-insensitivity and ensures real-time matching with latest data
 * For cities outside Abidjan, applies dynamic calculation based on subtotal:
 * - If subtotal ≤ 10,000: 1500 FCFA (livreur) + 1000 FCFA (compagnie) = 2500 FCFA
 * - If subtotal > 10,000: 1500 FCFA (livreur) + 10% du sous-total (compagnie)
 */
export interface ShippingCostBreakdown {
  livreur: number;
  compagnie: number;
  total: number;
}

export const getShippingCost = (city: string | null | undefined, address: string | null | undefined, subtotal: number = 0): number => {
  return getShippingCostWithBreakdown(city, address, subtotal).total;
};

export const getShippingCostWithBreakdown = (city: string | null | undefined, address: string | null | undefined, subtotal: number = 0): ShippingCostBreakdown => {
  if (!city) {
    return { livreur: 0, compagnie: 0, total: 0 };
  }
  
  // Normalized city name for comparison
  const normalizedCity = city.trim();
  
  const cityData = cities.find(v => v.name.toLowerCase() === normalizedCity.toLowerCase());
  
  if (cityData && cityData.name === "Abidjan") {
    if (!address) {
      return { livreur: 0, compagnie: 0, total: 0 };
    }
    
    // Normalized address name for comparison
    const normalizedAddress = address.trim();
    const addressData = neighborhoodsAbidjan.find(a => 
      a.name.toLowerCase() === normalizedAddress.toLowerCase()
    );
    
    const total = addressData?.price || 0;
    // For Abidjan, we can consider the full amount goes to the livreur for simplicity
    return { livreur: total, compagnie: 0, total };
  } else if (cityData) {
    // For cities outside Abidjan, apply dynamic calculation
    const livreur = 1500;
    let compagnie: number;
    if (subtotal <= 10000) {
      compagnie = 1000;
    } else {
      compagnie = Math.floor(0.1 * subtotal);
    }
    return { livreur, compagnie, total: livreur + compagnie };
  }
  
  return { livreur: 0, compagnie: 0, total: 0 };
};
