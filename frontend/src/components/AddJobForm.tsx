"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client/core";
import { useState } from "react";

const GET_COMPANIES = gql`
  query GetCompanies {
    companies {
      id
      name
    }
  }
`;

const CREATE_COMPANY = gql`
  mutation CreateCompany($name: String!, $location: String, $industry: String, $website: String) {
    createCompany(name: $name, location: $location, industry: $industry, website: $website) {
      id
      name
    }
  }
`;

const CREATE_JOB = gql`
  mutation CreateJob($title: String!, $companyId: String!, $location: String!, $status: String) {
    createJob(title: $title, companyId: $companyId, location: $location, status: $status) {
      id
      title
    }
  }
`;

const jobSchema = z.object({
  title: z.string().min(2, "Job title is required"),
  companyId: z.string().optional(),
  newCompanyName: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  status: z.string().default("Wishlist"),
}).refine(data => data.companyId || data.newCompanyName, {
  message: "Please select or create a company",
  path: ["companyId"],
});

type JobFormData = z.infer<typeof jobSchema>;

export default function AddJobForm({ onJobAdded }: { onJobAdded: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [useNewCompany, setUseNewCompany] = useState(false);
  const { data: compData, loading: compLoading, refetch: refetchCompanies } = useQuery(GET_COMPANIES);
  const [createCompany] = useMutation(CREATE_COMPANY);
  const [createJob, { loading: saving }] = useMutation(CREATE_JOB);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: { status: "Wishlist" }
  });

  const onSubmit = async (data: JobFormData) => {
    try {
      let companyId = data.companyId;

      if (useNewCompany && data.newCompanyName) {
        const { data: companyData } = await createCompany({
          variables: {
            name: data.newCompanyName,
            location: data.location,
          }
        });
        companyId = companyData.createCompany.id;
        refetchCompanies();
      }

      if (!companyId) {
        alert("Please select or create a company");
        return;
      }

      await createJob({
        variables: {
          title: data.title,
          companyId,
          location: data.location,
          status: data.status,
        }
      });

      reset();
      setIsOpen(false);
      setUseNewCompany(false);
      onJobAdded();
    } catch (err) {
      console.error(err);
      alert("Failed to save job. Please try again.");
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="backdrop-blur-md bg-gradient-to-r from-zinc-100 to-zinc-200 text-zinc-900 rounded-lg hover:from-white hover:to-zinc-100 text-sm font-bold shadow-xl transition flex items-center gap-2 border border-zinc-300/50 px-6 py-3"
      >
        + Add New Job
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="backdrop-blur-xl bg-zinc-900/90 border border-zinc-700/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 backdrop-blur-xl bg-zinc-900/90 border-b border-zinc-700/50 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">Add New Job Application</h3>
          <button
            type="button"
            onClick={() => { setIsOpen(false); setUseNewCompany(false); }}
            className="text-zinc-400 hover:text-white text-3xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2">
              Job Title <span className="text-red-400">*</span>
            </label>
            <input
              {...register("title")}
              type="text"
              className="w-full px-4 py-3 backdrop-blur-md bg-zinc-950/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 shadow-lg"
              placeholder="e.g., Frontend Engineer"
            />
            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2">
              Location <span className="text-red-400">*</span>
            </label>
            <input
              {...register("location")}
              type="text"
              className="w-full px-4 py-3 backdrop-blur-md bg-zinc-950/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 shadow-lg"
              placeholder="e.g., Addis Ababa, Bole"
            />
            {errors.location && <p className="text-red-400 text-sm mt-1">{errors.location.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2">
              Company <span className="text-red-400">*</span>
            </label>
            
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setUseNewCompany(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-md border shadow-lg transition ${
                  !useNewCompany ? 'bg-zinc-100 text-zinc-900 border-zinc-300/50' : 'bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50 border-zinc-700/50'
                }`}
              >
                Select Existing
              </button>
              <button
                type="button"
                onClick={() => setUseNewCompany(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-md border shadow-lg transition ${
                  useNewCompany ? 'bg-zinc-100 text-zinc-900 border-zinc-300/50' : 'bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50 border-zinc-700/50'
                }`}
              >
                + Create New
              </button>
            </div>

            {!useNewCompany ? (
              <>
                {compLoading ? (
                  <div className="w-full px-4 py-3 backdrop-blur-md bg-zinc-950/50 border border-zinc-700/50 rounded-lg text-zinc-500 shadow-lg">
                    Loading companies...
                  </div>
                ) : (
                  <select
                    {...register("companyId")}
                    className="w-full px-4 py-3 backdrop-blur-md bg-zinc-950/50 border border-zinc-700/50 rounded-lg text-white focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 shadow-lg"
                  >
                    <option value="" className="text-zinc-900">-- Select a company --</option>
                    {compData?.companies.map((c: any) => (
                      <option key={c.id} value={c.id} className="text-zinc-900">{c.name}</option>
                    ))}
                  </select>
                )}
              </>
            ) : (
              <input
                {...register("newCompanyName")}
                type="text"
                className="w-full px-4 py-3 backdrop-blur-md bg-zinc-950/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 shadow-lg"
                placeholder="Enter new company name"
              />
            )}
            {errors.companyId && <p className="text-red-400 text-sm mt-1">{errors.companyId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-300 mb-2">
              Status
            </label>
            <select
              {...register("status")}
              className="w-full px-4 py-3 backdrop-blur-md bg-zinc-950/50 border border-zinc-700/50 rounded-lg text-white focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 shadow-lg"
            >
              <option value="Wishlist" className="text-zinc-900">📋 Wishlist</option>
              <option value="Applied" className="text-zinc-900">📤 Applied</option>
              <option value="Interview" className="text-zinc-900">💼 Interview</option>
              <option value="Offer" className="text-zinc-900">✅ Offer</option>
              <option value="Rejected" className="text-zinc-900">❌ Rejected</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4 border-t border-zinc-700/50">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 backdrop-blur-md bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-500 hover:to-emerald-600 font-semibold shadow-xl disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 border border-emerald-500/50"
            >
              {saving ? "Saving..." : "✓ Save Job"}
            </button>
            <button
              type="button"
              onClick={() => { setIsOpen(false); setUseNewCompany(false); }}
              className="flex-1 backdrop-blur-md bg-zinc-800/50 text-zinc-300 rounded-lg hover:bg-zinc-700/50 font-semibold px-6 py-3 border border-zinc-700/50 shadow-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}