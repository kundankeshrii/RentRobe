export interface Product {
  id: string;
  name: string;
  designer: string;
  category: string;
  rentalPrice: number;
  retailPrice: number;
  sizes: string[];
  colors: string[];
  rating: number;
  reviewCount: number;
  description: string;
  details: string[];
  images: string[];
  occasion: string[];
  available: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Silk Anarkali Suit",
    designer: "Anita Dongre",
    category: "Ethnic",
    rentalPrice: 3500,
    retailPrice: 28000,
    sizes: ["XS", "S", "M", "L"],
    colors: ["Blush Pink", "Ivory"],
    rating: 4.9,
    reviewCount: 142,
    description: "A dreamy silk Anarkali suit with delicate hand-embroidered details and a graceful flared silhouette. Perfect for sangeet nights, festive occasions, and intimate celebrations.",
    details: [
      "Pure silk fabric with embroidered yoke",
      "Flared Anarkali silhouette",
      "Comes with dupatta and churidar",
      "Floor-length (approx. 54\" from shoulder)",
      "Dry clean only",
    ],
    images: [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&q=80",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80",
    ],
    occasion: ["Sangeet", "Festive", "Wedding Guest"],
    available: true,
    isFeatured: true,
    isNew: false,
  },
  {
    id: "2",
    name: "Floral Georgette Saree",
    designer: "Sabyasachi",
    category: "Sarees",
    rentalPrice: 7500,
    retailPrice: 65000,
    sizes: ["Free Size"],
    colors: ["Rose Print", "Sage Print"],
    rating: 4.8,
    reviewCount: 98,
    description: "An ethereal georgette saree with hand-painted floral motifs and a rich embroidered border. Sabyasachi's signature romance translated into six yards of pure artistry.",
    details: [
      "Pure georgette with floral print",
      "Hand-embroidered zari border",
      "Comes with blouse piece",
      "Six yards length",
      "Dry clean only",
    ],
    images: [
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80",
    ],
    occasion: ["Wedding", "Reception", "Festive"],
    available: true,
    isFeatured: true,
    isNew: true,
  },
  {
    id: "3",
    name: "Embroidered Lehenga Choli",
    designer: "Manish Malhotra",
    category: "Lehengas",
    rentalPrice: 9500,
    retailPrice: 85000,
    sizes: ["XS", "S", "M"],
    colors: ["Ivory", "Champagne"],
    rating: 4.7,
    reviewCount: 73,
    description: "A bridal-inspired lehenga choli with intricate zardozi embroidery and a sweeping skirt. Manish Malhotra's masterful craftsmanship for your most unforgettable evening.",
    details: [
      "Raw silk with zardozi embroidery",
      "Flared lehenga skirt with 3-meter flair",
      "Comes with matching choli and dupatta",
      "Waist: fully adjustable with hook & drawstring",
      "Dry clean only",
    ],
    images: [
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80",
      "https://images.unsplash.com/photo-1551803091-e20673f15770?w=600&q=80",
    ],
    occasion: ["Wedding", "Reception", "Cocktail"],
    available: true,
    isFeatured: false,
    isNew: true,
  },
  {
    id: "4",
    name: "Sequin Cocktail Gown",
    designer: "Tarun Tahiliani",
    category: "Gowns",
    rentalPrice: 6200,
    retailPrice: 52000,
    sizes: ["XS", "S", "M", "L"],
    colors: ["Gold", "Silver", "Rose Gold"],
    rating: 5.0,
    reviewCount: 211,
    description: "The ultimate showstopper — a full-length sequin gown with a plunging neckline and fluid drape. Tarun Tahiliani's glamour at its most breathtaking.",
    details: [
      "All-over sequin with net underlayer",
      "V-neckline with surplice drape",
      "Floor-length silhouette",
      "Concealed back zip",
      "Fully lined",
    ],
    images: [
      "https://images.unsplash.com/photo-1566479179817-c0a82de9ffcd?w=600&q=80",
      "https://images.unsplash.com/photo-1535295972055-1c762f4483e5?w=600&q=80",
    ],
    occasion: ["Gala", "New Year's", "Award Ceremony"],
    available: true,
    isFeatured: true,
    isNew: false,
  },
  {
    id: "5",
    name: "Linen Co-ord Set",
    designer: "Label Ritu Kumar",
    category: "Separates",
    rentalPrice: 2200,
    retailPrice: 14000,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Ecru", "Sand", "White"],
    rating: 4.6,
    reviewCount: 61,
    description: "Effortless sophistication in a crisp linen co-ord set featuring wide-leg trousers and a relaxed crop top. Label Ritu Kumar's refined minimalism for the modern Indian woman.",
    details: [
      "100% Belgian linen",
      "High-rise wide-leg trousers",
      "Relaxed fit crop top with pintuck detail",
      "Side zip on trousers",
      "Machine washable",
    ],
    images: [
      "https://images.unsplash.com/photo-1594938298603-a3d9f6f9e4b9?w=600&q=80",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    ],
    occasion: ["Casual", "Brunch", "Work"],
    available: true,
    isFeatured: false,
    isNew: false,
  },
  {
    id: "6",
    name: "Ruched Satin Mini Dress",
    designer: "Gauri & Nainika",
    category: "Dresses",
    rentalPrice: 4500,
    retailPrice: 32000,
    sizes: ["XS", "S", "M"],
    colors: ["Blush", "Cherry Red", "Midnight"],
    rating: 4.8,
    reviewCount: 119,
    description: "Turn every head in this sculpted ruched satin mini dress. Gauri & Nainika's signature body-skimming silhouette with gathered detailing creates a stunning fashion statement.",
    details: [
      "Satin-finish fabric with all-over ruching",
      "Square neckline",
      "Mini length",
      "Side invisible zipper",
      "Lined",
    ],
    images: [
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80",
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80",
    ],
    occasion: ["Night Out", "Birthday", "Cocktail"],
    available: true,
    isFeatured: false,
    isNew: true,
  },
  {
    id: "7",
    name: "Cashmere Shawl Coat",
    designer: "Rohit Bal",
    category: "Outerwear",
    rentalPrice: 5800,
    retailPrice: 48000,
    sizes: ["XS", "S", "M", "L"],
    colors: ["Camel", "Ivory", "Charcoal"],
    rating: 4.9,
    reviewCount: 89,
    description: "Timeless luxury in a pure cashmere shawl coat with hand-finished edges and an oversized silhouette. Rohit Bal's modern take on an enduring classic — the coat that elevates everything.",
    details: [
      "Pure Pashmina cashmere",
      "Shawl collar with belt",
      "Oversized relaxed fit",
      "Knee-length",
      "Silk-lined interior",
    ],
    images: [
      "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=600&q=80",
      "https://images.unsplash.com/photo-1525450824786-227cbef70703?w=600&q=80",
    ],
    occasion: ["Work", "Dinner", "Travel"],
    available: true,
    isFeatured: true,
    isNew: false,
  },
  {
    id: "8",
    name: "Off-Shoulder Bridal Gown",
    designer: "Shehla Khan",
    category: "Gowns",
    rentalPrice: 12000,
    retailPrice: 1100000,
    sizes: ["XS", "S", "M", "L"],
    colors: ["Blush", "Pearl White", "Sage"],
    rating: 4.9,
    reviewCount: 162,
    description: "A breathtaking off-shoulder bridal gown with cascading tulle ruffles and a boned bodice. Shehla Khan's masterpiece designed for your most unforgettable moment.",
    details: [
      "Duchess satin with tulle underlayer",
      "Off-shoulder structured neckline",
      "Boned bodice for perfect fit",
      "Full A-line skirt with sweep train",
      "Custom alterations available",
    ],
    images: [
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80",
      "https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=600&q=80",
    ],
    occasion: ["Wedding", "Engagement", "Black Tie"],
    available: false,
    isFeatured: true,
    isNew: false,
  },
];

export const categories = ["All", "Ethnic", "Sarees", "Lehengas", "Gowns", "Dresses", "Separates", "Outerwear"];
export const occasions = ["All", "Wedding", "Reception", "Sangeet", "Festive", "Wedding Guest", "Cocktail", "Night Out", "Gala", "Work"];

export interface CartItem {
  product: Product;
  size: string;
  rentalDays: number;
}

export interface Review {
  id: string;
  user: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
  size: string;
}

export const reviews: Review[] = [
  {
    id: "1",
    user: "Priya Sharma",
    avatar: "PS",
    rating: 5,
    date: "2 weeks ago",
    comment: "Absolutely stunning! Wore it to a sangeet and received so many compliments. The quality is exceptional and the fit was perfect. Will definitely rent from RentRobe again!",
    size: "S",
  },
  {
    id: "2",
    user: "Aarav Mehta",
    avatar: "AM",
    rating: 5,
    date: "1 month ago",
    comment: "RentRobe made it so easy to wear designer fashion for my sister's wedding. The outfit arrived in perfect condition, beautifully packaged with a handwritten note!",
    size: "M",
  },
  {
    id: "3",
    user: "Nandini Rao",
    avatar: "NR",
    rating: 4,
    date: "1 month ago",
    comment: "Gorgeous piece! Runs slightly small so I'd recommend sizing up. Customer service was incredibly helpful with sizing advice and responded within minutes.",
    size: "M",
  },
];
