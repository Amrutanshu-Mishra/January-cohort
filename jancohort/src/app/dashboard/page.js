"use client";
import { motion } from "framer-motion";
import { useUser, UserButton } from "@clerk/nextjs";

// Inside your sidebar or header
export default function Dashboard() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <UserButton afterSignOutUrl="/" />
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col hidden md:flex">
        <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-10">
          PRO-GUIDE
        </h1>
        <nav className="space-y-4 flex-1">
          {['Feed', 'Analytics', 'My Resume', 'Settings'].map((item) => (
            <div key={item} className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer p-2 rounded-lg hover:bg-slate-100 transition-all">
              {item}
            </div>
          ))}
        </nav>
        <UserButton />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Welcome back, {user?.firstName || "User"}!</h2>
            <p className="text-slate-500">Here’s what’s happening in your domains.</p>
          </div>
        </header>

        {/* Feed Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-xl mb-4" />
              <div className="h-4 w-3/4 bg-slate-100 rounded mb-2" />
              <div className="h-4 w-1/2 bg-slate-100 rounded" />
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}