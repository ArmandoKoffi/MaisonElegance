// Shared shipping price data
export const cities = [
  { name: "Abidjan", price: null },
  { name: "San-Pédro", price: 2500 },
  { name: "Bouaké", price: 3000 },
  { name: "Yamoussoukro", price: 2800 },
  { name: "Korhogo", price: 3500 }
];

export const neighborhoodsAbidjan = [
  { name: "Plateau", price: 1500 },
  { name: "Cocody", price: 2000 },
  { name: "Yopougon", price: 1500 },
  { name: "Abobo", price: 1500 },
  { name: "Adjamé", price: 1500 },
  { name: "Attécoubé", price: 1800 },
  { name: "Koumassi", price: 1800 },
  { name: "Marcory", price: 2000 },
  { name: "Port-Bouët", price: 1800 },
  { name: "Treichville", price: 1500 }
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
