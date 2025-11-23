import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import { compare } from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                captchaA: { label: "captchaA", type: "text" },
                captchaB: { label: "captchaB", type: "text" },
                captchaAnswer: { label: "captchaAnswer", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }

                // Basit toplama doğrulaması (bot caydırma amaçlı)
                const a = parseInt(credentials.captchaA as string, 10)
                const b = parseInt(credentials.captchaB as string, 10)
                const ans = parseInt(credentials.captchaAnswer as string, 10)
                if (!Number.isFinite(a) || !Number.isFinite(b) || ans !== a + b) {
                    return null
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                })

                if (!user) {
                    return null
                }

                const isPasswordValid = await compare(
                    credentials.password as string,
                    user.password
                )

                if (!isPasswordValid) {
                    return null
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                }
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.sub as string

                // Her oturumda DB'den güncel isim/e-posta çek
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.sub as string },
                    select: { name: true, email: true },
                })
                if (dbUser) {
                    session.user.name = dbUser.name || dbUser.email
                    session.user.email = dbUser.email
                }
            }
            return session
        },
    },
})
