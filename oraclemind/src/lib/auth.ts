import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const authOptions = {
  providers: [
    CredentialsProvider({
      id: 'guest',
      name: 'Guest',
      credentials: {
        guestId: { label: 'Guest ID', type: 'text', placeholder: 'auto-generated' },
      },
      async authorize(credentials) {
        // 不依赖数据库——直接返回guest用户
        const id = credentials?.guestId || `guest_${Date.now()}`;
        return {
          id: id,
          name: `Guest_${id.slice(-6)}`,
        };
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
export { authOptions };
