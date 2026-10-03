import * as z from "zod";
import { zValidator } from "@hono/zod-validator";
import { getValidatorError } from "../utils/validation.js";

const authSchema = z.object({
    email: z.email("A valid email is required"),
    password: z.string().min(6, "Password has to be 6 characters or more"),
})

