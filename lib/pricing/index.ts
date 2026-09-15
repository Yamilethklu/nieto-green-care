import type {Frequency,PricingRule} from "@/types";
export function calculatePrice(serviceId:string,sqft:number,frequency:Frequency,rules:PricingRule[]){if(!Number.isFinite(sqft)||sqft<=0)return null;const rule=rules.find(r=>r.active&&r.service_id===serviceId&&r.frequency===frequency&&sqft>=r.min_sqft&&(r.max_sqft===null||sqft<=r.max_sqft));return rule?.price??null}
