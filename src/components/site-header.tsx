"use client";

import Link from "next/link";
import Image from "next/image";
import { UserProfile } from "@/components/auth/user-profile";
import { ModeToggle } from "./ui/mode-toggle";
import { Button } from "./ui/button";
import { useSession } from "@/lib/auth-client";

export function SiteHeader() {
  const { data: session } = useSession();

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:border focus:rounded-md"
      >
        Skip to main content
      </a>
      <header className="border-b" role="banner">
        <nav
          className="container mx-auto px-4 py-4 flex justify-between items-center"
          aria-label="Main navigation"
        >
          <h1 className="text-2xl font-bold">
            <Link
              href="/"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              aria-label="Bermy Banana - Go to homepage"
            >
              <Image
                src="/logo.png"
                alt="Bermy Banana Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                Bermy Banana
              </span>
            </Link>
          </h1>
          <div className="flex items-center gap-2 md:gap-3" role="group" aria-label="User actions">
            {session && (
              <>
                {/* Desktop only: Mode buttons */}
                <Button asChild variant="ghost" size="sm" className="hidden lg:flex bg-blue-500/10 hover:bg-blue-500/20 text-blue-500">
                  <Link href="/mode-a">Mode A</Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="hidden lg:flex bg-pink-500/10 hover:bg-pink-500/20 text-pink-500">
                  <Link href="/mode-b">Mode B</Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="hidden lg:flex bg-green-500/10 hover:bg-green-500/20 text-green-500">
                  <Link href="/mode-c">Mode C</Link>
                </Button>
                <Button asChild variant="ghost" size="sm" className="hidden lg:flex bg-purple-500/10 hover:bg-purple-500/20 text-purple-500">
                  <Link href="/dashboard">Gallery</Link>
                </Button>
                {/* Desktop: Upgrade button */}
                <Button asChild size="sm" className="hidden md:flex bg-yellow-500 hover:bg-yellow-600 text-black">
                  <Link href="/pricing">Upgrade</Link>
                </Button>
                {/* Mobile only: Upgrade button */}
                <Button asChild size="sm" className="md:hidden bg-yellow-500 hover:bg-yellow-600 text-black">
                  <Link href="/pricing">Upgrade</Link>
                </Button>
              </>
            )}
            <UserProfile />
            <ModeToggle />
          </div>
        </nav>
      </header>
    </>
  );
}