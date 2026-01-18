"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, User as UserIcon } from "lucide-react"
import { UserButton, useUser, SignInButton } from "@clerk/nextjs"
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
} from "@/components/ui/menubar"

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isSignedIn, isLoaded, user } = useUser()

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-black/50 backdrop-blur-md border-b border-white/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Navigation */}
        <div className="hidden md:block py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-white hover:opacity-90 transition-opacity">
                SKILL-Sync
              </h1>
            </Link>

            {/* Desktop Menu */}
            <Menubar className="border-0 shadow-none bg-transparent gap-2">
              <MenubarMenu>
                <MenubarTrigger className="text-white hover:text-slate-200 hover:bg-white/10 text-lg font-medium cursor-pointer">
                  Analyze
                </MenubarTrigger>
                <MenubarContent className="bg-white border-slate-200">
                  <MenubarItem className="text-slate-700 hover:text-slate-900 cursor-pointer">Upload Resume</MenubarItem>
                  <MenubarItem className="text-slate-700 hover:text-slate-900 cursor-pointer">View Reports</MenubarItem>
                  <MenubarItem className="text-slate-700 hover:text-slate-900 cursor-pointer">Recommendations</MenubarItem>
                </MenubarContent>
              </MenubarMenu>

              <MenubarMenu>
                <MenubarTrigger className="text-white hover:text-slate-200 hover:bg-white/10 text-lg font-medium cursor-pointer">
                  Features
                </MenubarTrigger>
                <MenubarContent className="bg-white border-slate-200">
                  <MenubarItem className="text-slate-700 hover:text-slate-900 cursor-pointer">ATS Optimization</MenubarItem>
                  <MenubarItem className="text-slate-700 hover:text-slate-900 cursor-pointer">Keyword Matching</MenubarItem>
                  <MenubarItem className="text-slate-700 hover:text-slate-900 cursor-pointer">Score Analysis</MenubarItem>
                </MenubarContent>
              </MenubarMenu>

              {!isSignedIn && (
                <Link href="/register">
                  <span className="text-white hover:text-slate-200 hover:bg-white/10 px-3 py-1.5 rounded-md text-lg font-medium cursor-pointer transition-colors">
                    For Recruiters
                  </span>
                </Link>
              )}
            </Menubar>

            {/* Auth Buttons */}
            <div className="flex items-center gap-4">
              {isLoaded && (
                isSignedIn ? (
                  <div className="flex items-center gap-4">
                    <Link
                      href={user?.publicMetadata?.role === 'company' ? '/recruiter-dashboard' : '/dashboard'}
                      className="text-white hover:text-blue-400 font-medium transition-colors"
                    >
                      Dashboard
                    </Link>
                    <UserButton afterSignOutUrl="/" />
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <SignInButton mode="modal">
                      <button className="text-white hover:text-slate-200 font-medium px-4 py-2 transition-colors">
                        Sign In
                      </button>
                    </SignInButton>
                    <Link
                      href="/register"
                      className="bg-white text-black hover:bg-slate-200 px-4 py-2 rounded-full font-bold transition-colors"
                    >
                      Get Started
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/">
              <h1 className="text-2xl font-bold text-white">
                SKILL-Sync
              </h1>
            </Link>

            {/* Hamburger Menu */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X size={24} className="text-white" />
              ) : (
                <Menu size={24} className="text-white" />
              )}
            </button>
          </div>

          {/* Mobile Menu Items */}
          {mobileMenuOpen && (
            <nav className="mt-4 space-y-2 pb-4">
              <MobileMenuItem label="Analyze" />
              <MobileMenuItem label="Features" />
              <MobileMenuItem label="Resources" />
            </nav>
          )}
        </div>
      </div>
    </header>
  )
}

function MobileMenuItem({ label }) {
  const [expanded, setExpanded] = useState(false)

  const menuItems = {
    Analyze: ["Upload Resume", "View Reports", "Recommendations"],
    Features: ["ATS Optimization", "Keyword Matching", "Score Analysis"],
    Resources: ["Blog", "FAQ", "Tips & Tricks"],
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2 text-left font-medium text-white hover:bg-white/10 rounded-lg transition-colors flex justify-between items-center"
      >
        {label}
        <span className={`transition-transform ${expanded ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>
      {expanded && (
        <div className="ml-4 mt-2 space-y-1">
          {menuItems[label].map((item) => (
            <button
              key={item}
              className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
