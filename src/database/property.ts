import { supabase } from '../lib/supabase.js';
import type { NewProperty, Property } from '../types/property.js';

export async function getProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });

    if (error) {
        throw new Error(error.message);
    }
    return data ?? [];
}