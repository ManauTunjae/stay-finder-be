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

export async function getPropertyById(id: string): Promise<Property | null> {
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