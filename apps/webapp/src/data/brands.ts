export type Brand = {
  key: string;
  name: string;
  short?: string;
  color?: string;
  icon: string;
};

export type EarningBrand = Brand & { rate: number };

export const drive = (id: string) => `https://drive.google.com/uc?export=view&id=${id}`;

// Full brand list (replace *_FILE_ID with real Google Drive file IDs)
export const ALL_BRANDS: Brand[] = [
  { key: "adidas", name: "Adidas", short: "A", color: "bg-black", icon: drive("ADIDAS_FILE_ID") },
  { key: "nykaa", name: "Nykaa", short: "N", color: "bg-pink-100", icon: drive("1JA8hdUH7fAcZp1v1fCrE8DFOXJ5nK9AN") },
  { key: "pharmeasy", name: "PharmEasy", short: "P", color: "bg-emerald-100", icon: drive("1tflxpbMH1CcDArof8ZD6uhXS0aH63dvf") },
  { key: "pvr", name: "PVR INOX", short: "PV", color: "bg-yellow-100", icon: drive("16Lo6DpG_vhYe6WXkE5rsMxk2H6bKNuOX") },
  { key: "rapido", name: "Rapido", short: "R", color: "bg-amber-100", icon: `https://drive.google.com/file/d/1PPa_Cot4wD79lmjG8os5ZbDTcIgwR-ZO/view?usp=sharing` },
  { key: "swiggy", name: "Swiggy", short: "S", color: "bg-orange-100", icon: drive("SWIGGY_FILE_ID") },
  { key: "zepto", name: "Zepto", short: "Z", color: "bg-purple-100", icon: drive("ZEPTO_FILE_ID") },
  { key: "myntra", name: "Myntra", short: "M", color: "bg-rose-100", icon: drive("MYNTRA_FILE_ID") },
  { key: "dominos", name: "Dominos", short: "D", color: "bg-blue-100", icon: drive("DOMINOS_FILE_ID") },
  { key: "mcdonalds", name: "McDonalds", short: "Mc", color: "bg-yellow-200", icon: drive("MCDONALDS_FILE_ID") },
  { key: "looks", name: "Looks Salon", short: "LS", color: "bg-neutral-100", icon: drive("LOOKS_FILE_ID") },
  { key: "bluetail", name: "Blue Tokai", short: "BT", color: "bg-cyan-100", icon: drive("BLUETOKAI_FILE_ID") },
  { key: "chaayos", name: "Chaayos", short: "Ch", color: "bg-green-100", icon: drive("CHAAYOS_FILE_ID") },
  { key: "native", name: "Native by UC", short: "UC", color: "bg-teal-100", icon: drive("NATIVE_FILE_ID") },
  { key: "urbanic", name: "Urbanic", short: "U", color: "bg-purple-200", icon: drive("URBANIC_FILE_ID") },
  { key: "firstcry", name: "Firstcry", short: "F", color: "bg-pink-200", icon: drive("FIRSTCRY_FILE_ID") },
  { key: "adidas2", name: "Adidas (Alt)", short: "A", color: "bg-gray-900", icon: drive("ADIDAS_ALT_FILE_ID") },
  { key: "decathlon", name: "Decathlon", short: "D", color: "bg-blue-600", icon: drive("DECATHLON_FILE_ID") },
  { key: "boat", name: "BOAT", short: "B", color: "bg-red-100", icon: drive("BOAT_FILE_ID") },
  { key: "ddecor", name: "D'Decor", short: "DD", color: "bg-amber-200", icon: drive("DDECOR_FILE_ID") },
  { key: "eatfit", name: "EatFit Club", short: "EF", color: "bg-lime-100", icon: drive("EATFIT_FILE_ID") },
  { key: "giva", name: "GIVA", short: "G", color: "bg-pink-100", icon: drive("GIVA_FILE_ID") },
  { key: "ixigo", name: "Ixigo", short: "I", color: "bg-orange-100", icon: drive("IXIGO_FILE_ID") },
  { key: "lifestyle", name: "Lifestyle", short: "L", color: "bg-neutral-200", icon: drive("LIFESTYLE_FILE_ID") },
  { key: "mokobara", name: "Mokobara", short: "Mo", color: "bg-indigo-100", icon: drive("MOKOBARA_FILE_ID") },
  { key: "mymuse", name: "MyMuse", short: "MM", color: "bg-fuchsia-100", icon: drive("MYMUSE_FILE_ID") },
  { key: "natures", name: "Nature's Basket", short: "NB", color: "bg-green-200", icon: drive("NATURES_FILE_ID") },
  { key: "oziva", name: "Oziva", short: "O", color: "bg-emerald-100", icon: drive("OZIVA_FILE_ID") },
  { key: "redbus", name: "RedBus", short: "RB", color: "bg-red-200", icon: drive("REDBUS_FILE_ID") },
  { key: "shuttl", name: "Shuttl", short: "Sh", color: "bg-sky-100", icon: drive("SHUTTL_FILE_ID") },
  { key: "goodbug", name: "The Good Bug", short: "GB", color: "bg-yellow-100", icon: drive("GOODBUG_FILE_ID") },
  { key: "mancompany", name: "The Man Company", short: "TMC", color: "bg-stone-100", icon: drive("MANCOMPANY_FILE_ID") },
  { key: "wholetruth", name: "The Whole Truth", short: "TWT", color: "bg-amber-100", icon: drive("WHOLETRUTH_FILE_ID") },
  { key: "vijaysales", name: "Vijay Sales", short: "VS", color: "bg-red-100", icon: drive("VIJAYSALES_FILE_ID") },
  { key: "amazon", name: "Amazon", short: "A", color: "bg-yellow-500", icon: drive("AMAZON_FILE_ID") },
  { key: "flipkart", name: "Flipkart", short: "F", color: "bg-blue-500", icon: drive("FLIPKART_FILE_ID") },
];

export const EARNING_BRANDS: EarningBrand[] = [
  { ...ALL_BRANDS.find(b => b.key === "adidas")!, rate: 0.15 },
  { ...ALL_BRANDS.find(b => b.key === "nykaa")!, rate: 0.14 },
  { ...ALL_BRANDS.find(b => b.key === "pharmeasy")!, rate: 0.11 },
  { ...ALL_BRANDS.find(b => b.key === "rapido")!, rate: 0.09 },
  { ...ALL_BRANDS.find(b => b.key === "swiggy")!, rate: 0.08 },
  { ...ALL_BRANDS.find(b => b.key === "zepto")!, rate: 0.10 },
  { ...ALL_BRANDS.find(b => b.key === "dominos")!, rate: 0.07 },
  { ...ALL_BRANDS.find(b => b.key === "mcdonalds")!, rate: 0.06 },
  { ...ALL_BRANDS.find(b => b.key === "decathlon")!, rate: 0.05 },
];
