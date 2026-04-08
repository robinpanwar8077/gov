"use server";

import {
  createSession,
  getSession,
  hashPassword,
  logout as logoutSession,
  verifyPassword,
} from "@/lib/auth";
import prisma from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { generateSlug } from "@/lib/slug";
import { FormState, Role } from "@/lib/types";
import crypto from "crypto";
import { redirect } from "next/navigation";
import { z } from "zod";
import { sendOTP_SMS } from "@/lib/sms";
import { sendForgotPasswordEmail, sendSignUpPage } from "../email";

const signupSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .regex(/^[a-zA-Z0-9\s.,&'-]+$/, "Name contains invalid special characters"),
  email: z
    .string()
    .email("Invalid email address")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid comprehensive email address (e.g. name@domain.com)"),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Invalid Indian mobile number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.nativeEnum(Role, {
    message: "Please select a valid role (Vendor, OEM, or Consultant)",
  }),
});

export async function signup(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const data = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    mobile: formData.get("mobile") as string,
    password: formData.get("password") as string,
    role: formData.get("role") as Role,
  };

  const fields = {
    name: data.name,
    email: data.email,
    mobile: data.mobile,
    role: data.role,
  };

  // Zod Validation
  const validatedFields = signupSchema.safeParse(data);

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    return {
      error:
        fieldErrors.mobile?.[0] ||
        fieldErrors.email?.[0] ||
        fieldErrors.password?.[0] ||
        fieldErrors.name?.[0] ||
        "Invalid Input",
      fields,
    };
  }

  const { name, email, mobile, password, role } = validatedFields.data;

  try {
    // Check Email
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) return { error: "User with this email already exists", fields };

    // Check Mobile
    const existingMobile = await prisma.user.findUnique({ where: { mobile } });
    if (existingMobile)
      return { error: "User with this mobile already exists", fields };

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        mobile,
        passwordHash: hashedPassword,
        role,
        isVerified: false,
      },
    });

    // Create profile based on role using the provided Name
    const slug = generateSlug(name) + "-" + Date.now().toString().slice(-4);

    if (role === Role.VENDOR) {
      await prisma.vendorProfile.create({
        data: { userId: user.id, companyName: name, slug },
      });
    } else if (role === Role.OEM) {
      await prisma.oEMProfile.create({
        data: { userId: user.id, companyName: name, slug },
      });
    } else if (role === Role.CONSULTANT) {
      await prisma.consultantProfile.create({
        data: { userId: user.id, name: name, slug },
      });
    }

    await createAuditLog({
      userId: user.id,
      action: "SIGNUP",
      details: `User signed up as ${role}`,
    });

    // --- OTP GENERATION ---
    const mobileOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await prisma.user.update({
      where: { id: user.id },
      data: {
        mobileOtp,
        emailOtp,
        otpExpiry,
      },
    });

    await sendSignUpPage(mobileOtp, emailOtp, email);

    // Send SMS
    await sendOTP_SMS(mobile, mobileOtp);
    console.log(`[MOCK EMAIL] To: ${email}, OTP: ${emailOtp}`);

    return {
      success: true,
      redirect: `/signup/verify?email=${encodeURIComponent(email)}`,
    };
  } catch (error) {
    console.error("Signup Error:", error);
    return { error: "Signup failed. Please try again.", fields };
  }
}

export async function verifyOTP(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = formData.get("email") as string;
  const mobileOtp = formData.get("mobileOtp") as string;
  const emailOtp = formData.get("emailOtp") as string;

  if (!email || !mobileOtp || !emailOtp) {
    return { error: "All fields are required" };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { error: "User not found" };

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return { error: "OTPs have expired. Please resend." };
    }

    if (user.mobileOtp !== mobileOtp) {
      return { error: "Invalid Mobile OTP" };
    }

    if (user.emailOtp !== emailOtp) {
      return { error: "Invalid Email OTP" };
    }

    // All good, verify
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        mobileOtp: null,
        emailOtp: null,
        otpExpiry: null,
      },
    });

    // Auto-login after verification
    await createSession({ id: user.id, email: user.email, role: user.role });

    await createAuditLog({
      userId: user.id,
      action: "VERIFY_OTP",
      details: "User successfully verified OTP and logged in",
    });

    let redirectPath = "/";
    if (user.role === Role.VENDOR) redirectPath = "/vendor/dashboard";
    else if (user.role === Role.OEM) redirectPath = "/oem/dashboard";
    else if (user.role === Role.CONSULTANT)
      redirectPath = "/consultant/dashboard";
    else if (user.role === Role.ADMIN) redirectPath = "/admin/dashboard";

    return { success: true, redirect: redirectPath };
  } catch (error) {
    console.error("Verification Error:", error);
    return { error: "Verification failed" };
  }
}

export async function resendOTP(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = formData.get("email") as string;
  if (!email) return { error: "Email is required" };

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { error: "User not found" };
    if (user.isVerified) return { error: "Account already verified" };

    // Rate Limit Check based on OTP expiry
    // Assuming 10 min expiry, if expiry > Date.now() + 9 mins, means it was just sent (< 1 min ago)
    if (user.otpExpiry && user.otpExpiry.getTime() > Date.now() + 9 * 60 * 1000) {
      return { error: "Please wait before requesting a new OTP." };
    }

    const mobileOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await prisma.user.update({
      where: { id: user.id },
      data: {
        mobileOtp,
        emailOtp,
        otpExpiry,
      },
    });

    // Send SMS
    if (user.mobile) {
      await sendOTP_SMS(user.mobile, mobileOtp);
    }
    console.log(`[RESEND] [MOCK EMAIL] To: ${email}, OTP: ${emailOtp}`);

    await createAuditLog({
      userId: user.id,
      action: "RESEND_OTP",
      details: "User requested OTP resend",
    });

    return {
      success: true,
      error: "New codes have been sent to your email and mobile.",
    };
  } catch (error) {
    console.error("Resend OTP Error:", error);
    return { error: "Failed to resend OTP" };
  }
}

export async function login(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) return { error: "Missing credentials" };

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { error: "Invalid credentials" };

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) return { error: "Invalid credentials" };

    if (!user.isVerified) {
      // Gracefully resend OTPs and redirect to verification page
      const mobileOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      await prisma.user.update({
        where: { id: user.id },
        data: { mobileOtp, emailOtp, otpExpiry },
      });

      // Send OTPs
      await sendSignUpPage(mobileOtp, emailOtp, user.email);
      if (user.mobile) {
        await sendOTP_SMS(user.mobile, mobileOtp);
      }
      console.log(`[RESEND OTP on Login] To: ${user.email}, OTP: ${emailOtp}`);

      await createAuditLog({
        userId: user.id,
        action: "LOGIN_RESEND_OTP",
        details: "Unverified user attempted login — new OTPs sent automatically",
      });

      return {
        success: true,
        redirect: `/signup/verify?email=${encodeURIComponent(user.email)}`,
        error: "Your account is not yet verified. We've sent fresh verification codes to your email and mobile.",
      };
    }

    await createSession({ id: user.id, email: user.email, role: user.role });

    await createAuditLog({
      userId: user.id,
      action: "LOGIN",
      details: `User logged in with role ${user.role}`,
    });

    // Redirect based on role
    if (user.role === Role.VENDOR) redirect("/vendor/dashboard");
    if (user.role === Role.OEM) redirect("/oem/dashboard");
    if (user.role === Role.CONSULTANT) redirect("/consultant/dashboard");
    if (user.role === Role.ADMIN) redirect("/admin/dashboard");

    redirect("/"); // Fallback
  } catch (error) {
    if ((error as Error).message === "NEXT_REDIRECT") throw error;
    return { error: "Login failed" };
  }
}

export async function forgotPassword(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = formData.get("email") as string;
  if (!email) return { error: "Email is required" };

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Securely return success even if user doesn't exist to prevent enumeration
      return {
        success: true,
        redirect: "/login",
        error:
          "If an account exists with this email, you will receive a reset link shortly.",
      };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    // Mock sending email
    console.log(
      `[MOCK EMAIL] Password Reset Link: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`,
    );

    await sendForgotPasswordEmail(email, `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`);

    await createAuditLog({
      userId: user.id,
      action: "FORGOT_PASSWORD_REQUEST",
      details: "Password reset token generated and sent to email",
    });

    return {
      success: true,
      redirect: "/login",
      error:
        "If an account exists with this email, you will receive a reset link shortly.",
    };
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return { error: "Something went wrong. Please try again later." };
  }
}

export async function resetPassword(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token || !password) return { error: "Invalid request" };
  if (password !== confirmPassword) return { error: "Passwords do not match" };
  if (password.length < 6)
    return { error: "Password must be at least 6 characters" };

  try {
    const user = await prisma.user.findUnique({
      where: { resetToken: token },
    });

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return { error: "Invalid or expired reset token" };
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    await createAuditLog({
      userId: user.id,
      action: "PASSWORD_RESET_SUCCESS",
      details: "User successfully reset their password using token",
    });

    return { success: true, redirect: "/login" };
  } catch (error) {
    console.error("Reset Password Error:", error);
    return { error: "Failed to reset password. Please try again." };
  }
}

export async function logoutAction() {
  const session = await getSession();
  if (session) {
    await createAuditLog({
      userId: session.id as string,
      action: "LOGOUT",
      details: `User ${session.email} logged out successfully`,
    });
  }
  await logoutSession();
  redirect("/login");
}
