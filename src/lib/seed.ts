import { db } from './db';

const categories = [
  { name: 'Sacs de Luxe', slug: 'sacs', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000' },
  { name: 'Vêtements Mode', slug: 'vetements', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1000' },
  { name: 'Chaussures Premium', slug: 'chaussures', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000' },
  { name: 'Parfums & Cosmétiques', slug: 'parfums', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000' },
  { name: 'Montres & Bijoux', slug: 'accessoires', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000' },
  { name: 'Lunettes de Soleil', slug: 'lunettes', image: 'https://images.unsplash.com/photo-1511499767390-903390e6fbc1?q=80&w=1000' },
  { name: 'Ceintures & Maroquinerie', slug: 'ceintures', image: 'https://images.unsplash.com/photo-1509941943102-10c232535736?q=80&w=1000' },
  { name: 'Robes de Soirée', slug: 'robes', image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680fe0a?q=80&w=1000' },
  { name: 'Sneakers Limited', slug: 'sneakers', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1000' },
  { name: 'Soins & Beauté', slug: 'soins', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1000' },
  { name: 'Mode Enfant', slug: 'enfant', image: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?q=80&w=1000' },
];

const unsplashCollections = {
  sacs: [
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3',
    'https://images.unsplash.com/photo-1591561954557-26941169b49e',
    'https://images.unsplash.com/photo-1566150905458-1bf1fd15dcb4',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa',
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7',
    'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6',
    'https://images.unsplash.com/photo-1605733513597-a8f8d410fe3c'
  ],
  vetements: [
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b',
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f',
    'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea'
  ],
  chaussures: [
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772',
    'https://images.unsplash.com/photo-1560769629-975ec94e6a86',
    'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77',
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a',
    'https://images.unsplash.com/photo-1539185441755-769473a23570'
  ],
  parfums: [
    'https://images.unsplash.com/photo-1541643600914-78b084683601',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f',
    'https://images.unsplash.com/photo-1583445013765-48c2201c89b5',
    'https://images.unsplash.com/photo-1557170334-a7c3a4f22038',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539',
    'https://images.unsplash.com/photo-1616948055600-8f94cb977119'
  ],
  accessoires: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
    'https://images.unsplash.com/photo-1524592094714-0f0654e20314',
    'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d',
    'https://images.unsplash.com/photo-1617038220319-276d3cfab638',
    'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338'
  ],
  lunettes: [
    'https://images.unsplash.com/photo-1511499767390-903390e6fbc1',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f',
    'https://images.unsplash.com/photo-1508296695146-257a814070b4',
    'https://images.unsplash.com/photo-1577803645773-f96470509666',
    'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a'
  ],
  ceintures: [
    'https://images.unsplash.com/photo-1624222247344-550fb8ec5521',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62',
    'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7',
    'https://images.unsplash.com/photo-1624222246067-178652cc7087'
  ],
  robes: [
    'https://images.unsplash.com/photo-1539008835657-9e8e9680fe0a',
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8',
    'https://images.unsplash.com/photo-1566174053879-31528523f8ae',
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446',
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1'
  ],
  sneakers: [
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a',
    'https://images.unsplash.com/photo-1552346154-21d32810aba3',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    'https://images.unsplash.com/photo-1597044768515-31421be789f5',
    'https://images.unsplash.com/photo-1460353581641-37baddab0fa2'
  ],
  soins: [
    'https://images.unsplash.com/photo-1556228720-195a672e8a03',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881',
    'https://images.unsplash.com/photo-1612817288484-6f916006741a',
    'https://images.unsplash.com/photo-1601049541259-45c6ce283d4a',
    'https://images.unsplash.com/photo-1556228578-0d85b1a4d571',
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908'
  ],
  enfant: [
    'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6',
    'https://images.unsplash.com/photo-1503919545889-aef636e10ad4',
    'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea',
    'https://images.unsplash.com/photo-1519457431-758c4a5d7b5b',
    'https://images.unsplash.com/photo-1621451537084-482c73073a0f',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af'
  ]
};

const categoryData: Record<string, {
  names: string[],
  descriptions: string[],
  prices: [number, number],
  genders: ('Homme' | 'Femme' | 'Enfant')[]
}> = {
  sacs: {
    names: ['Sac à main Royale', 'Pochette de Soirée Étoilée', 'Cabas Signature Mimi', 'Sac Bandoulière Luxe', 'Sac à dos Urbain Chic', 'Petit Sac Porté Épaule'],
    descriptions: ['L\'élégance incarnée avec ce sac à main aux finitions dorées.', 'Une pochette raffinée pour vos événements les plus prestigieux.', 'Spacieux et robuste, ce cabas vous accompagnera partout avec style.', 'Cuir premium et design intemporel pour un look sophistiqué.'],
    prices: [15000, 75000],
    genders: ['Femme']
  },
  vetements: {
    names: ['Veste en Velours Côtelé', 'Chemise de Soie Italienne', 'Pantalon Ajusté Premium', 'Manteau d\'Hiver Élégance', 'T-shirt Graphic Design', 'Blazer Structuré'],
    descriptions: ['Coupe parfaite et matières nobles pour une allure distinguée.', 'Le confort absolu sans compromis sur l\'élégance.', 'Une pièce essentielle de votre garde-robe moderne.', 'Matière respirante et finitions soignées.'],
    prices: [8000, 45000],
    genders: ['Homme', 'Femme']
  },
  chaussures: {
    names: ['Escarpins Élégance Noirs', 'Bottes Cuir Italien', 'Mocassins de Ville', 'Sandales d\'Été Luxe', 'Bottines à Talons'],
    descriptions: ['Confort et style pour vos journées les plus actives.', 'Un design italien d\'exception pour vos pieds.', 'L\'accessoire indispensable pour une silhouette élancée.', 'Semelle ergonomique et cuir véritable.'],
    prices: [25000, 95000],
    genders: ['Homme', 'Femme']
  },
  parfums: {
    names: ['Eau de Parfum Éclat', 'Essence Impériale', 'Parfum Mystique de Nuit', 'Brume Florale Douce', 'Élixir d\'Or'],
    descriptions: ['Une fragrance envoûtante qui laisse un sillage inoubliable.', 'L\'essence de la féminité moderne dans un flacon précieux.', 'Des notes boisées et ambrées pour une présence affirmée.', 'Un bouquet floral frais et léger pour la journée.'],
    prices: [35000, 120000],
    genders: ['Homme', 'Femme']
  },
  accessoires: {
    names: ['Montre Chrono Gold Edition', 'Bracelet de Perles d\'Eau Douce', 'Collier Diamant Éclatant', 'Boucles d\'Oreilles Royale', 'Montre Quartz Argent'],
    descriptions: ['La précision alliée au luxe pour votre poignet.', 'Un bijou délicat pour sublimer votre port de tête.', 'L\'éclat des pierres précieuses pour vos moments spéciaux.', 'Acier inoxydable et design contemporain.'],
    prices: [20000, 150000],
    genders: ['Homme', 'Femme']
  },
  lunettes: {
    names: ['Lunettes Aviateur Classic', 'Wayfarer Noires Intemporelles', 'Lunettes de Soleil Vintage Gold', 'Design Futuriste Silver', 'Oeil de Chat Élégant'],
    descriptions: ['Protection UV optimale et style affirmé.', 'La touche finale indispensable à votre look d\'été.', 'Monture légère et verres haute définition.', 'Un classique revisité pour un style moderne.'],
    prices: [12000, 35000],
    genders: ['Homme', 'Femme']
  },
  ceintures: {
    names: ['Ceinture Cuir Véritable Noir', 'Ceinture Boucle Or Royale', 'Ceinture Ajustable Slim', 'Maroquinerie d\'Art Brune'],
    descriptions: ['Le détail qui fait toute la différence sur votre tenue.', 'Cuir de haute qualité tanné de façon artisanale.', 'Fermeture robuste et design épuré.', 'L\'accessoire parfait pour structurer votre silhouette.'],
    prices: [7000, 18000],
    genders: ['Homme', 'Femme']
  },
  robes: {
    names: ['Robe de Gala Étincelante', 'Robe Cocktail Rouge Passion', 'Robe de Mariée Exclusive', 'Robe d\'Été Fleurie Légère', 'Robe Fourreau Noire'],
    descriptions: ['Soyez la reine de la soirée avec cette robe d\'exception.', 'Une coupe flatteuse pour sublimer toutes les morphologies.', 'Tissus vaporeux et détails brodés à la main.', 'L\'élégance intemporelle pour vos grandes occasions.'],
    prices: [25000, 250000],
    genders: ['Femme']
  },
  sneakers: {
    names: ['Sneaker Sport Plus Ultra', 'Basket Streetwear Urbaine', 'Running Pro Limited Edition', 'Sneaker High-Top Luxe', 'Sneaker Minimaliste Blanche'],
    descriptions: ['L\'alliance parfaite entre performance et mode urbaine.', 'Un confort exceptionnel pour vos marches quotidiennes.', 'Design innovant et matériaux ultra-légers.', 'La sneaker de luxe qui définit votre style.'],
    prices: [20000, 85000],
    genders: ['Homme', 'Femme']
  },
  soins: {
    names: ['Crème Hydratante Royale', 'Sérum Éclat Vitamine C', 'Masque Purifiant Argile', 'Lotion Tonifiante Douce', 'Huile de Soin Précieuse'],
    descriptions: ['Une peau éclatante de santé grâce à nos actifs naturels.', 'Le rituel beauté complet pour un teint parfait.', 'Soin intensif pour une peau régénérée et apaisée.', 'Texture légère et absorption rapide.'],
    prices: [5000, 25000],
    genders: ['Femme']
  },
  enfant: {
    names: ['Ensemble Junior Chic Garçon', 'Robe de Fête Petite Princesse', 'Jeans Kid Durable & Confort', 'Sweat à Capuche Cool Kid', 'Chaussures Mini-Luxe Premiers Pas', 'Pyjama Doux Coton Bio'],
    descriptions: ['Des vêtements confortables pour les aventures quotidiennes.', 'Le style des grands adapté aux plus petits.', 'Matières douces respectueuses de la peau des enfants.', 'Coupes pensées pour la liberté de mouvement.'],
    prices: [5000, 25000],
    genders: ['Enfant']
  }
};

const badges = ['Nouveau', 'Best-seller', 'Premium', 'Édition Limitée', undefined];

function generateProducts(count: number) {
  const products = [];
  const usedNames = new Set<string>();

  for (let i = 1; i <= count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const data = categoryData[category.slug];
    const images = (unsplashCollections[category.slug as keyof typeof unsplashCollections] as string[]) || unsplashCollections.sacs;
    
    // Ensure variety in names
    let name = data.names[Math.floor(Math.random() * data.names.length)];
    if (usedNames.has(name)) {
      name = `${name} - Modèle ${Math.floor(Math.random() * 100)}`;
    }
    usedNames.add(name);

    const baseImg = images[Math.floor(Math.random() * images.length)];
    const stockCount = Math.floor(Math.random() * 100);
    const stock = stockCount === 0 ? 'out' : stockCount < 10 ? 'low' : 'available';
    
    const price = data.prices[0] + Math.floor(Math.random() * (data.prices[1] - data.prices[0]));
    
    const description = data.descriptions[Math.floor(Math.random() * data.descriptions.length)];
    
    products.push({
      name,
      price,
      category: category.slug,
      gender: data.genders[Math.floor(Math.random() * data.genders.length)],
      image: `${baseImg}?q=80&w=800&auto=format&fit=crop`,
      images: [
        `${baseImg}?q=80&w=800&auto=format&fit=crop`,
        `${images[(Math.floor(Math.random() * images.length))] || baseImg}?q=80&w=800&auto=format&fit=crop`,
        `${images[(Math.floor(Math.random() * images.length))] || baseImg}?q=80&w=800&auto=format&fit=crop`,
        `${images[(Math.floor(Math.random() * images.length))] || baseImg}?q=80&w=800&auto=format&fit=crop`,
        `${images[(Math.floor(Math.random() * images.length))] || baseImg}?q=80&w=800&auto=format&fit=crop`,
        `${images[(Math.floor(Math.random() * images.length))] || baseImg}?q=80&w=800&auto=format&fit=crop`
      ],
      description: description,
      longDescription: `${description} Découvrez notre collection exclusive Mimi Élégance à Abidjan. Ce produit de qualité supérieure a été sélectionné pour vous offrir le meilleur du style contemporain. Finitions soignées, durabilité garantie et allure incomparable.`,
      stock,
      stockCount,
      badge: badges[Math.floor(Math.random() * badges.length)],
      createdAt: Date.now() - Math.floor(Math.random() * 10000000000)
    });
  }
  return products;
}

export async function seedDatabase() {
  const isSeeded = localStorage.getItem('db_seeded_v2');
  
  if (!isSeeded) {
    console.log("Initialisation de la base de données : Suppression des données de test...");
    
    // Seed categories if empty
    const categoryCount = await db.categories.count();
    if (categoryCount === 0) {
      await db.categories.bulkAdd(categories);
    }

    // Effacer toutes les données de test (produits)
    await db.products.clear();
    console.log("Les produits de test ont été supprimés.");
    
    // Mark as seeded
    localStorage.setItem('db_seeded_v2', 'true');
  } else {
    console.log("Base de données opérationnelle.");
  }
}
