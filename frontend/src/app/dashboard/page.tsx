"use client";

import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client/core";
import { Briefcase, CheckCircle, Clock, XCircle, Building2, LogOut, TrendingUp, Target, Search, Filter, Download } from "lucide-react";
import AddJobForm from "../../components/AddJobForm";
import ThemeToggle from "../../components/ThemeToggle";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Toaster, toast } from "sonner";
import Link from "next/link";

const GET_JOBS = gql`
  query GetJobs {
    jobs {
      id
      title
      status
      location
      dateApplied
      company { name }
    }
  }
`;

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const { data, loading: jobsLoading, refetch } = useQuery(GET_JOBS);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-gray-50 text-gray-900'}`}>Loading...</div>;
  }

  const jobs = data?.jobs || [];
  const filteredJobs = jobs.filter((job: any) => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.company.name.toLowerCase().includes(searchTerm.toLowerCase()) || job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j: any) => j.status !== "Rejected" && j.status !== "Offer").length;
  const successRate = totalJobs > 0 ? Math.round((jobs.filter((j: any) => j.status === "Offer").length / totalJobs) * 100) : 0;

  const stats = [
    { label: "Applied", value: jobs.filter((j: any) => j.status === "Applied").length, icon: Briefcase },
    { label: "Interview", value: jobs.filter((j: any) => j.status === "Interview").length, icon: Clock },
    { label: "Offer", value: jobs.filter((j: any) => j.status === "Offer").length, icon: CheckCircle },
    { label: "Rejected", value: jobs.filter((j: any) => j.status === "Rejected").length, icon: XCircle },
  ];

  const pieData = [
    { name: 'Applied', value: jobs.filter((j: any) => j.status === "Applied").length, color: isDark ? '#3b82f6' : '#2563eb' },
    { name: 'Interview', value: jobs.filter((j: any) => j.status === "Interview").length, color: isDark ? '#f59e0b' : '#d97706' },
    { name: 'Offer', value: jobs.filter((j: any) => j.status === "Offer").length, color: isDark ? '#10b981' : '#059669' },
    { name: 'Rejected', value: jobs.filter((j: any) => j.status === "Rejected").length, color: isDark ? '#ef4444' : '#dc2626' },
    { name: 'Wishlist', value: jobs.filter((j: any) => j.status === "Wishlist").length, color: isDark ? '#a855f7' : '#7c3aed' },
  ].filter(item => item.value > 0);

  const companyData = jobs.reduce((acc: any, job: any) => {
    if (!acc[job.company.name]) acc[job.company.name] = { name: job.company.name, count: 0 };
    acc[job.company.name].count++;
    return acc;
  }, {});
  const barData = Object.values(companyData).slice(0, 5);

  const exportToCSV = () => {
    if (jobs.length === 0) { toast.error("No jobs to export yet!"); return; }
    const headers = ["Job Title", "Company", "Location", "Status", "Date Applied"];
    const rows = jobs.map((job: any) => [`"${job.title}"`, `"${job.company.name}"`, `"${job.location}"`, `"${job.status}"`, job.dateApplied ? new Date(job.dateApplied).toLocaleDateString() : "N/A"]);
    const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Ethio_Job_Tracker_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV exported successfully!");
  };

  // Theme-aware classes
  const bg = isDark ? 'bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100';
  const text = isDark ? 'text-zinc-100' : 'text-gray-900';
  const textMuted = isDark ? 'text-zinc-400' : 'text-gray-500';
  const cardBg = isDark ? 'backdrop-blur-xl bg-zinc-900/60 border-zinc-700/50' : 'backdrop-blur-xl bg-white/80 border-gray-200';
  const navBg = isDark ? 'backdrop-blur-xl bg-zinc-900/70 border-zinc-700/50' : 'backdrop-blur-xl bg-white/80 border-gray-200';
  const inputBg = isDark ? 'backdrop-blur-md bg-zinc-950/50 border-zinc-700/50 text-white placeholder-zinc-500' : 'backdrop-blur-md bg-white border-gray-300 text-gray-900 placeholder-gray-400';
  const bannerBg = isDark ? 'backdrop-blur-xl bg-gradient-to-br from-zinc-800/60 via-zinc-900/60 to-zinc-800/60 border-zinc-700/50' : 'backdrop-blur-xl bg-gradient-to-br from-white/90 via-gray-50/90 to-white/90 border-gray-200';

  return (
    <div className={`min-h-screen ${bg} ${text} relative overflow-hidden`}>
      {/* Background Effects */}
      {isDark && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-zinc-900 to-zinc-950 pointer-events-none"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
        </>
      )}
      {!isDark && (
        <>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl pointer-events-none"></div>
        </>
      )}
      
      <Toaster theme={isDark ? "dark" : "light"} position="top-right" richColors />
      
      {/* Navigation */}
      <nav className={`relative ${navBg} border-b shadow-2xl`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl shadow-lg border ${isDark ? 'bg-gradient-to-br from-zinc-100/90 to-zinc-200/90 border-zinc-300/30' : 'bg-gradient-to-br from-zinc-800 to-zinc-900 border-zinc-700'}`}>
                <Building2 className={`h-8 w-8 ${isDark ? 'text-zinc-900' : 'text-white'}`} />
              </div>
              <div>
                <span className={`text-2xl font-bold ${isDark ? 'bg-gradient-to-r from-white to-zinc-300' : 'bg-gradient-to-r from-zinc-900 to-zinc-700'} bg-clip-text text-transparent`}>Ethio Job Tracker</span>
                <p className={`text-xs ${textMuted}`}>Track your career journey</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link href="/calendar" className={`backdrop-blur-md px-4 py-2 rounded-lg text-sm font-semibold transition shadow-lg border ${isDark ? 'bg-zinc-800/50 border-zinc-700/50 text-zinc-100 hover:bg-zinc-700/50' : 'bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-100'}`}>📅 Calendar</Link>
              <Link href="/kanban" className={`backdrop-blur-md px-4 py-2 rounded-lg text-sm font-semibold transition shadow-lg border ${isDark ? 'bg-zinc-800/50 border-zinc-700/50 text-zinc-100 hover:bg-zinc-700/50' : 'bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-100'}`}>📊 Kanban</Link>
              <div className={`backdrop-blur-md flex items-center gap-3 px-4 py-2 rounded-lg shadow-lg border ${isDark ? 'bg-zinc-800/50 border-zinc-700/50' : 'bg-white/80 border-gray-200'}`}>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
                  <p className={`text-xs ${textMuted}`}>{user.email}</p>
                </div>
              </div>
              <button onClick={() => logout()} className={`backdrop-blur-md flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition shadow-lg border ${isDark ? 'bg-red-950/50 border-red-800/50 text-red-400 hover:bg-red-900/50' : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'}`}>
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner */}
        <div className={`mb-8 ${bannerBg} border rounded-2xl p-8 shadow-2xl relative overflow-hidden`}>
          {!isDark && <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-pink-50/50 pointer-events-none"></div>}
          {isDark && <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 pointer-events-none"></div>}
          <div className="relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'bg-gradient-to-r from-white via-zinc-200 to-zinc-400' : 'bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-600'} bg-clip-text text-transparent`}>Welcome back, {user.name.split(' ')[0]}! 👋</h1>
                <p className={`${textMuted} text-lg`}>Your job search journey in Ethiopia</p>
              </div>
              <div className="flex gap-3">
                <button onClick={exportToCSV} className={`backdrop-blur-md rounded-lg text-sm font-bold shadow-xl transition flex items-center gap-2 px-6 py-3 border ${isDark ? 'bg-gradient-to-r from-zinc-100 to-zinc-200 text-zinc-900 hover:from-white hover:to-zinc-100 border-zinc-300/50' : 'bg-gradient-to-r from-zinc-800 to-zinc-900 text-white hover:from-zinc-900 hover:to-black border-zinc-700'}`}>
                  <Download className="h-5 w-5" /> Export CSV
                </button>
                <AddJobForm onJobAdded={() => { refetch(); toast.success("Job added successfully!"); }} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {[
                { label: "Total Applications", value: totalJobs },
                { label: "Active Applications", value: activeJobs },
                { label: "Success Rate", value: `${successRate}%`, highlight: true },
              ].map((item) => (
                <div key={item.label} className={`backdrop-blur-md rounded-xl p-4 shadow-lg border ${isDark ? 'bg-zinc-950/50 border-zinc-700/50' : 'bg-white/60 border-gray-200'}`}>
                  <p className={`${textMuted} text-sm`}>{item.label}</p>
                  <p className={`text-3xl font-bold ${item.highlight ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : (isDark ? 'text-white' : 'text-gray-900')}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className={`backdrop-blur-xl border rounded-xl shadow-2xl hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-300 p-6 relative overflow-hidden group ${isDark ? 'bg-zinc-900/60 border-zinc-700/50' : 'bg-white/80 border-gray-200'}`}>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl shadow-lg ${isDark ? 'bg-zinc-800 border border-zinc-700' : 'bg-gray-100 border border-gray-200'}`}>
                    <stat.icon className={`h-6 w-6 ${isDark ? 'text-zinc-300' : 'text-gray-600'}`} />
                  </div>
                  <TrendingUp className={`h-5 w-5 ${isDark ? 'text-zinc-600' : 'text-gray-300'}`} />
                </div>
                <div>
                  <p className={`text-sm font-medium ${textMuted} mb-1`}>{stat.label}</p>
                  <p className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className={`backdrop-blur-xl border rounded-xl shadow-2xl p-6 ${cardBg}`}>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 flex items-center gap-2`}><Target className={`h-5 w-5 ${textMuted}`} /> Status Distribution</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} dataKey="value">
                    {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: isDark ? 'rgba(24, 24, 27, 0.9)' : 'rgba(255,255,255,0.95)', borderColor: isDark ? 'rgba(39, 39, 42, 0.5)' : 'rgba(229,231,235,0.8)', color: isDark ? '#f4f4f5' : '#111827' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className={`h-[300px] flex items-center justify-center ${textMuted}`}>Add jobs to see the chart</div>}
          </div>

          <div className={`backdrop-blur-xl border rounded-xl shadow-2xl p-6 ${cardBg}`}>
            <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4 flex items-center gap-2`}><Building2 className={`h-5 w-5 ${textMuted}`} /> Top Companies</h3>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(39, 39, 42, 0.5)' : 'rgba(229,231,235,0.8)'} />
                  <XAxis dataKey="name" stroke={isDark ? '#a1a1aa' : '#6b7280'} />
                  <YAxis stroke={isDark ? '#a1a1aa' : '#6b7280'} />
                  <Tooltip contentStyle={{ backgroundColor: isDark ? 'rgba(24, 24, 27, 0.9)' : 'rgba(255,255,255,0.95)', borderColor: isDark ? 'rgba(39, 39, 42, 0.5)' : 'rgba(229,231,235,0.8)', color: isDark ? '#f4f4f5' : '#111827' }} />
                  <Bar dataKey="count" fill={isDark ? '#f4f4f5' : '#374151'} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className={`h-[300px] flex items-center justify-center ${textMuted}`}>Add jobs to see the chart</div>}
          </div>
        </div>

        {/* Search */}
        <div className={`backdrop-blur-xl border rounded-xl shadow-2xl p-6 mb-6 ${cardBg}`}>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${isDark ? 'text-zinc-500' : 'text-gray-400'}`} />
              <input type="text" placeholder="Search by job title, company, or location..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full pl-10 pr-4 py-3 ${inputBg} rounded-lg focus:ring-2 focus:ring-blue-500 transition shadow-lg`} />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} className={`w-full md:w-auto backdrop-blur-md px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 shadow-lg border ${showFilters ? (isDark ? 'bg-zinc-100 text-zinc-900 border-zinc-300/50' : 'bg-zinc-900 text-white border-zinc-700') : (isDark ? 'bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50 border-zinc-700/50' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200')}`}>
              <Filter className="h-5 w-5" /> Filters
            </button>
          </div>
          {showFilters && (
            <div className={`mt-4 pt-4 border-t ${isDark ? 'border-zinc-700/50' : 'border-gray-200'}`}>
              <label className={`block text-sm font-semibold ${isDark ? 'text-zinc-300' : 'text-gray-700'} mb-2`}>Filter by Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`w-full md:w-64 px-4 py-3 ${inputBg} rounded-lg focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-lg`}>
                <option value="all">All Statuses</option>
                <option value="Wishlist">📋 Wishlist</option>
                <option value="Applied">📤 Applied</option>
                <option value="Interview">💼 Interview</option>
                <option value="Offer">✅ Offer</option>
                <option value="Rejected">❌ Rejected</option>
              </select>
            </div>
          )}
        </div>

        {/* Applications List */}
        <div className={`backdrop-blur-xl border rounded-xl shadow-2xl ${cardBg}`}>
          <div className={`px-6 py-4 border-b ${isDark ? 'border-zinc-700/50' : 'border-gray-200'} flex justify-between items-center`}>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{searchTerm || statusFilter !== "all" ? "Filtered Results" : "Recent Applications"}</h2>
            <span className={`backdrop-blur-md text-sm font-semibold px-3 py-1 rounded-full shadow-lg border ${isDark ? 'bg-zinc-800/50 border-zinc-700/50 text-zinc-300' : 'bg-gray-100 border-gray-200 text-gray-600'}`}>{filteredJobs.length} of {jobs.length}</span>
          </div>
          {jobsLoading ? (
            <div className="p-12 text-center"><div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto ${isDark ? 'border-zinc-100' : 'border-zinc-900'}`}></div><p className={`${textMuted} mt-4`}>Loading your jobs...</p></div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-12 text-center"><Search className={`h-16 w-16 mx-auto mb-4 ${isDark ? 'text-zinc-600' : 'text-gray-300'}`} /><p className={`${textMuted} text-lg`}>No jobs found</p></div>
          ) : (
            <ul className={`divide-y ${isDark ? 'divide-zinc-700/50' : 'divide-gray-100'}`}>
              {filteredJobs.slice(0, 20).map((job: any) => (
                <li key={job.id} className={`px-6 py-4 flex justify-between items-center transition ${isDark ? 'hover:bg-zinc-800/30' : 'hover:bg-gray-50'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg border ${isDark ? 'bg-zinc-800/80 border-zinc-700/50 text-zinc-100' : 'bg-gray-100 border-gray-200 text-gray-700'}`}>
                      {job.company.name.charAt(0)}
                    </div>
                    <div>
                      <p className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{job.title}</p>
                      <p className={`text-sm ${textMuted}`}>{job.company.name} • {job.location}</p>
                    </div>
                  </div>
                  <span className={`backdrop-blur-md px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full border shadow-lg
                    ${job.status === 'Offer' ? (isDark ? 'bg-emerald-900/30 text-emerald-400 border-emerald-700/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200') : 
                      job.status === 'Interview' ? (isDark ? 'bg-amber-900/30 text-amber-400 border-amber-700/50' : 'bg-amber-50 text-amber-700 border-amber-200') : 
                      job.status === 'Rejected' ? (isDark ? 'bg-red-900/30 text-red-400 border-red-700/50' : 'bg-red-50 text-red-700 border-red-200') : 
                      (isDark ? 'bg-zinc-800/50 text-zinc-300 border-zinc-700/50' : 'bg-gray-100 text-gray-600 border-gray-200')}`}>
                    {job.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}