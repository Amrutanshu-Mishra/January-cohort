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
    <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm dark:bg-slate-950 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Navigation */}
        <div className="hidden md:block py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Logo
              </h1>
            </div>

            {/* Desktop Menu */}
            <Menubar className="border-0 shadow-none bg-transparent gap-2">
              <MenubarMenu>
                <MenubarTrigger className="hover:bg-slate-100 dark:hover:bg-slate-800">
                  Products
                </MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>Product 1</MenubarItem>
                  <MenubarItem>Product 2</MenubarItem>
                  <MenubarItem>Product 3</MenubarItem>
                </MenubarContent>
              </MenubarMenu>

              <MenubarMenu>
                <MenubarTrigger className="hover:bg-slate-100 dark:hover:bg-slate-800">
                  Services
                </MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>Consulting</MenubarItem>
                  <MenubarItem>Development</MenubarItem>
                  <MenubarItem>Support</MenubarItem>
                </MenubarContent>
              </MenubarMenu>

              <MenubarMenu>
                <MenubarTrigger className="hover:bg-slate-100 dark:hover:bg-slate-800">
                  Resources
                </MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>Documentation</MenubarItem>
                  <MenubarItem>Blog</MenubarItem>
                  <MenubarItem>FAQ</MenubarItem>
                </MenubarContent>
              </MenubarMenu>

              <MenubarMenu>
                <MenubarTrigger className="hover:bg-slate-100 dark:hover:bg-slate-800">
                  Contact
                </MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>Email</MenubarItem>
                  <MenubarItem>Phone</MenubarItem>
                  <MenubarItem>Address</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>

            {/* CTA Button */}
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Get Started
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Logo
            </h1>

            {/* Hamburger Menu */}
            <button
              onClick={toggleMobileMenu}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X size={24} className="text-slate-900 dark:text-white" />
              ) : (
                <Menu size={24} className="text-slate-900 dark:text-white" />
              )}
            </button>
          </div>

          {/* Mobile Menu Items */}
          {mobileMenuOpen && (
            <nav className="mt-4 space-y-2 pb-4">
              <MobileMenuItem label="Products" />
              <MobileMenuItem label="Services" />
              <MobileMenuItem label="Resources" />
              <MobileMenuItem label="Contact" />
              <button className="w-full px-4 py-2 mt-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Get Started
              </button>
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
    Products: ["Product 1", "Product 2", "Product 3"],
    Services: ["Consulting", "Development", "Support"],
    Resources: ["Documentation", "Blog", "FAQ"],
    Contact: ["Email", "Phone", "Address"],
  }

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2 text-left font-medium text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex justify-between items-center"
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
              className="w-full px-4 py-2 text-left text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
