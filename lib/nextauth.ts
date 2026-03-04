import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT_SECRET, TOKEN_TTL_DAYS } from "@/env";
import { UserRepository } from "@/src/repositories/user.repository";
import { verifyPassword } from "@/lib/auth";

const userRepository = new UserRepository();

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET ?? JWT_SECRET,
  session: {
    strategy: "jwt",
    maxAge: TOKEN_TTL_DAYS * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await userRepository.findByEmail(credentials.email);
        if (!user || !user.isActive) {
          return null;
        }

        const passwordValid = await verifyPassword(credentials.password, user.password);
        if (!passwordValid) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};

