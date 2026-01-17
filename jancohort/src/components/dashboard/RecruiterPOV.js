// components/dashboard/RecruiterPOV.js
import { UserButton } from "@clerk/nextjs";

export default function RecruiterPOV() {
  return (
    <div className="flex h-screen bg-slate-100">
      <aside className="w-64 bg-slate-900 text-white p-6">
        <h1 className="text-xl font-bold mb-8">Recruiter Hub</h1>
        <nav className="space-y-4">
          <div className="hover:bg-slate-800 p-2 rounded cursor-pointer">Post a Job</div>
          <div className="hover:bg-slate-800 p-2 rounded cursor-pointer">AWS Dynamo Logs</div>
          <div className="hover:bg-slate-800 p-2 rounded cursor-pointer">Candidate Matches</div>
        </nav>
        <div className="mt-auto pt-10">
          <UserButton afterSignOutUrl="/" />
        </div>
      </aside>

      <main className="flex-1 p-10">
        <header className="mb-8">
          <h2 className="text-3xl font-bold">Dashboard Overview</h2>
          <p className="text-slate-500">Real-time AWS processing logs for your company.</p>
        </header>

        {/* MOCK AWS LOGS AREA */}
        <div className="bg-black text-green-400 p-6 rounded-xl font-mono text-sm overflow-hidden shadow-2xl">
          <p>[AWS DynamoDB] - Log: New Job ID 8892 registered...</p>
          <p>[AWS Lambda] - Event: Triggering skill match for Job 8892...</p>
          <p className="animate-pulse">_</p>
        </div>
      </main>
    </div>
  );
}