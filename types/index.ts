export type Locale="en"|"es";
export type Frequency="one_time"|"weekly"|"biweekly"|"monthly";
export type Service={id:string;slug:string;name_en:string;name_es:string;description_en:string;description_es:string;starting_price:number;pricing_unit:string|null;image_url:string|null;active:boolean;featured:boolean;sort_order:number};
export type PricingRule={service_id:string;min_sqft:number;max_sqft:number|null;price:number;frequency:Frequency;active:boolean};
