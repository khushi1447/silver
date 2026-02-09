export interface RingSize {
  us: string;
  indian: string;
  diameter: string;
  fitType: string;
}

export const RING_SIZES: RingSize[] = [
  { us: "6", indian: "12", diameter: "16.5 mm", fitType: "Small" },
  { us: "7", indian: "14", diameter: "17.3 mm", fitType: "Small-Medium" },
  { us: "8", indian: "16", diameter: "18.1 mm", fitType: "Medium" },
  { us: "9", indian: "18", diameter: "18.9 mm", fitType: "Medium-Large" },
  { us: "10", indian: "20", diameter: "19.8 mm", fitType: "Large" },
  { us: "11", indian: "22", diameter: "20.6 mm", fitType: "Large" },
  { us: "12", indian: "24", diameter: "21.4 mm", fitType: "Extra Large" },
  { us: "13", indian: "26", diameter: "22.2 mm", fitType: "XXL" },
  { us: "13.5", indian: "27", diameter: "22.6 mm", fitType: "XXXL (Rare)" },
];

export const getRingSizeLabel = (size: string | RingSize) => {
  const s = typeof size === 'string' ? RING_SIZES.find(rs => rs.us === size) : size;
  if (!s) return size;
  return `US ${s.us} / Ind ${s.indian} (${s.diameter})`;
};
