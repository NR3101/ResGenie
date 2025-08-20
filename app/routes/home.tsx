import Navbar from "~/components/Navbar";
import type { Route } from "./+types/home";
import ResumeCard from "~/components/ResumeCard";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ResGenie" },
    {
      name: "description",
      content: "Smart analysis of your resume for your dream job!",
    },
  ];
}

export default function Home() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();

  // useEffect to handle redirection if not authenticated
  useEffect(() => {
    if (!auth.isAuthenticated) navigate("/auth?next=/");
  }, [auth.isAuthenticated]);

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);
      const resumes = (await kv.list("resume:*", true)) as KVItem[];

      const parsedResumes = resumes?.map(
        (resume) => JSON.parse(resume.value) as Resume
      );

      setResumes(parsedResumes || []);
      setLoadingResumes(false);
    };

    loadResumes();
  }, []);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track Your Applications & Resume Ratings with ResGenie</h1>
          {!loadingResumes && resumes.length === 0 ? (
            <h2>No resumes found.Upload your first resume to get feedback.</h2>
          ) : (
            <h2>Review your submissions and get AI-powered feedback.</h2>
          )}
        </div>

        {loadingResumes && (
          <div className="flex flex-col items-center justify-center">
            <img
              src="/images/resume-scan-2.gif"
              alt="Loading..."
              className="w-[200px]"
            />
          </div>
        )}

        {!loadingResumes && resumes.length > 0 && (
          <div className="resumes-section">
            {resumes.map((resume: Resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}

        {!loadingResumes && resumes.length === 0 && (
          <div className="flex justify-center flex-col items-center mt-10 gap-4">
            <Link
              to="/upload"
              className="primary-button w-fit text-xl font-semibold"
            >
              Upload Resume
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
