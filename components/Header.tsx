"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"

export default function Header() {
    const { data: session } = useSession()
    const headerBadge = process.env.NEXT_PUBLIC_HEADER_BADGE || "Bilgisayar Kavramları Topluluğu"
    const headerTitle = process.env.NEXT_PUBLIC_HEADER_TITLE || "Etkinlik Takvimi"
    const headerSubtitle =
        process.env.NEXT_PUBLIC_HEADER_SUBTITLE || "Kampüs, çevrim içi ve atölye buluşmalarını tek ekranda takip edin."

    return (
        <header className="relative overflow-hidden border-b border-white/10 bg-gradient-to-r from-sky-700 via-slate-700 to-slate-900 text-slate-50 shadow-lg">
            <div className="absolute left-6 top-[-30px] h-24 w-24 rounded-full bg-sky-200/25 blur-2xl" />
            <div className="absolute right-3 bottom-[-40px] h-28 w-28 rounded-full bg-amber-200/18 blur-2xl" />
            <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="flex items-start gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-md shadow-sky-900/30">
                        <Calendar className="h-3.5 w-3.5 text-sky-100" />
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-sky-200/80">
                            {headerBadge}
                        </p>
                        <h1 className="text-lg font-semibold leading-tight text-white sm:text-xl">
                            {headerTitle}
                        </h1>
                        <p className="text-[12px] text-slate-200/80 sm:text-[13px]">
                            {headerSubtitle}
                        </p>
                    </div>
                </div>

                {session && (
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex flex-col text-right leading-tight text-[10px] text-slate-200 sm:text-[11px]">
                            <span className="text-white font-semibold text-[11px] sm:text-xs">Hoş geldin</span>
                            <span className="text-slate-200/80 truncate max-w-[160px] sm:max-w-[220px]">
                                {session.user?.name || session.user?.email}
                            </span>
                        </div>
                        <ThemeToggle />
                        <Button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            variant="secondary"
                            className="border border-white/20 bg-white/15 text-white hover:bg-white/25 px-3 py-[6px] text-[11px]"
                        >
                            Çıkış Yap
                        </Button>
                    </div>
                )}
                {!session && (
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                    </div>
                )}
            </div>
        </header>
    )
}
