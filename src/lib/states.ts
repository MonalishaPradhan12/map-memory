export type Region = {
  name: string;
  capital: string;
  type: "State" | "Union Territory";
};

export const REGIONS: Region[] = [
  { name: "Andaman and Nicobar Islands", capital: "Port Blair", type: "Union Territory" },
  { name: "Andhra Pradesh", capital: "Amaravati", type: "State" },
  { name: "Arunachal Pradesh", capital: "Itanagar", type: "State" },
  { name: "Assam", capital: "Dispur", type: "State" },
  { name: "Bihar", capital: "Patna", type: "State" },
  { name: "Chandigarh", capital: "Chandigarh", type: "Union Territory" },
  { name: "Chhattisgarh", capital: "Raipur", type: "State" },
  { name: "Dadra and Nagar Haveli and Daman and Diu", capital: "Daman", type: "Union Territory" },
  { name: "Delhi", capital: "New Delhi", type: "Union Territory" },
  { name: "Goa", capital: "Panaji", type: "State" },
  { name: "Gujarat", capital: "Gandhinagar", type: "State" },
  { name: "Haryana", capital: "Chandigarh", type: "State" },
  { name: "Himachal Pradesh", capital: "Shimla", type: "State" },
  { name: "Jammu and Kashmir", capital: "Srinagar / Jammu", type: "Union Territory" },
  { name: "Jharkhand", capital: "Ranchi", type: "State" },
  { name: "Karnataka", capital: "Bengaluru", type: "State" },
  { name: "Kerala", capital: "Thiruvananthapuram", type: "State" },
  { name: "Ladakh", capital: "Leh", type: "Union Territory" },
  { name: "Lakshadweep", capital: "Kavaratti", type: "Union Territory" },
  { name: "Madhya Pradesh", capital: "Bhopal", type: "State" },
  { name: "Maharashtra", capital: "Mumbai", type: "State" },
  { name: "Manipur", capital: "Imphal", type: "State" },
  { name: "Meghalaya", capital: "Shillong", type: "State" },
  { name: "Mizoram", capital: "Aizawl", type: "State" },
  { name: "Nagaland", capital: "Kohima", type: "State" },
  { name: "Odisha", capital: "Bhubaneswar", type: "State" },
  { name: "Puducherry", capital: "Puducherry", type: "Union Territory" },
  { name: "Punjab", capital: "Chandigarh", type: "State" },
  { name: "Rajasthan", capital: "Jaipur", type: "State" },
  { name: "Sikkim", capital: "Gangtok", type: "State" },
  { name: "Tamil Nadu", capital: "Chennai", type: "State" },
  { name: "Telangana", capital: "Hyderabad", type: "State" },
  { name: "Tripura", capital: "Agartala", type: "State" },
  { name: "Uttar Pradesh", capital: "Lucknow", type: "State" },
  { name: "Uttarakhand", capital: "Dehradun", type: "State" },
  { name: "West Bengal", capital: "Kolkata", type: "State" },
];

// Fixed palette: a region's color depends only on its alphabetical position,
// so "Karnataka" is always the same color.
const SORTED = REGIONS.map((r) => r.name).sort();

export function colorFor(name: string): string {
  const i = SORTED.indexOf(name);
  return `hsl(${(i * 137.5) % 360}, 62%, ${60 + (i % 3) * 7}%)`;
}

export function findRegion(name: string): Region | undefined {
  return REGIONS.find((r) => r.name === name);
}
