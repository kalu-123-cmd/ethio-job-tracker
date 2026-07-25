"use client";

import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client/core";
import { useState, useEffect } from "react";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Building2, LogOut, Calendar as CalendarIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

const GET_INTERVIEWS = gql`
  query GetInterviews {
    interviews {
      id
      date
      platform
      notes
      job {
        id
        title
        company { name }
      }
    }
  }
`;

const GET_JOBS = gql`
  query GetJobs {
    jobs {
      id
      title
      company { name }
    }
  }
`;

const CREATE_INTERVIEW = gql`
  mutation CreateInterview($jobId: ID!, $date: String!, $platform: String, $notes: String) {
    createInterview(jobId: $jobId, date: $date, platform: $platform, notes: $notes) {
      id
      date
    }
  }
`;

const UPDATE_INTERVIEW = gql`
  mutation UpdateInterview($id: ID!, $date: String, $platform: String, $notes: String) {
    updateInterview(id: $id, date: $date, platform: $platform, notes: $notes) {
      id
      date
    }
  }
`;

const DELETE_INTERVIEW = gql`
  mutation DeleteInterview($id: ID!) {
    deleteInterview(id: $id) {
      id
    }
  }
`;

export default function CalendarPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const { data: interviewData, loading, refetch } = useQuery(GET_INTERVIEWS);
  const { data: jobsData, loading: jobsLoading } = useQuery(GET_JOBS);
  const [createInterview] = useMutation(CREATE_INTERVIEW);
  const [updateInterview] = useMutation(UPDATE_INTERVIEW);
  const [deleteInterview] = useMutation(DELETE_INTERVIEW);

  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedInterview, setSelectedInterview] = useState<any>(null);
  const [formData, setFormData] = useState({
    jobId: "",
    platform: "",
    notes: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100">Loading...</div>;
  }

  const interviews = interviewData?.interviews || [];
  const jobs = jobsData?.jobs || [];

  const events = interviews.map((interview: any) => ({
    id: interview.id,
    title: `${interview.job.title} - ${interview.job.company.name}`,
    date: interview.date.split('T')[0],
    backgroundColor: interview.platform?.includes('Zoom') ? '#3b82f6' : 
                     interview.platform?.includes('Telegram') ? '#0088cc' : 
                     '#10b981',
  }));

  const handleDateClick = (info: any) => {
    setSelectedDate(info.dateStr);
    setSelectedInterview(null);
    setFormData({ jobId: "", platform: "", notes: "" });
    setShowModal(true);
  };

  const handleEventClick = (info: any) => {
    const interview = interviews.find((i: any) => i.id === info.event.id);
    if (interview) {
      setSelectedInterview(interview);
      setSelectedDate(interview.date.split('T')[0]);
      setFormData({
        jobId: interview.job.id,
        platform: interview.platform || "",
        notes: interview.notes || "",
      });
      setShowModal(true);
    }
  };

  const handleEventDrop = async (info: any) => {
    const newDate = info.event.startStr;
    await updateInterview({
      variables: { id: info.event.id, date: newDate },
    });
    refetch();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.jobId) {
      alert("Please select a job");
      return;
    }

    try {
      if (selectedInterview) {
        await updateInterview({
          variables: {
            id: selectedInterview.id,
            date: selectedDate,
            platform: formData.platform,
            notes: formData.notes,
          },
        });
        alert("✅ Interview updated!");
      } else {
        await createInterview({
          variables: {
            jobId: formData.jobId,
            date: selectedDate,
            platform: formData.platform,
            notes: formData.notes,
          },
        });
        alert("✅ Interview scheduled!");
      }
      
      setShowModal(false);
      refetch();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save interview");
    }
  };

  const handleDelete = async () => {
    if (!selectedInterview) return;
    
    if (confirm("Are you sure you want to delete this interview?")) {
      await deleteInterview({ variables: { id: selectedInterview.id } });
      setShowModal(false);
      refetch();
      alert("✅ Interview deleted");
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent flex items-center gap-2">
            <CalendarIcon className="h-8 w-8 text-zinc-400" />
            Interview Calendar
          </h1>
          <p className="text-zinc-400 mt-1">Click on any date to schedule an interview. Drag events to reschedule.</p>
        </div>

        <div className="backdrop-blur-xl bg-zinc-900/60 border border-zinc-700/50 rounded-xl shadow-2xl p-6">
          {loading ? (
            <p className="text-zinc-400 text-center py-12">Loading calendar...</p>
          ) : (
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek'
              }}
              events={events}
              dateClick={handleDateClick}
              eventClick={handleEventClick}
              eventDrop={handleEventDrop}
              editable={true}
              selectable={true}
              height="auto"
            />
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-xl bg-zinc-900/90 border border-zinc-700/50 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="border-b border-zinc-700/50 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                {selectedInterview ? "Edit Interview" : "Schedule Interview"}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-white text-3xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Date</label>
                <input
                  type="date"
                  value={selectedDate.split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 backdrop-blur-md bg-zinc-950/50 border border-zinc-700/50 rounded-lg text-white shadow-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Job</label>
                {jobsLoading ? (
                  <div className="w-full px-4 py-3 backdrop-blur-md bg-zinc-950/50 border border-zinc-700/50 rounded-lg text-zinc-500 shadow-lg">
                    Loading jobs...
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="w-full px-4 py-3 backdrop-blur-md bg-red-950/50 border border-red-800/50 rounded-lg text-red-400 shadow-lg">
                    No jobs found. Please add a job first from the Dashboard.
                  </div>
                ) : (
                  <select
                    value={formData.jobId}
                    onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                    className="w-full px-4 py-3 backdrop-blur-md bg-zinc-950/50 border border-zinc-700/50 rounded-lg text-white shadow-lg cursor-pointer"
                    required
                  >
                    <option value="" className="text-zinc-900">-- Select a job --</option>
                    {jobs.map((job: any) => (
                      <option key={job.id} value={job.id} className="text-zinc-900">
                        {job.title} - {job.company.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Platform</label>
                <input
                  type="text"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  placeholder="e.g., Zoom, Telegram, In-person"
                  className="w-full px-4 py-3 backdrop-blur-md bg-zinc-950/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 shadow-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Interview details, preparation notes..."
                  rows={3}
                  className="w-full px-4 py-3 backdrop-blur-md bg-zinc-950/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 resize-none shadow-lg"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-zinc-700/50">
                {selectedInterview && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="backdrop-blur-md bg-red-950/50 border border-red-800/50 text-red-400 rounded-lg hover:bg-red-900/50 font-semibold px-4 py-3 shadow-lg"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 backdrop-blur-md bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-500 hover:to-emerald-600 font-semibold px-6 py-3 border border-emerald-500/50 shadow-xl"
                >
                  {selectedInterview ? "Update" : "Schedule"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="backdrop-blur-md bg-zinc-800/50 text-zinc-300 rounded-lg hover:bg-zinc-700/50 font-semibold px-6 py-3 border border-zinc-700/50 shadow-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}