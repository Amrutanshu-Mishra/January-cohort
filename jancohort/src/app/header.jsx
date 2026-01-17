"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
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
            <div className="flex items-center">
              <h1 className="text-5xl font-bold text-white">
                ResumeAI
              </h1>
            </div>

            {/* Desktop Menu */}
            <Menubar className="border-0 shadow-none bg-transparent gap-2">
              <MenubarMenu>
                <MenubarTrigger className="text-white hover:text-slate-200 hover:bg-white/10 text-lg font-medium">
                  Analyze
                </MenubarTrigger>
                <MenubarContent className="bg-white border-slate-200">
                  <MenubarItem className="text-slate-700 hover:text-slate-900">Upload Resume</MenubarItem>
                  <MenubarItem className="text-slate-700 hover:text-slate-900">View Reports</MenubarItem>
                  <MenubarItem className="text-slate-700 hover:text-slate-900">Recommendations</MenubarItem>
                </MenubarContent>
              </MenubarMenu>

              <MenubarMenu>
                <MenubarTrigger className="text-white hover:text-slate-200 hover:bg-white/10 text-lg font-medium">
                  Features
                </MenubarTrigger>
                <MenubarContent className="bg-white border-slate-200">
                  <MenubarItem className="text-slate-700 hover:text-slate-900">ATS Optimization</MenubarItem>
                  <MenubarItem className="text-slate-700 hover:text-slate-900">Keyword Matching</MenubarItem>
                  <MenubarItem className="text-slate-700 hover:text-slate-900">Score Analysis</MenubarItem>
                </MenubarContent>
              </MenubarMenu>

              <MenubarMenu>
                <MenubarTrigger className="text-white hover:text-slate-200 hover:bg-white/10 text-lg font-medium">
                  Resources
                </MenubarTrigger>
                <MenubarContent className="bg-white border-slate-200">
                  <MenubarItem className="text-slate-700 hover:text-slate-900">Blog</MenubarItem>
                  <MenubarItem className="text-slate-700 hover:text-slate-900">FAQ</MenubarItem>
                  <MenubarItem className="text-slate-700 hover:text-slate-900">Tips & Tricks</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <h1 className="text-3xl font-bold text-white">
              ResumeAI
            </h1>

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
        className="w-full px-4 py-2 text-left font-medium text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex justify-between items-center"
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
              className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
