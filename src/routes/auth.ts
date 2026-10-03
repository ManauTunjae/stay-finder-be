import { Hono } from "hono";
import { authValidator } from "../validators/authValidators.js";

const auth = new Hono({
  strict: false,
});

auth.post("/register", authValidator, async (c) => {
  const { email, password } = c.req.valid("json");
  try {
    const supabase = c.get("supabase");
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (!error) {
      return c.json(
        {
          user: data.user,
        },
        201,
      );
    }
  } catch (error: any) {
    console.warn("Error in registering", error);
    return c.json(
      {
        message: error?.message,
      },
      400,
    );
  }
});

auth.post("/login", authValidator, async (c) => {
  const { email, password } = c.req.valid("json");
  try {
    const supabase = c.get("supabase");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (!error) {
      return c.json({
        user: data.user,
      });
    }
    throw error;
  } catch (error: any) {
    console.warn("Error in login", error);
    return c.json(
      {
        message: error?.message,
      },
      400,
    );
  }
});

export default auth;
