import type { PaginatedListResponse } from "../types/global.js";
import type {
  NewProperty,
  Property,
  PropertyListQuery,
} from "../types/property.js";
import type { BasicSupabaseClient } from "../types/supabase.js";

export async function getProperties(
  supabase: BasicSupabaseClient,
  query: PropertyListQuery,
): Promise<PaginatedListResponse<Property>> {
  const startIndex = query.offset;
  const endIndex = query.offset + query.limit - 1;

  const ascending = query.sort_order === "asc";

  let supabaseQuery = supabase
    .from("properties")
    .select("*", { count: "exact" });

  if (query.city) {
    supabaseQuery = supabaseQuery.eq("city", query.city);
  }

  if (query.max_guests) {
    supabaseQuery = supabaseQuery.gte("max_guests", query.max_guests);
  }

  if (query.min_price !== undefined) {
    supabaseQuery = supabaseQuery.gte("price_per_night", query.min_price);
  }

  if (query.max_price !== undefined) {
    supabaseQuery = supabaseQuery.lte("price_per_night", query.max_price);
  }

  if (query.q) {
    const searchPattern = `%${query.q}%`;

    supabaseQuery = supabaseQuery.or(
      `title.ilike.${searchPattern},description.ilike.${searchPattern},city.ilike.${searchPattern}`,
    );
  }

  if (query.kind) {
    supabaseQuery = supabaseQuery.eq("kind", query.kind);
  }

  const { data, error, count } = await supabaseQuery
    .order(query.sort_by, { ascending })
    .range(startIndex, endIndex);

  if (error) {
    throw new Error(error.message);
  }

  return {
    data: data ?? [],
    count: count ?? 0,
    offset: query.offset,
    limit: query.limit,
  };
}

export async function getPropertyById(
  supabase: BasicSupabaseClient,
  id: string,
): Promise<Property | null> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("property_id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createProperty(
  supabase: BasicSupabaseClient,
  property: NewProperty,
  hostId: string,
): Promise<Property> {
  const { data, error } = await supabase
    .from("properties")
    .insert({...property, host_id: hostId})
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Property could not be created");
  }
  return data;
}

export async function updateProperty(
  supabase: BasicSupabaseClient,
  id: string,
  property: NewProperty,
): Promise<Property | null> {
  const { data, error } = await supabase
    .from("properties")
    .update(property)
    .eq("property_id", id)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

export async function deleteProperty(
  supabase: BasicSupabaseClient,
  id: string,
): Promise<Property | null> {
  const existingProperty = await getPropertyById(supabase, id);

  if (!existingProperty) {
    return null;
  }

  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("property_id", id);

  if (error) {
    throw new Error(error.message);
  }
  return existingProperty;
}
