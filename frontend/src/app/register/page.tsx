"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import Link from "next/link";
import { Building2 } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError("");
    try {
      await registerUser(data.name, data.email, data.password);
    } catch (err: any) {
      setError(err.message || "Registration failed. Email might already be in use.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-zinc-900 to-zinc-950 pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="relative max-w-md w-full backdrop-blur-xl bg-zinc-900/60 border border-zinc-700/50 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 backdrop-blur-md bg-gradient-to-br from-zinc-100/90 to-zinc-200/90 rounded-xl shadow-lg border border-zinc-300/30 mb-4">
            <Building2 className="h-8 w-8 text-zinc-900" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">Create Account</h1>
          <p className="text-zinc-400 mt-2">Start tracking your job search today</p>
        </div>

        {error && (
          <div className="backdrop-blur-md bg-red-950/50 border border-red-800/50 text-red-400 p-3 rounded-lg mb-4 text-sm shadow-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2">Full Name</label>
            <input
              {...register("name")}
              type="text"
              className="w-full px-4 py-3 backdrop-blur-md bg-zinc-950/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 shadow-lg"
              placeholder="Kalkidan Nadew"
            />
            {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2">Email</label>
            <input
              {...register("email")}
              type="email"
              className="w-full px-4 py-3 backdrop-blur-md bg-zinc-950/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 shadow-lg"
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2">Password</label>
            <input
              {...register("password")}
              type="password"
              className="w-full px-4 py-3 backdrop-blur-md bg-zinc-950/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 shadow-lg"
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full backdrop-blur-md bg-gradient-to-r from-zinc-100 to-zinc-200 text-zinc-900 rounded-lg hover:from-white hover:to-zinc-100 text-sm font-bold shadow-xl transition flex items-center justify-center gap-2 border border-zinc-300/50 disabled:opacity-50"
          >
            {isLoading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent hover:from-blue-400 hover:to-blue-300">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}