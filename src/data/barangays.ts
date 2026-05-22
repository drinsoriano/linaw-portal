import type { Barangay, District } from "../types";

const rawBarangays: Array<{
  name: string;
  district: District;
  captain: string;
  pop: number;
  area: number;
}> = [
  { name: "Bagong Kalsada", district: "District I", captain: "Hon. Roberto Dela Cruz", pop: 12450, area: 45.2 },
  { name: "Banay-Banay", district: "District I", captain: "Hon. Maria Santos", pop: 8320, area: 32.8 },
  { name: "Banlic", district: "District I", captain: "Hon. Jose Reyes", pop: 15670, area: 58.3 },
  { name: "Barandal", district: "District I", captain: "Hon. Ana Mendoza", pop: 6890, area: 28.5 },
  { name: "Batino", district: "District I", captain: "Hon. Pedro Garcia", pop: 9210, area: 35.1 },
  { name: "Bubuyan", district: "District I", captain: "Hon. Rosa Torres", pop: 4320, area: 18.7 },
  { name: "Bucal", district: "District I", captain: "Hon. Carlos Bautista", pop: 7640, area: 29.4 },
  { name: "Canlubang", district: "District I", captain: "Hon. Luz Villanueva", pop: 28900, area: 112.5 },
  { name: "Halang", district: "District I", captain: "Hon. Miguel Fernandez", pop: 11230, area: 42.8 },
  { name: "Hornalan", district: "District I", captain: "Hon. Gloria Ramos", pop: 5670, area: 22.3 },
  { name: "Kay-Anlog", district: "District I", captain: "Hon. Antonio Lopez", pop: 3890, area: 16.2 },
  { name: "La Mesa", district: "District I", captain: "Hon. Cecilia Flores", pop: 6780, area: 27.6 },
  { name: "Laguerta", district: "District II", captain: "Hon. Ramon Cruz", pop: 8920, area: 34.9 },
  { name: "Lawa", district: "District II", captain: "Hon. Nelia Gomez", pop: 7340, area: 28.8 },
  { name: "Lecheria", district: "District II", captain: "Hon. Salvador Rivera", pop: 5120, area: 20.4 },
  { name: "Lingga", district: "District II", captain: "Hon. Esperanza Morales", pop: 4670, area: 19.1 },
  { name: "Looc", district: "District II", captain: "Hon. Vicente Navarro", pop: 9870, area: 38.5 },
  { name: "Mabato", district: "District II", captain: "Hon. Conchita Aquino", pop: 6230, area: 25.7 },
  { name: "Makiling", district: "District II", captain: "Hon. Rodrigo Pascual", pop: 14560, area: 56.8 },
  { name: "Mapagong", district: "District II", captain: "Hon. Florencia Dela Torre", pop: 3780, area: 15.3 },
  { name: "Masili", district: "District II", captain: "Hon. Eduardo Castillo", pop: 8450, area: 33.2 },
  { name: "Maunong", district: "District II", captain: "Hon. Teresita Aguilar", pop: 5890, area: 23.6 },
  { name: "Mayapa", district: "District II", captain: "Hon. Benjamin Abad", pop: 7120, area: 28.1 },
  { name: "Milagrosa", district: "District II", captain: "Hon. Milagros Ocampo", pop: 4230, area: 17.8 },
  { name: "Paciano Rizal", district: "District III", captain: "Hon. Herminia Valdez", pop: 10450, area: 41.2 },
  { name: "Palingon", district: "District III", captain: "Hon. Alfredo Santiago", pop: 6780, area: 26.9 },
  { name: "Palo-Alto", district: "District III", captain: "Hon. Rosario Enriquez", pop: 8930, area: 35.6 },
  { name: "Pansol", district: "District III", captain: "Hon. Danilo Mercado", pop: 12340, area: 48.7 },
  { name: "Parian", district: "District III", captain: "Hon. Juliana Medina", pop: 7560, area: 30.2 },
  { name: "Prinza", district: "District III", captain: "Hon. Renato Jimenez", pop: 4890, area: 20.1 },
  { name: "Punta", district: "District III", captain: "Hon. Soledad Ramirez", pop: 9670, area: 38.4 },
  { name: "Putho-Tuntungin", district: "District III", captain: "Hon. Marcelo Roque", pop: 5340, area: 21.8 },
  { name: "Real", district: "District III", captain: "Hon. Victorina Dela Rosa", pop: 8120, area: 32.5 },
  { name: "Saimsim", district: "District III", captain: "Hon. Florencio Tolentino", pop: 6450, area: 25.9 },
  { name: "Sampirono", district: "District III", captain: "Hon. Amparo Villarin", pop: 4780, area: 19.6 },
  { name: "San Cristobal", district: "District III", captain: "Hon. Esteban Coronel", pop: 11230, area: 44.8 },
  { name: "San Jose", district: "District IV", captain: "Hon. Carmelita Bernal", pop: 9870, area: 39.3 },
  { name: "San Juan", district: "District IV", captain: "Hon. Patricio Lim", pop: 7890, area: 31.7 },
  { name: "San Miguel", district: "District IV", captain: "Hon. Rosalinda Soriano", pop: 13450, area: 53.2 },
  { name: "Sirang Lupa", district: "District IV", captain: "Hon. Domingo Cabrera", pop: 5230, area: 21.4 },
  { name: "Sucol", district: "District IV", captain: "Hon. Natividad Maceda", pop: 6780, area: 27.3 },
  { name: "Turbina", district: "District IV", captain: "Hon. Gregorio Tan", pop: 8920, area: 35.8 },
  { name: "Ulango", district: "District IV", captain: "Hon. Pilar Macaraeg", pop: 4560, area: 18.9 },
  { name: "Uno", district: "District IV", captain: "Hon. Arturo Baluyot", pop: 7340, area: 29.6 },
  { name: "Uwisan", district: "District IV", captain: "Hon. Imelda Concepcion", pop: 9120, area: 36.7 },
  { name: "Cuyab", district: "Poblacion", captain: "Hon. Felicitas Herrera", pop: 5670, area: 22.8 },
  { name: "Tulo", district: "Poblacion", captain: "Hon. Ricardo Guerrero", pop: 8430, area: 33.9 },
  { name: "Pooc", district: "Poblacion", captain: "Hon. Corazon Perez", pop: 6890, area: 27.7 },
  { name: "Niugan", district: "Poblacion", captain: "Hon. Manolo Ibarra", pop: 4320, area: 17.5 },
  { name: "Majada Labas", district: "Poblacion", captain: "Hon. Lourdes Alvarez", pop: 7650, area: 30.8 },
  { name: "Majada Ilaya", district: "Poblacion", captain: "Hon. Emilio Evangelista", pop: 5890, area: 23.7 },
  { name: "Loma", district: "Poblacion", captain: "Hon. Estrella Catapang", pop: 9230, area: 37.2 },
  { name: "Longos", district: "Poblacion", captain: "Hon. Virgilio Espinosa", pop: 6540, area: 26.3 },
  { name: "Pamplona", district: "Poblacion", captain: "Hon. Remedios Banaag", pop: 11230, area: 45.1 },
];

export const barangays: Barangay[] = rawBarangays.map((b, idx) => ({
  id: `brgy-${String(idx + 1).padStart(3, "0")}`,
  name: b.name,
  district: b.district,
  captainName: b.captain,
  population: b.pop,
  areaHectares: b.area,
  contactEmail: `${b.name.toLowerCase().replace(/[^a-z]/g, ".")}@calamba.gov.ph`,
  contactPhone: `(049) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
  address: `${b.name} Barangay Hall, Calamba City, Laguna`,
  isActive: true,
}));

export function getBarangayById(id: string): Barangay | undefined {
  return barangays.find((b) => b.id === id);
}
