/**
 * Canonical Industrial Photography Asset Registry & Resolvers
 * 
 * Provides verified local industrial photography assets, accessible alt tags,
 * and deterministic machine, material & industry visual resolvers.
 */

export interface IndustrialImage {
  src: string;
  fallbackSrc?: string;
  alt: string;
  caption?: string;
  label?: string;
}

export interface WizardStepVisual {
  stepNumber: number;
  id: string;
  title: string;
  heading: string;
  supportingText: string;
  image: IndustrialImage;
  badge: string;
  highlights: string[];
}

export const SHIFT_BRIEFING_HERO: IndustrialImage = {
  src: "/images/shift-briefing-wide.jpg",
  fallbackSrc: "/images/shift-briefing-wide.jpg",
  alt: "Commercial offset press plant floor with Heidelberg Speedmaster line, paper roll staging, and industrial overhead lighting",
  caption: "High-speed commercial offset printing hall — Shift 1 active run",
  label: "Bay 01 • Press Hall"
};

export const WORKER_FLOOR_HERO: IndustrialImage = {
  src: "/images/worker-floor-hero.jpg",
  fallbackSrc: "/images/worker-floor-hero.jpg",
  alt: "Certified floor technician operating rugged digital tablet terminal beside packaging and conveyor line",
  caption: "Station 01 — Floor terminal & tactile operator console",
  label: "Press Room • Station #01"
};

/**
 * 6-Step Setup Wizard Canonical Visuals and Narrative Metadata
 */
export const WIZARD_STEPS_ASSETS: Record<number, WizardStepVisual> = {
  1: {
    stepNumber: 1,
    id: "factory-basics",
    title: "Factory Basics",
    heading: "Let's Get to Know Your Factory",
    supportingText: "Start with the essential details that make your factory unique.",
    image: {
      src: "/images/wizard/step1-exterior.webp",
      fallbackSrc: "/images/wizard/step1-exterior.jpg",
      alt: "Modern industrial manufacturing facility exterior building with architectural glass facade and entrance",
      caption: "Manufacturing Facility Entrance • Facility Identification",
      label: "Plant Profile"
    },
    badge: "Facility Identity",
    highlights: [
      "Establish legal entity & facility coordinates",
      "Configure square footage & production area",
      "Set operational timezone & shift baselines"
    ]
  },
  2: {
    stepNumber: 2,
    id: "industry-selection",
    title: "Industry Selection",
    heading: "What Does Your Factory Make?",
    supportingText: "Choose your industry and production type so we can tailor the setup to your operations.",
    image: {
      src: "/images/wizard/step2-industry.webp",
      fallbackSrc: "/images/wizard/step2-industry.jpg",
      alt: "Industrial manufacturing plant floor with automated production line, conveyors, and robotic arms",
      caption: "Flexible Automated Production Floor • Process Flow",
      label: "Industry & Operations"
    },
    badge: "Manufacturing Model",
    highlights: [
      "24 categorized manufacturing sectors",
      "Tailors machinery & substrate recommendations",
      "Configures batch, continuous, or assembly rhythm"
    ]
  },
  3: {
    stepNumber: 3,
    id: "machines-equipment",
    title: "Machines & Equipment",
    heading: "Build Your Machine Inventory",
    supportingText: "Select the equipment used in your production process and add its details.",
    image: {
      src: "/images/wizard/step3-machines.webp",
      fallbackSrc: "/images/wizard/step3-machines.jpg",
      alt: "Precision multi-axis industrial CNC machining center with digital telemetry control console",
      caption: "High-Precision CNC Machining Center • Asset Registry",
      label: "Machine Fleet"
    },
    badge: "Equipment Assets",
    highlights: [
      "Track rated capacity, hourly rates & line locations",
      "Industry-tailored equipment suggestions",
      "Custom machine registration supported"
    ]
  },
  4: {
    stepNumber: 4,
    id: "raw-materials",
    title: "Raw Materials",
    heading: "Add Your Raw Materials",
    supportingText: "Register the materials your factory uses and connect them to the relevant machines or processes.",
    image: {
      src: "/images/wizard/step4-materials.webp",
      fallbackSrc: "/images/wizard/step4-materials.jpg",
      alt: "Organized industrial raw materials warehouse with high-bay shelving, palletized stock, and metal coils",
      caption: "High-Bay Raw Material Warehouse • Stock Inventory",
      label: "Inventory Bay"
    },
    badge: "Materials & Inventory",
    highlights: [
      "Direct machine-to-material consumption mappings",
      "Initial physical stock & reorder threshold rules",
      "Hazardous & sensitive material protocol tagging"
    ]
  },
  5: {
    stepNumber: 5,
    id: "workers-assignments",
    title: "Workers & Assignments",
    heading: "Meet Your Factory Team",
    supportingText: "Add your workforce and assign people to the machines, lines, and shifts they operate.",
    image: {
      src: "/images/wizard/step5-workers.webp",
      fallbackSrc: "/images/wizard/step5-workers.jpg",
      alt: "Factory operators and supervisor in protective PPE and safety vests collaborating at production machines",
      caption: "Certified Shop-Floor Operators & Shift Leads • Workforce",
      label: "Factory Workforce"
    },
    badge: "Team & Floor Roles",
    highlights: [
      "Assign operators to single or multiple machines",
      "Multi-shift scheduling (Morning, Evening, Night)",
      "Role-based floor permissions for worker terminals"
    ]
  },
  6: {
    stepNumber: 6,
    id: "import-data",
    title: "Import Factory Data",
    heading: "Bring Your Factory Data In",
    supportingText: "Upload your Excel or CSV files, review the imported records, and complete your factory setup.",
    image: {
      src: "/images/wizard/step6-import.webp",
      fallbackSrc: "/images/wizard/step6-import.jpg",
      alt: "Factory manager seated in plant control office reviewing spreadsheets and production dashboards on computer",
      caption: "Plant Operations Control Office • Batch Spreadsheet Onboarding",
      label: "Data Onboarding"
    },
    badge: "Batch Data Ingestion",
    highlights: [
      "Upload Excel (.xlsx) or CSV (.csv) records",
      "Pre-commit schema validation & formula injection guard",
      "Instant launch to live operational control room"
    ]
  }
};

export function getWizardStepAsset(step: number): WizardStepVisual {
  return WIZARD_STEPS_ASSETS[step] || WIZARD_STEPS_ASSETS[1];
}

/**
 * Resolves verified machine equipment photography based on machine metadata.
 * Uses deterministic fallback when specific equipment model cannot be inferred.
 */
export function getMachineImage(m?: { id?: string; name?: string; type?: string; model?: string }): IndustrialImage {
  if (!m) {
    return {
      src: "/images/machines/heidelberg-cx104.jpg",
      fallbackSrc: "/images/machines/heidelberg-cx104.jpg",
      alt: "Industrial production equipment reference photograph",
      label: "Machine Asset"
    };
  }

  const text = `${m.name || ""} ${m.type || ""} ${m.model || ""} ${m.id || ""}`.toLowerCase();

  if (text.includes("cnc") || text.includes("milling") || text.includes("lathe") || text.includes("machining")) {
    return {
      src: "/images/machines/cnc-milling.jpg",
      fallbackSrc: "/images/machines/cnc-milling.jpg",
      alt: "Multi-axis CNC milling machine center with digital controls",
      label: "CNC Milling"
    };
  }

  if (text.includes("robot") || text.includes("arm") || text.includes("assembly") || text.includes("welding") || text.includes("conveyor")) {
    return {
      src: "/images/machines/robotic-arm.jpg",
      fallbackSrc: "/images/machines/robotic-arm.jpg",
      alt: "Robotic automation arm and conveyor assembly line",
      label: "Robotic Assembly"
    };
  }

  if (text.includes("heidelberg") || text.includes("offset") || text.includes("cx 104") || text.includes("hd-104") || text.includes("speedmaster")) {
    return {
      src: "/images/machines/heidelberg-cx104.jpg",
      fallbackSrc: "/images/machines/heidelberg-cx104.jpg",
      alt: "Heidelberg Speedmaster CX 104 4-color offset press with Prinect Press Center console",
      label: "Heidelberg CX 104"
    };
  }

  if (text.includes("xerox") || text.includes("versant") || text.includes("digital") || text.includes("xr-80")) {
    return {
      src: "/images/machines/xerox-versant.jpg",
      fallbackSrc: "/images/machines/xerox-versant.jpg",
      alt: "Xerox Versant digital production color press with dual high-capacity sheet feeder trays",
      label: "Xerox Versant 80"
    };
  }

  if (text.includes("polar") || text.includes("cutter") || text.includes("guillotine") || text.includes("cutting") || text.includes("pl-115")) {
    return {
      src: "/images/machines/polar-guillotine.jpg",
      fallbackSrc: "/images/machines/polar-guillotine.jpg",
      alt: "Polar 115 high-speed hydraulic paper cutting guillotine with optical safety light barriers",
      label: "Polar 115 Guillotine"
    };
  }

  if (text.includes("muller") || text.includes("martini") || text.includes("stitcher") || text.includes("binding") || text.includes("binder") || text.includes("mm-01")) {
    return {
      src: "/images/machines/muller-martini.jpg",
      fallbackSrc: "/images/machines/muller-martini.jpg",
      alt: "Muller Martini saddle stitcher and automated booklet trimmer line with wire stitch heads",
      label: "Muller Martini Presto"
    };
  }

  // Consistent fallback: Heidelberg offset press
  return {
    src: "/images/machines/heidelberg-cx104.jpg",
    fallbackSrc: "/images/machines/heidelberg-cx104.jpg",
    alt: `Equipment reference image for ${m.name || "production machine"}`,
    label: m.type || "Equipment"
  };
}

/**
 * Resolves verified raw material / consumable warehouse photography.
 * Matches substrate category and SKU with actual factory stock visuals.
 */
export function getMaterialImage(mat?: { sku?: string; name?: string; category?: string }): IndustrialImage {
  if (!mat) {
    return {
      src: "/images/inventory/paper-reams.jpg",
      fallbackSrc: "/images/inventory/paper-reams.jpg",
      alt: "Industrial warehouse raw material inventory pallets",
      label: "Inventory Item"
    };
  }

  const text = `${mat.category || ""} ${mat.sku || ""} ${mat.name || ""}`.toLowerCase();

  if (text.includes("steel") || text.includes("metal") || text.includes("coil") || text.includes("copper") || text.includes("aluminum")) {
    return {
      src: "/images/inventory/metal-coils.jpg",
      fallbackSrc: "/images/inventory/metal-coils.jpg",
      alt: "Industrial raw metal and steel coils in warehouse racking",
      label: "Metal Stock"
    };
  }

  if (text.includes("ink") || text.includes("process-set") || text.includes("cmyk") || text.includes("toner") || text.includes("varnish") || text.includes("chemical") || text.includes("solvent")) {
    return {
      src: "/images/inventory/cmyk-inks.jpg",
      fallbackSrc: "/images/inventory/cmyk-inks.jpg",
      alt: "Hubergroup process CMYK offset printing ink set in sealed metal cans",
      label: "Process Inks"
    };
  }

  if (text.includes("plate") || text.includes("thermal") || text.includes("ctp") || text.includes("kodak") || text.includes("sonora")) {
    return {
      src: "/images/inventory/ctp-plates.jpg",
      fallbackSrc: "/images/inventory/ctp-plates.jpg",
      alt: "Kodak Sonora thermal CTP aluminum offset printing plates in moisture-barrier packaging",
      label: "CTP Plates"
    };
  }

  // Paper / Board / Reams / Maplitho / Art Card / Duplex
  return {
    src: "/images/inventory/paper-reams.jpg",
    fallbackSrc: "/images/inventory/paper-reams.jpg",
    alt: "Stacked reams of commercial paper stock and art card on wooden pallets in warehouse",
    label: "Paper Stock"
  };
}

/**
 * Resolves visual thumbnail for industry sectors.
 */
export function getIndustryThumbnail(industryId: string): IndustrialImage {
  const map: Record<string, { src: string; fallback: string; alt: string; label: string }> = {
    textile_garment: {
      src: "/images/industries/textile.webp",
      fallback: "/images/industries/textile.jpg",
      alt: "Textile manufacturing weaving looms and spinning spools",
      label: "Textiles",
    },
    chemical_petrochemical: {
      src: "/images/industries/chemical.webp",
      fallback: "/images/industries/chemical.jpg",
      alt: "Chemical processing plant stainless distillation columns and reactors",
      label: "Chemicals",
    },
    pharma_medical: {
      src: "/images/industries/pharma.webp",
      fallback: "/images/industries/pharma.jpg",
      alt: "Pharmaceutical cleanroom blister packing and tablet pressing",
      label: "Pharma",
    },
    food_beverage: {
      src: "/images/industries/food.webp",
      fallback: "/images/industries/food.jpg",
      alt: "Food and beverage automated bottling and conveyor packaging line",
      label: "Food & Bev",
    },
    automotive_components: {
      src: "/images/industries/automotive.webp",
      fallback: "/images/industries/automotive.jpg",
      alt: "Automotive robotic welding arm and assembly line",
      label: "Automotive",
    },
    electronics_electrical: {
      src: "/images/industries/electronics.webp",
      fallback: "/images/industries/electronics.jpg",
      alt: "Electronics automated manufacturing line and surface mount technology",
      label: "Electronics",
    },
    plastic_polymer: {
      src: "/images/industries/plastics.webp",
      fallback: "/images/industries/plastics.jpg",
      alt: "Plastic injection molding machine and robotic parts extractor",
      label: "Plastics",
    },
    metal_fabrication: {
      src: "/images/industries/metal.webp",
      fallback: "/images/industries/metal.jpg",
      alt: "Precision CNC metal fabrication milling center",
      label: "Metal Fab",
    },
    steel_metal_processing: {
      src: "/images/industries/steel.webp",
      fallback: "/images/industries/steel.jpg",
      alt: "Steel processing coils and raw sheet stock",
      label: "Steel",
    },
    paper_pulp_packaging: {
      src: "/images/industries/packaging.webp",
      fallback: "/images/industries/packaging.jpg",
      alt: "Corrugated packaging paper reams and palletized stock",
      label: "Packaging",
    },
    printing_publishing: {
      src: "/images/industries/printing.webp",
      fallback: "/images/industries/printing.jpg",
      alt: "Commercial offset printing press hall and printing consoles",
      label: "Printing",
    },
    heavy_machinery: {
      src: "/images/wizard/step3-machines.webp",
      fallback: "/images/wizard/step3-machines.jpg",
      alt: "Heavy manufacturing CNC machinery and equipment",
      label: "Machinery",
    },
    aerospace_defense: {
      src: "/images/machines/cnc-milling.jpg",
      fallback: "/images/machines/cnc-milling.jpg",
      alt: "High-precision aerospace component CNC machining",
      label: "Aerospace",
    },
    agriculture_agro: {
      src: "/images/industries/food.webp",
      fallback: "/images/industries/food.jpg",
      alt: "Agro-processing grain cleaning and food packaging",
      label: "Agro-Processing",
    },
    recycling_waste: {
      src: "/images/industries/plastics.webp",
      fallback: "/images/industries/plastics.jpg",
      alt: "Recycling pelletizing and materials recovery processing",
      label: "Recycling",
    },
  };

  const found = map[industryId];
  if (found) {
    return {
      src: found.src,
      fallbackSrc: found.fallback,
      alt: found.alt,
      label: found.label,
    };
  }

  // Graceful fallback
  return {
    src: "/images/industries/printing.webp",
    fallbackSrc: "/images/industries/printing.jpg",
    alt: "Industrial manufacturing plant process",
    label: "Manufacturing",
  };
}
