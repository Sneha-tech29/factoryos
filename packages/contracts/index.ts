/**
 * FactoryOS Shared Type Contracts
 * Synchronized across apps/web frontend and apps/api backend
 */

export type Role = "OWNER" | "SUPERVISOR" | "WORKER";

export type MachineType = "OFFSET" | "DIGITAL" | "CUTTING" | "BINDING" | "SCREEN";
export type MachineStatus = "RUNNING" | "IDLE" | "DOWN" | "MAINTENANCE";

export interface Machine {
  id: string;
  name: string;
  type: MachineType;
  speed_units_per_hr: number;
  setup_time_mins: number;
  hourly_rate_inr: number;
  status: MachineStatus;
  current_job_id: string | null;
}

export type MaterialCategory = "PAPER" | "INK" | "PLATE" | "CHEMICAL" | "PACKAGING";

export interface Material {
  id: string;
  sku: string;
  name: string;
  category: MaterialCategory;
  unit: string;
  physical_stock: number;
  reserved_stock: number;
  damaged_stock: number;
  usable_stock: number;
  projected_available: number;
  unit_cost_inr: number;
  reorder_threshold: number;
  is_shortage: boolean;
}

export type RiskRating = "SAFE" | "POSSIBLE_WITH_RISK" | "NOT_RECOMMENDED" | "CANNOT_ASSESS";
export type OrderStatus = "NEW" | "FEASIBILITY_PENDING" | "SCHEDULED" | "IN_PRODUCTION" | "COMPLETED" | "DISPATCHED" | "CANCELLED";

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  product_type: string;
  quantity: number;
  unit: string;
  agreed_price_inr: number;
  deadline: string;
  status: OrderStatus;
  risk_rating: RiskRating;
  risk_reason?: string;
}

export interface FeasibilityResponse {
  order_id: string;
  verdict: RiskRating;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  summary: string;
  constraints_met: string[];
  constraints_violated: string[];
  missing_data: string[];
  assumptions: string[];
  recommended_action: string;
}

export type WorkerEventType = "START" | "PAUSE" | "RESUME" | "PROBLEM" | "WASTE" | "COMPLETE";

export interface WorkerEvent {
  job_id: string;
  machine_id: string;
  event_type: WorkerEventType;
  idempotency_key: string;
  payload?: Record<string, unknown>;
}

export interface CopilotGroundedResponse {
  short_answer: string;
  supporting_facts: Array<{ record: string; fact: string }>;
  reasons: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  limitations: string;
  next_step: string;
}
