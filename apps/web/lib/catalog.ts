/**
 * FactoryOS Multi-Industry Catalog & Relationships
 * Provides structured industries, tailored machine options, raw material suggestions, and mapping rules.
 */

export interface IndustryOption {
  id: string;
  name: string;
  category: string;
  defaultProcesses: string[];
  productSuggestions: string[];
}

export const INDUSTRIES: IndustryOption[] = [
  {
    id: "textile_garment",
    name: "Textile and Garment Manufacturing",
    category: "Apparel & Textiles",
    defaultProcesses: ["Spinning", "Weaving", "Dyeing", "Cutting", "Stitching", "Finishing"],
    productSuggestions: ["Cotton T-Shirts", "Woven Fabrics", "Denim Jeans", "Yarn Spools", "Knitted Goods"],
  },
  {
    id: "chemical_petrochemical",
    name: "Chemical and Petrochemical",
    category: "Chemicals & Materials",
    defaultProcesses: ["Distillation", "Reaction Synthesis", "Blending", "Filtration", "Liquid Packaging"],
    productSuggestions: ["Industrial Solvents", "Resins & Polymers", "Specialty Additives", "Lubricants", "Fertilizers"],
  },
  {
    id: "pharma_medical",
    name: "Pharmaceutical and Medical Products",
    category: "Healthcare & Life Sciences",
    defaultProcesses: ["Granulation", "Tablet Pressing", "Capsule Filling", "Sterilization", "Blister Packaging"],
    productSuggestions: ["Tablets & Capsules", "Injectables", "Syrups & Suspensions", "Surgical Dressings", "Medical Implants"],
  },
  {
    id: "food_beverage",
    name: "Food and Beverage Processing",
    category: "Food & Agriculture",
    defaultProcesses: ["Mixing & Blending", "Baking / Cooking", "Pasteurization", "Refrigeration", "Bottling & Canning"],
    productSuggestions: ["Packaged Snacks", "Dairy Products", "Beverages & Juices", "Edible Oils", "Processed Grains"],
  },
  {
    id: "automotive_components",
    name: "Automotive and Auto Components",
    category: "Automotive & Transport",
    defaultProcesses: ["Stamping & Pressing", "Robotic Welding", "CNC Machining", "Electro-Deposition Painting", "Assembly"],
    productSuggestions: ["Brake Assemblies", "Chassis Components", "Engine Castings", "Wire Harnesses", "Transmission Gears"],
  },
  {
    id: "electronics_electrical",
    name: "Electronics and Electrical Equipment",
    category: "Technology & High-Tech",
    defaultProcesses: ["SMT Component Placement", "Reflow Soldering", "Wave Soldering", "Firmware Flashing", "Final Testing"],
    productSuggestions: ["PCB Assemblies", "Power Inverters", "LED Luminaires", "Control Panels", "Smart Meters"],
  },
  {
    id: "plastic_polymer",
    name: "Plastic and Polymer Manufacturing",
    category: "Chemicals & Materials",
    defaultProcesses: ["Injection Molding", "Blow Molding", "Extrusion", "Thermoforming", "Recycling Compounding"],
    productSuggestions: ["Plastic Containers", "Pipes & Fittings", "Automotive Plastics", "PET Preforms", "Packaging Films"],
  },
  {
    id: "metal_fabrication",
    name: "Metal Fabrication and Foundries",
    category: "Metals & Mining",
    defaultProcesses: ["Sand Casting", "Forging", "Laser Cutting", "Bending", "TIG/MIG Welding"],
    productSuggestions: ["Custom Brackets", "Sheet Metal Enclosures", "Heavy Flanges", "Structural Beams", "Pressure Vessel Tanks"],
  },
  {
    id: "steel_metal_processing",
    name: "Steel and Metal Processing",
    category: "Metals & Mining",
    defaultProcesses: ["Hot Rolling", "Cold Rolling", "Slitting", "Galvanizing", "Pickling"],
    productSuggestions: ["Steel Coils", "Galvanized Corrugated Sheets", "Reinforcing Bars (TMT)", "Pipes & Tubes"],
  },
  {
    id: "cement_building",
    name: "Cement and Building Materials",
    category: "Construction & Infrastructure",
    defaultProcesses: ["Crushing", "Raw Milling", "Kiln Clinkerisation", "Cement Grinding", "Bulk Bagging"],
    productSuggestions: ["Ordinary Portland Cement (OPC)", "Pozzolana Portland Cement (PPC)", "Concrete Blocks", "Ready-Mix Mortar"],
  },
  {
    id: "paper_pulp_packaging",
    name: "Paper, Pulp and Packaging",
    category: "Packaging & Paper",
    defaultProcesses: ["Pulping", "Corrugation", "Fluting", "Die-Cutting", "Gluing & Folding"],
    productSuggestions: ["Corrugated Cartons", "Kraft Paper Rolls", "Duplex Board Boxes", "Molded Pulp Trays"],
  },
  {
    id: "furniture_wood",
    name: "Furniture and Wood Processing",
    category: "Consumer & Industrial Goods",
    defaultProcesses: ["Kiln Seasoning", "Sawing & Planing", "CNC Routing", "Edge Banding", "Surface Staining & Polishing"],
    productSuggestions: ["Modular Office Desks", "Wooden Cabinets", "Upholstered Chairs", "Plywood Panels"],
  },
  {
    id: "glass_ceramics",
    name: "Glass and Ceramics",
    category: "Construction & Consumer",
    defaultProcesses: ["Batch Melting", "Float Annealing", "Tempering", "Glazing", "Kiln Firing"],
    productSuggestions: ["Toughened Architectural Glass", "Ceramic Tiles", "Glass Bottles & Jars", "Sanitaryware"],
  },
  {
    id: "rubber_manufacturing",
    name: "Rubber Manufacturing",
    category: "Chemicals & Materials",
    defaultProcesses: ["Compounding", "Vulcanization / Curing", "Molding", "Extrusion", "Calendering"],
    productSuggestions: ["Rubber Hoses", "Industrial Conveyor Belts", "Seals & Gaskets", "Tire Treads", "Rubber Sheets"],
  },
  {
    id: "semiconductor_mfg",
    name: "Semiconductor Manufacturing",
    category: "High-Tech & Electronics",
    defaultProcesses: ["Wafer Fab", "Photolithography", "Chemical Etching", "Dicing", "Wire Bonding & Packaging"],
    productSuggestions: ["Microcontrollers", "Power MOSFETs", "MEMS Sensors", "Custom ASIC Packages"],
  },
  {
    id: "battery_energy_storage",
    name: "Battery and Energy Storage",
    category: "Energy & CleanTech",
    defaultProcesses: ["Slurry Mixing", "Electrode Coating", "Calendering & Slitting", "Cell Winding / Stacking", "Electrolyte Filling & Aging"],
    productSuggestions: ["Li-ion Prismatic Cells", "Lithium Iron Phosphate (LFP) Packs", "Lead-Acid Traction Batteries", "ESS Modules"],
  },
  {
    id: "renewable_energy_eq",
    name: "Renewable Energy Equipment",
    category: "Energy & CleanTech",
    defaultProcesses: ["Cell Stringing & Soldering", "Vacuum Lamination", "Framing", "Junction Box Assembly", "Flash Testing"],
    productSuggestions: ["Bifacial Solar PV Modules", "Wind Turbine Blade Shells", "Solar Inverters", "Tracking Mounts"],
  },
  {
    id: "industrial_machinery",
    name: "Industrial Machinery Manufacturing",
    category: "Capital Goods & Machinery",
    defaultProcesses: ["Precision Boring", "Gear Hobbing", "Hydraulic Assembly", "Electrical Wiring", "Factory Load Testing"],
    productSuggestions: ["Hydraulic Press Machines", "Conveyor Systems", "Packaging Machines", "Industrial Air Compressors"],
  },
  {
    id: "consumer_goods",
    name: "Consumer Goods Manufacturing",
    category: "Consumer Goods",
    defaultProcesses: ["Formulation", "High-Speed Bottling", "Cartoning", "Shrink Wrapping", "Palletizing"],
    productSuggestions: ["Detergents & Soaps", "Toothpaste & Personal Care", "Disinfectants", "Home Cleaning Solutions"],
  },
  {
    id: "agriculture_agro",
    name: "Agriculture and Agro-Processing",
    category: "Food & Agriculture",
    defaultProcesses: ["Grain Cleaning", "Drying & Sorting", "Milling", "De-husking", "Aseptic Packaging"],
    productSuggestions: ["Basmati Rice Packs", "Wheat Flour (Atta)", "Dehydrated Spices", "Cold-Pressed Seed Oils"],
  },
  {
    id: "recycling_waste",
    name: "Recycling and Waste Processing",
    category: "Environmental & Circular",
    defaultProcesses: ["Bale Shredding", "Optical Sorting", "Washing & Flotation", "Extrusion Pelletizing", "Granulation"],
    productSuggestions: ["Recycled PET Flakes", "HDPE Granules", "Scrap Metal Briquettes", "Refuse-Derived Fuel (RDF)"],
  },
  {
    id: "printing_publishing",
    name: "Printing and Publishing",
    category: "Commercial Printing",
    defaultProcesses: ["Pre-Press CTP Platemaking", "Offset / Digital Printing", "Guillotine Cutting", "Lamination & UV", "Folding & Binding"],
    productSuggestions: ["Commercial Catalogues", "Product Folding Cartons", "Magazines & Books", "Brochures & Flyers", "Labels & Stickers"],
  },
  {
    id: "aerospace_defense",
    name: "Aerospace and Defense Manufacturing",
    category: "Aerospace & Defense",
    defaultProcesses: ["5-Axis CNC Milling", "Autoclave Composite Curing", "Non-Destructive Testing (NDT)", "Cleanroom Assembly", "Surface Anodizing"],
    productSuggestions: ["Titanium Airframe Ribs", "Avionics Radar Housings", "Carbon Fiber Spars", "Defense Actuators"],
  },
  {
    id: "other_custom",
    name: "Other / Custom Industry",
    category: "Custom Manufacturing",
    defaultProcesses: ["Custom Assembly", "Fabrication", "Packaging", "Quality Inspection"],
    productSuggestions: ["Specialized Custom Products"],
  },
];

export interface MachineCatalogItem {
  type: string;
  name: string;
  industries: string[];
  defaultCapacityUnit: string;
  defaultSpeed: number;
  typicalMaterials: string[];
}

export const MACHINE_CATALOG: MachineCatalogItem[] = [
  // Printing & Publishing
  {
    type: "OFFSET_PRESS",
    name: "Sheetfed Offset Printing Press (4/6 Color)",
    industries: ["printing_publishing", "paper_pulp_packaging"],
    defaultCapacityUnit: "impressions/hr",
    defaultSpeed: 12000,
    typicalMaterials: ["Coated Art Paper", "Duplex Board", "Printing Inks (CMYK)", "Fountain Solution"],
  },
  {
    type: "DIGITAL_PRESS",
    name: "High-Speed Production Digital Color Press",
    industries: ["printing_publishing"],
    defaultCapacityUnit: "sheets/hr",
    defaultSpeed: 4500,
    typicalMaterials: ["Digital Art Card", "Toner / Liquid ElectroInk"],
  },
  {
    type: "GUILLOTINE_CUTTER",
    name: "High-Speed Programmable Guillotine Paper Cutter",
    industries: ["printing_publishing", "paper_pulp_packaging"],
    defaultCapacityUnit: "cuts/hr",
    defaultSpeed: 2500,
    typicalMaterials: ["Coated Art Paper", "Kraft Paper Rolls", "Duplex Board"],
  },
  {
    type: "SADDLE_STITCHER",
    name: "Automatic Saddle Stitcher & Book Binder",
    industries: ["printing_publishing"],
    defaultCapacityUnit: "books/hr",
    defaultSpeed: 5000,
    typicalMaterials: ["Stitching Wire", "Hotmelt EVA Adhesive", "Printed Folded Signatures"],
  },
  {
    type: "THERMAL_LAMINATOR",
    name: "Automatic Thermal Film Laminator",
    industries: ["printing_publishing", "paper_pulp_packaging"],
    defaultCapacityUnit: "meters/min",
    defaultSpeed: 60,
    typicalMaterials: ["BOPP Gloss Film", "BOPP Matt Film", "Hot Thermal Adhesive"],
  },

  // Textile & Garment
  {
    type: "SPINNING_FRAME",
    name: "Ring Spinning Frame Machine",
    industries: ["textile_garment"],
    defaultCapacityUnit: "kg/hr",
    defaultSpeed: 450,
    typicalMaterials: ["Cotton Yarn", "Polyester Fiber", "Synthetic Blends"],
  },
  {
    type: "WEAVING_LOOM",
    name: "High-Speed Air-Jet Weaving Loom",
    industries: ["textile_garment"],
    defaultCapacityUnit: "picks/min",
    defaultSpeed: 850,
    typicalMaterials: ["Cotton Yarn", "Polyester Yarn", "Sizing Chemicals"],
  },
  {
    type: "DYEING_VESSEL",
    name: "High-Temperature High-Pressure Dyeing Vessel",
    industries: ["textile_garment"],
    defaultCapacityUnit: "kg/batch",
    defaultSpeed: 500,
    typicalMaterials: ["Reactive Dyes", "Disperse Dyes", "Textile Finishing Auxiliaries", "Process Water"],
  },
  {
    type: "FABRIC_CUTTER",
    name: "Automated Multi-Ply CNC Fabric Cutting System",
    industries: ["textile_garment"],
    defaultCapacityUnit: "meters/hr",
    defaultSpeed: 120,
    typicalMaterials: ["Woven Cotton Fabric", "Denim Cloth", "Polyester Knit Fabric"],
  },
  {
    type: "SEWING_STATION",
    name: "Heavy-Duty Direct-Drive Industrial Sewing Machine",
    industries: ["textile_garment"],
    defaultCapacityUnit: "stitches/min",
    defaultSpeed: 4000,
    typicalMaterials: ["Polyester Sewing Thread", "Buttons & Zippers", "Woven Labels"],
  },

  // Chemical & Petrochemical
  {
    type: "REACTOR_VESSEL",
    name: "Stainless Steel Jacketed Industrial Reactor",
    industries: ["chemical_petrochemical", "pharma_medical"],
    defaultCapacityUnit: "liters/batch",
    defaultSpeed: 5000,
    typicalMaterials: ["Industrial Solvents", "Monomer Resins", "Catalysts & Acids", "Inorganic Salts"],
  },
  {
    type: "MIXING_TANK",
    name: "High-Shear Agitated Blending Tank",
    industries: ["chemical_petrochemical", "consumer_goods", "food_beverage"],
    defaultCapacityUnit: "liters/hr",
    defaultSpeed: 3000,
    typicalMaterials: ["Liquid Surfactants", "Emulsifiers", "Fragrances & Essential Oils", "Deionized Water"],
  },
  {
    type: "DISTILLATION_COLUMN",
    name: "Continuous Fractional Distillation Column",
    industries: ["chemical_petrochemical"],
    defaultCapacityUnit: "liters/hr",
    defaultSpeed: 1500,
    typicalMaterials: ["Crude Solvents", "Hydrocarbon Fractions"],
  },

  // Food & Beverage
  {
    type: "INDUSTRIAL_MIXER",
    name: "Sanitary Double-Arm Dough & Powder Mixer",
    industries: ["food_beverage"],
    defaultCapacityUnit: "kg/batch",
    defaultSpeed: 800,
    typicalMaterials: ["Refined Wheat Flour", "Granulated Sugar", "Edible Vegetable Oils", "Food Ingredients & Flavors"],
  },
  {
    type: "ROTARY_OVEN",
    name: "Continuous Tunnel Baking Oven",
    industries: ["food_beverage"],
    defaultCapacityUnit: "kg/hr",
    defaultSpeed: 600,
    typicalMaterials: ["Prepared Dough Mix", "Shortening", "Baking Yeast"],
  },
  {
    type: "ASEPTIC_FILLER",
    name: "Rotary Aseptic Liquid Filling & Capping Monoblock",
    industries: ["food_beverage", "pharma_medical", "consumer_goods"],
    defaultCapacityUnit: "bottles/hr",
    defaultSpeed: 7200,
    typicalMaterials: ["Beverage Concentrate", "PET Preforms", "Plastic Screw Caps", "Shrink Sleeve Labels"],
  },

  // Automotive & Metal Fabrication
  {
    type: "CNC_MILLING",
    name: "5-Axis Vertical CNC Machining Center",
    industries: ["automotive_components", "metal_fabrication", "aerospace_defense", "industrial_machinery"],
    defaultCapacityUnit: "parts/hr",
    defaultSpeed: 35,
    typicalMaterials: ["Aluminum Alloy Billets", "Stainless Steel Rods", "Tooling Inserts", "Soluble Cutting Coolant"],
  },
  {
    type: "HYDRAULIC_PRESS",
    name: "500-Ton Hydraulic Deep Drawing Sheet Metal Press",
    industries: ["automotive_components", "metal_fabrication", "steel_metal_processing"],
    defaultCapacityUnit: "strokes/hr",
    defaultSpeed: 600,
    typicalMaterials: ["Cold-Rolled Steel Sheets", "Galvanized Coils", "Stamping Lubricant"],
  },
  {
    type: "ROBOTIC_WELDER",
    name: "Automated 6-Axis Robotic MIG/TIG Welding Cell",
    industries: ["automotive_components", "metal_fabrication", "industrial_machinery"],
    defaultCapacityUnit: "weld meters/hr",
    defaultSpeed: 45,
    typicalMaterials: ["Welding Wire Spools (ER70S-6)", "Argon/CO2 Shielding Gas", "Stamped Metal Brackets"],
  },
  {
    type: "POWDER_COATING",
    name: "Automated Conveyorized Powder Coating & Curing Line",
    industries: ["automotive_components", "metal_fabrication", "furniture_wood"],
    defaultCapacityUnit: "sq meters/hr",
    defaultSpeed: 180,
    typicalMaterials: ["Thermoset Epoxy Powder", "Zinc Phosphating Pretreatment", "Masking Caps"],
  },

  // Plastic & Polymer
  {
    type: "INJECTION_MOLDER",
    name: "Fully Electric Precision Injection Molding Machine",
    industries: ["plastic_polymer", "automotive_components", "consumer_goods"],
    defaultCapacityUnit: "shots/hr",
    defaultSpeed: 400,
    typicalMaterials: ["Polypropylene (PP) Granules", "High-Density Polyethylene (HDPE)", "Color Masterbatch"],
  },

  // Electronics
  {
    type: "SMT_PICK_PLACE",
    name: "Dual-Gantry High-Speed SMT Pick & Place Machine",
    industries: ["electronics_electrical", "semiconductor_mfg"],
    defaultCapacityUnit: "components/hr",
    defaultSpeed: 65000,
    typicalMaterials: ["Bare FR4 PCBs", "Surface Mount ICs", "Chip Capacitors & Resistors", "Lead-Free Solder Paste"],
  },
];

export interface RawMaterialCatalogItem {
  sku: string;
  name: string;
  category: string;
  unit: string;
  industries: string[];
  defaultThreshold: number;
  typicalMachines: string[];
  isHazardous?: boolean;
}

export const RAW_MATERIAL_CATALOG: RawMaterialCatalogItem[] = [
  // Printing & Packaging
  {
    sku: "PAP-AC-300",
    name: "300 GSM Royal Coated Art Card (25x36 in)",
    category: "PAPER",
    unit: "reams",
    industries: ["printing_publishing", "paper_pulp_packaging"],
    defaultThreshold: 30,
    typicalMachines: ["OFFSET_PRESS", "DIGITAL_PRESS", "GUILLOTINE_CUTTER"],
  },
  {
    sku: "PAP-GL-130",
    name: "130 GSM Premium Gloss Art Paper (23x36 in)",
    category: "PAPER",
    unit: "reams",
    industries: ["printing_publishing"],
    defaultThreshold: 25,
    typicalMachines: ["OFFSET_PRESS", "GUILLOTINE_CUTTER"],
  },
  {
    sku: "PAP-MAP-80",
    name: "80 GSM Super Maplitho Paper (20x30 in)",
    category: "PAPER",
    unit: "reams",
    industries: ["printing_publishing"],
    defaultThreshold: 50,
    typicalMachines: ["OFFSET_PRESS", "GUILLOTINE_CUTTER"],
  },
  {
    sku: "INK-CMYK-SET",
    name: "Process CMYK Offset Inks (High-Gloss Quick Set)",
    category: "INK",
    unit: "kg",
    industries: ["printing_publishing"],
    defaultThreshold: 40,
    typicalMachines: ["OFFSET_PRESS"],
  },
  {
    sku: "PLT-CTP-THERMAL",
    name: "Thermal CTP Positive Printing Plates (0.30mm)",
    category: "PLATE",
    unit: "plates",
    industries: ["printing_publishing"],
    defaultThreshold: 60,
    typicalMachines: ["OFFSET_PRESS"],
  },
  {
    sku: "CHM-FOUNTAIN-SOL",
    name: "Alcohol-Free Buffered Fountain Solution Additive",
    category: "CHEMICAL",
    unit: "liters",
    industries: ["printing_publishing"],
    defaultThreshold: 20,
    typicalMachines: ["OFFSET_PRESS"],
    isHazardous: true,
  },
  {
    sku: "FLM-BOPP-GLOSS",
    name: "BOPP Thermal Gloss Lamination Film Roll (32 Micron)",
    category: "PACKAGING",
    unit: "rolls",
    industries: ["printing_publishing", "paper_pulp_packaging"],
    defaultThreshold: 15,
    typicalMachines: ["THERMAL_LAMINATOR"],
  },

  // Textile
  {
    sku: "TEX-YRN-COT-40",
    name: "100% Combed Cotton Ring-Spun Yarn 40s Count",
    category: "YARN",
    unit: "kg",
    industries: ["textile_garment"],
    defaultThreshold: 500,
    typicalMachines: ["SPINNING_FRAME", "WEAVING_LOOM"],
  },
  {
    sku: "TEX-FBR-POLY",
    name: "Polyester Staple Fiber 1.4 Denier Virgin",
    category: "FIBER",
    unit: "kg",
    industries: ["textile_garment"],
    defaultThreshold: 1000,
    typicalMachines: ["SPINNING_FRAME"],
  },
  {
    sku: "TEX-DYE-REACT",
    name: "Reactive Dye Concentrate (Royal Blue & Scarlet)",
    category: "DYE",
    unit: "kg",
    industries: ["textile_garment"],
    defaultThreshold: 100,
    typicalMachines: ["DYEING_VESSEL"],
    isHazardous: true,
  },
  {
    sku: "TEX-THRD-POLY",
    name: "High-Tenacity Spun Polyester Sewing Thread 3-Ply",
    category: "THREAD",
    unit: "spools",
    industries: ["textile_garment"],
    defaultThreshold: 200,
    typicalMachines: ["SEWING_STATION"],
  },

  // Chemical
  {
    sku: "CHM-SOL-IPA",
    name: "Isopropyl Alcohol (IPA) 99.9% Tech Grade",
    category: "SOLVENT",
    unit: "liters",
    industries: ["chemical_petrochemical", "pharma_medical", "printing_publishing"],
    defaultThreshold: 400,
    typicalMachines: ["REACTOR_VESSEL", "DISTILLATION_COLUMN"],
    isHazardous: true,
  },
  {
    sku: "CHM-RSN-EPOXY",
    name: "Liquid Bisphenol-A Epoxy Resin Base",
    category: "RESIN",
    unit: "kg",
    industries: ["chemical_petrochemical", "paint_coatings"],
    defaultThreshold: 800,
    typicalMachines: ["REACTOR_VESSEL", "MIXING_TANK"],
  },

  // Food
  {
    sku: "FOD-FLR-WHT",
    name: "Stone-Ground Bakery Grade Wheat Flour",
    category: "GRAIN",
    unit: "kg",
    industries: ["food_beverage"],
    defaultThreshold: 1200,
    typicalMachines: ["INDUSTRIAL_MIXER", "ROTARY_OVEN"],
  },
  {
    sku: "FOD-OIL-PALM",
    name: "Refined Bleached Deodorized Palm Olein",
    category: "OIL",
    unit: "liters",
    industries: ["food_beverage"],
    defaultThreshold: 600,
    typicalMachines: ["INDUSTRIAL_MIXER"],
  },

  // Automotive / Metal
  {
    sku: "MTL-SHT-CRCA",
    name: "CRCA Cold-Rolled Steel Sheet 1.2mm Grade D",
    category: "STEEL",
    unit: "metric_tons",
    industries: ["automotive_components", "metal_fabrication"],
    defaultThreshold: 15,
    typicalMachines: ["HYDRAULIC_PRESS", "ROBOTIC_WELDER"],
  },
  {
    sku: "MTL-WLD-WIRE",
    name: "Copper-Coated Solid MIG Welding Wire ER70S-6 (0.8mm)",
    category: "WELDING",
    unit: "spools",
    industries: ["automotive_components", "metal_fabrication"],
    defaultThreshold: 30,
    typicalMachines: ["ROBOTIC_WELDER"],
  },
  {
    sku: "PLS-GRN-PP",
    name: "Polypropylene (PP) Homopolymer Injection Grade Granules",
    category: "POLYMER",
    unit: "kg",
    industries: ["plastic_polymer", "automotive_components"],
    defaultThreshold: 1500,
    typicalMachines: ["INJECTION_MOLDER"],
  },

  // Electronics
  {
    sku: "ELC-PCB-FR4",
    name: "4-Layer Impedance-Controlled FR4 Raw PCB Panels",
    category: "PCB",
    unit: "panels",
    industries: ["electronics_electrical", "semiconductor_mfg"],
    defaultThreshold: 100,
    typicalMachines: ["SMT_PICK_PLACE"],
  },
  {
    sku: "ELC-SLD-PST",
    name: "SAC305 Lead-Free No-Clean Solder Paste Type 4",
    category: "SOLDER",
    unit: "jars",
    industries: ["electronics_electrical"],
    defaultThreshold: 20,
    typicalMachines: ["SMT_PICK_PLACE"],
    isHazardous: true,
  },
];

export function getMachinesForIndustry(industryId: string): MachineCatalogItem[] {
  return MACHINE_CATALOG.filter(
    (m) => m.industries.includes(industryId) || m.industries.includes("other_custom")
  );
}

export function getMaterialsForIndustry(industryId: string): RawMaterialCatalogItem[] {
  return RAW_MATERIAL_CATALOG.filter(
    (m) => m.industries.includes(industryId) || m.industries.includes("other_custom")
  );
}
