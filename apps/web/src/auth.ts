import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";
// import { prisma } from "@/lib/prisma";
// import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // ── Validate input shape ──────────────────────────────────────────
        const parsed = z
          .object({ email: z.string().email(), password: z.string().min(8) })
          .safeParse(credentials);

        if (!parsed.success) return null;

        // ── Demo credentials (remove once DB is connected) ─────────────
        const DEMO_USERS = [
          { id: "demo-student", email: "student@cway.dev", password: "student123!", role: "STUDENT", name: "Demo Student" },
          { id: "demo-instructor", email: "instructor@cway.dev", password: "instructor123!", role: "INSTRUCTOR", name: "Demo Instructor" },
          { id: "demo-admin", email: "admin@cway.dev", password: "admin123!", role: "ADMIN", name: "Admin User" },
        ];

        const demo = DEMO_USERS.find(
          (u) => u.email === parsed.data.email && u.password === parsed.data.password
        );
        if (demo) return { id: demo.id, email: demo.email, name: demo.name, role: demo.role };

        // ── Production DB auth (uncomment when DB is connected) ────────
        // const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
        // if (!user?.hashedPassword) return null;
        // const valid = await bcrypt.compare(parsed.data.password, user.hashedPassword);
        // if (!valid) return null;
        // return { id: user.id, email: user.email, name: user.name, role: user.role };

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "STUDENT";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
});
