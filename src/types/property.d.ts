export type PropertyKind =  "apartment" | "villa";

export type PropertySortBy =
  | "title"
  | "city"
  | "country"
  | "price_per_night"
  | "created_at";

export type SortOrder = "asc" | "desc";

export type PropertyListQuery = {
  limit: number;
  offset: number;
  city?: string;
  country?: string;
  max_guests?: number;
  min_price?: number;
  max_price?: number;
  q?: string;
  sort_by: PropertySortBy;
  sort_order: SortOrder;
  kind?: PropertyKind;
  host_id?: string;
};


export interface NewProperty {
  title: string;
  description: string;
  city: string;
  country: string;
  kind: PropertyKind;
  price_per_night: number;
  max_guests: number;
  image_url?: string | null;
}

export interface Property extends NewProperty {
  property_id: string;
  host_id: string;
  created_at: string;
}