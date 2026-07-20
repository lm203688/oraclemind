import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/db';

const authOptions = {
  providers: [
    CredentialsProvider({
      id: 'guest',
      name: 'Guest',
      credentials: {
        guestId: { label: 'Guest ID', type: 'text', placeholder: 'auto-generated' },
      },
      async authorize(credentials) {
        const id = credentials?.guestId || crypto.randomUUID();

        try {
          const user = await db.user.upsert({
            where: { id },
            update: {},
            create: { id, name: `User_${id.slice(0, 6)}` },
          });

          return {
            id: user.id,
            name: user.name ?? undefined,
            email: user.email ?? undefined,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: undefined,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'oraclemind-dev-secret-change-in-production',
};

export default NextAuth(authOptions);