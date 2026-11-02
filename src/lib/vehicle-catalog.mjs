// Helpful starting points, not a complete or current India-market catalogue.
// Both fields remain free text so imports, discontinued and new models work.
export const VEHICLE_CATALOG = {
  'Maruti Suzuki': ['Alto', 'Baleno', 'Brezza', 'Celerio', 'Dzire', 'Ertiga', 'Fronx', 'Grand Vitara', 'Jimny', 'Swift', 'Wagon R'],
  Hyundai: ['Aura', 'Creta', 'Exter', 'Grand i10 Nios', 'i20', 'Venue', 'Verna'],
  Tata: ['Altroz', 'Curvv', 'Harrier', 'Nexon', 'Nexon EV', 'Punch', 'Safari', 'Tiago', 'Tigor'],
  Mahindra: ['Bolero', 'Scorpio', 'Thar', 'XUV 3XO', 'XUV700'],
  Toyota: ['Camry', 'Fortuner', 'Glanza', 'Innova', 'Urban Cruiser Hyryder'],
  Kia: ['Carens', 'Carnival', 'Seltos', 'Sonet'],
  Honda: ['City', 'Elevate', 'Amaze', 'Activa', 'Dio', 'Shine', 'SP 125', 'Unicorn', 'CB350'],
  Volkswagen: ['Polo', 'Taigun', 'Virtus'], Skoda: ['Kushaq', 'Kylaq', 'Slavia'],
  MG: ['Astor', 'Comet EV', 'Hector', 'Windsor EV'], Renault: ['Kiger', 'Kwid', 'Triber'],
  Nissan: ['Magnite'], Citroen: ['C3', 'C3 Aircross', 'Basalt'],
  BMW: [], 'Mercedes-Benz': [], Audi: [], Volvo: [], Porsche: [], BYD: [], Jeep: [], Ford: [],
  'Hero MotoCorp': ['Splendor', 'HF Deluxe', 'Passion', 'Glamour', 'Xtreme', 'Destini', 'Pleasure'],
  'Royal Enfield': ['Classic 350', 'Bullet 350', 'Hunter 350', 'Himalayan', 'Meteor 350'],
  Bajaj: ['Pulsar', 'Platina', 'CT', 'Dominar', 'Chetak'],
  TVS: ['Jupiter', 'Ntorq', 'Apache', 'Raider', 'XL100', 'iQube'],
  Suzuki: ['Access', 'Avenis', 'Burgman Street', 'Gixxer'],
  Yamaha: ['Fascino', 'RayZR', 'FZ', 'MT-15', 'R15'],
  'Ola Electric': ['S1'], Ather: ['450X', 'Rizta'], Revolt: ['RV400'],
  KTM: ['Duke', 'RC', 'Adventure'], Triumph: [], Jawa: [], Yezdi: [], Vespa: [], Aprilia: [], Kawasaki: [], Ducati: [],
};
export const vehicleMakes = Object.keys(VEHICLE_CATALOG).sort((a, b) => a.localeCompare(b));
export function modelsForMake(make) {
  const key = vehicleMakes.find(name => name.toLowerCase() === make.trim().toLowerCase());
  return key ? VEHICLE_CATALOG[key] : [];
}
