import React, { useState } from 'react';
import {
  X,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Mail,
  Phone,
  GraduationCap,
  Globe,
  Code2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { internshipService, type Internship, type SubmitApplicationPayload } from '@/services/internshipService';

interface InternshipApplyModalProps {
  internship: Internship | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const InternshipApplyModal: React.FC<InternshipApplyModalProps> = ({
  internship,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user, userProfile } = useAuth();

  const [fullName, setFullName] = useState(userProfile?.fullName || user?.displayName || '');
  const [email, setEmail] = useState(userProfile?.email || user?.email || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('B.Tech');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [currentYear, setCurrentYear] = useState('3rd Year');
  const [graduationYear, setGraduationYear] = useState<number>(new Date().getFullYear() + 1);
  const [skills, setSkills] = useState(internship?.requiredSkills || '');
  const [resumeUrl, setResumeUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [statementOfPurpose, setStatementOfPurpose] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !internship) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGiven) {
      toast.error('Please accept data processing consent to proceed.');
      return;
    }

    if (!fullName || !email || !phone || !college || !degree || !branch || !skills) {
      toast.error('Please complete all mandatory academic and contact fields.');
      return;
    }

    setLoading(true);
    try {
      const payload: SubmitApplicationPayload = {
        internshipId: internship.id,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        college: college.trim(),
        degree: degree.trim(),
        branch: branch.trim(),
        currentYear: currentYear.trim(),
        graduationYear: Number(graduationYear),
        skills: skills.trim(),
        resumeUrl: resumeUrl.trim() || undefined,
        githubUrl: githubUrl.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
        portfolioUrl: portfolioUrl.trim() || undefined,
        statementOfPurpose: statementOfPurpose.trim() || undefined,
      };

      await internshipService.submitApplication(payload);
      setSubmitted(true);
      toast.success('Internship application submitted successfully!');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Failed to submit application:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to submit application';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto">
        {/* Modal Top Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-850/60">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-0.5">
              KaizenQ Internship Application
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate max-w-md">
              {internship.title}
            </h3>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {submitted ? (
          <div className="p-8 sm:p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Application Successfully Submitted!
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Thank you for applying to the <strong className="text-slate-800 dark:text-slate-200">{internship.title}</strong> cohort. Our technical recruitment panel will review your profile. You can track your application status in your student dashboard.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 overflow-y-auto space-y-5 text-xs text-slate-700 dark:text-slate-300">
            {/* Section 1: Candidate Contact Info */}
            <div>
              <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-500" />
                1. Candidate Profile & Contact
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. john.doe@college.edu"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1">Phone Number (WhatsApp Active) *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Academic Details */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                2. Academic Background
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1">College / University Name *</label>
                  <input
                    type="text"
                    required
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. IIT Hyderabad / JNTU / Osmania University"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Degree Program *</label>
                  <select
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="B.Tech">B.Tech / B.E</option>
                    <option value="BCA">BCA</option>
                    <option value="MCA">MCA</option>
                    <option value="M.Tech">M.Tech</option>
                    <option value="B.Sc CS">B.Sc Computer Science</option>
                    <option value="Other">Other Degree</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Branch / Major *</label>
                  <input
                    type="text"
                    required
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="e.g. Computer Science, AI, ECE"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Current Year *</label>
                  <select
                    value={currentYear}
                    onChange={(e) => setCurrentYear(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Recent Graduate">Recent Graduate</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Graduation Year *</label>
                  <input
                    type="number"
                    required
                    min={2020}
                    max={2030}
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Technical Skills & Portfolio Links */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                3. Technical Skills & Project Portfolio
              </h5>
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold mb-1">Core Technical Skills *</label>
                  <input
                    type="text"
                    required
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. React, TypeScript, Python, Spring Boot, Git"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Resume Link (Google Drive / PDF URL)</label>
                    <input
                      type="url"
                      value={resumeUrl}
                      onChange={(e) => setResumeUrl(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">GitHub Profile Link</label>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">LinkedIn Profile Link</label>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Portfolio / Personal Website</label>
                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://myportfolio.dev"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Why do you want to join this internship?</label>
                  <textarea
                    rows={3}
                    value={statementOfPurpose}
                    onChange={(e) => setStatementOfPurpose(e.target.value)}
                    placeholder="Briefly describe what excites you about this internship and what practical skills you aim to build..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:border-blue-500 focus:outline-hidden resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Consent & Privacy Notice */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2.5 bg-slate-50 dark:bg-slate-850/50 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <input
                type="checkbox"
                id="consent-check"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-0.5 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="consent-check" className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed cursor-pointer select-none">
                I hereby consent to KaizenQ processing my academic and contact details for internship evaluation and candidate communication. I certify that all provided details and portfolio credentials are true and verifiable.
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !consentGiven}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs hover:shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Application</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
