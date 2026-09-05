import { z } from "zod";

export const deliverySchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50),
  lastName: z.string().trim().min(1, "Last name is required").max(50),
  email: z.string().trim().email("Invalid email address"),
  phone: z.string().trim().regex(/^(\+91[\s-]?)?[6-9]\d{9}$/, "Enter a valid Indian phone number"),
  address: z.string().trim().min(5, "Address is too short").max(200),
  city: z.string().trim().min(2, "City is required").max(50),
  pin: z.string().trim().regex(/^\d{6}$/, "PIN must be 6 digits"),
});

export type DeliveryData = z.infer<typeof deliverySchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character (e.g. @, #, !)"),
});

export const forgotSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(100),
  phone: z.string().trim().max(15).optional().or(z.literal("")),
  defaultSize: z.enum(["XS", "S", "M", "L", "XL"]),
});
