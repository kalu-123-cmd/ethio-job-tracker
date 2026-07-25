"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client/core";
import { useState, useEffect } from "react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Building2, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

const GET_JOBS = gql`
  query GetJobs {
    jobs {
      id
      title
      status
      company { name }
    }
  }
`;

const UPDATE_STATUS = gql`
  mutation UpdateJobStatus($jobId: ID!, $status: String!) {
    updateJobStatus(jobId: $jobId, status: $status) {
      id
      status
    }
  }
`;

const COLUMNS = ["Wishlist", "Applied", "Interview", "Offer", "Rejected"];

function JobCard({ job }: { job: any }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: job.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="backdrop-blur-xl bg-zinc-900/60 border border-zinc-700/50 p-3 rounded-lg shadow-lg cursor-grab active:cursor-grabbing hover:border-zinc-600/50 transition mb-2">
      <p className="font-semibold text-white text-sm">{job.title}</p>
      <p className="text-xs text-zinc-400 mt-1">{job.company.name}</p>
    </div>
  );
}

export default function KanbanPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const { data, loading, refetch } = useQuery(GET_JOBS);
  const [updateStatus] = useMutation(UPDATE_STATUS);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100">Loading...</div>;
  }

  const jobs = data?.jobs || [];

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const newStatus = over.id as string;
      const jobId = active.id as string;
      
      await updateStatus({ variables: { jobId, status: newStatus } });
      refetch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-zinc-900 to-zinc-950 pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <nav className="relative backdrop-blur-xl bg-zinc-900/70 border-b border-zinc-700/50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-white" />
              <span className="text-xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">Ethio Job Tracker</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition">Back to Dashboard</Link>
              <span className="text-zinc-300">Welcome, <strong>{user.name}</strong></span>
              <button onClick={() => logout()} className="backdrop-blur-md bg-red-950/50 border border-red-800/50 flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-400 rounded-lg hover:bg-red-900/50 transition shadow-lg">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent mb-6">Kanban Board</h1>
        {loading ? (
          <p className="text-zinc-400">Loading board...</p>
        ) : (
          <DndContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {COLUMNS.map((status) => {
                const columnJobs = jobs.filter((j: any) => j.status === status);
                return (
                  <div key={status} className="backdrop-blur-xl bg-zinc-900/40 border border-zinc-700/50 rounded-xl p-3 min-h-[200px] shadow-2xl">
                    <h3 className="font-semibold text-white mb-3 flex justify-between items-center">
                      {status} <span className="backdrop-blur-md bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 text-xs px-2 py-1 rounded-full shadow-lg">{columnJobs.length}</span>
                    </h3>
                    <SortableContext items={columnJobs.map((j: any) => j.id)} strategy={verticalListSortingStrategy}>
                      {columnJobs.map((job: any) => (
                        <JobCard key={job.id} job={job} />
                      ))}
                    </SortableContext>
                  </div>
                );
              })}
            </div>
          </DndContext>
        )}
      </main>
    </div>
  );
}