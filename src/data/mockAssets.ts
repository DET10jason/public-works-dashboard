export interface GeoAsset {
    id: string;
    type: 'Water' | 'Wastewater' | 'Streets' | 'Stormwater';
    status: 'Critical' | 'Operational' | 'Under Maintenance';
    latitude: number;
    longitude: number;
    description: string;
  }
  
  export const mockAssets: GeoAsset[] = [
    { id: "W-102", type: "Water", status: "Critical", latitude: 35.918, longitude: -95.961, description: "Main Line Pressure Drop - Main St" },
    { id: "S-504", type: "Streets", status: "Under Maintenance", latitude: 35.922, longitude: -95.955, description: "Asphalt Resurfacing - 111th St" },
    { id: "WW-301", type: "Wastewater", status: "Operational", latitude: 35.912, longitude: -95.970, description: "Lift Station 4 Regular Inspection" },
    { id: "ST-881", type: "Stormwater", status: "Operational", latitude: 35.930, longitude: -95.940, description: "Catch Basin Clearance" }
  ];
  