import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  Loader2,
  CheckCircle2,
  User,
  GraduationCap,
  Globe,
  Upload,
  FileText,
  Copy,
  Check,
  Mail,
  ShieldCheck,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { type Internship } from '@/services/internshipService';
import { careersService, DEFAULT_CAREER_OPENINGS } from '@/services/careersService';

interface InternshipApplyModalProps {
  internship?: Internship | null;
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

  // Position selection
  const [selectedPosition, setSelectedPosition] = useState<string>(
    internship?.title || DEFAULT_CAREER_OPENINGS[0].title
  );

  // Candidate Contact & Profile Fields
  const [fullName, setFullName] = useState(userProfile?.fullName || user?.displayName || '');
  const [email, setEmail] = useState(userProfile?.email || user?.email || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');

  // Academic Background Fields
  const [college, setCollege] = useState('');
  const [degree, setDegree] = useState('B.Tech');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [currentYear, setCurrentYear] = useState('3rd Year');
  const [graduationYear, setGraduationYear] = useState<number>(new Date().getFullYear() + 1);
  const [skills, setSkills] = useState(internship?.requiredSkills || '');

  // Resume & Portfolio Links
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [resumeBase64, setResumeBase64] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [statementOfPurpose, setStatementOfPurpose] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);

  // Status & State
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [copiedRef, setCopiedRef] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Update selected position when modal opens or internship changes
  useEffect(() => {
    if (internship) {
      setSelectedPosition(internship.title);
      if (internship.requiredSkills && !skills) {
        setSkills(internship.requiredSkills);
      }
    }
  }, [internship]);

  // Update candidate details if auth context loads
  useEffect(() => {
    if (!fullName && (userProfile?.fullName || user?.displayName)) {
      setFullName(userProfile?.fullName || user?.displayName || '');
    }
    if (!email && (userProfile?.email || user?.email)) {
      setEmail(userProfile?.email || user?.email || '');
    }
    if (!phone && userProfile?.phone) {
      setPhone(userProfile?.phone || '');
    }
  }, [userProfile, user]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];

    if (
      !validTypes.includes(file.type) &&
      !file.name.endsWith('.pdf') &&
      !file.name.endsWith('.docx') &&
      !file.name.endsWith('.doc')
    ) {
      toast.error('Only PDF or DOCX resume files are supported.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Resume file must be under 5MB.');
      return;
    }

    setResumeFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setResumeBase64(reader.result);
        toast.success(`Attached ${file.name} successfully!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const resetFormFields = () => {
    setCollege('');
    setStatementOfPurpose('');
    setResumeUrl('');
    setResumeFileName('');
    setResumeBase64('');
    setGithubUrl('');
    setLinkedinUrl('');
    setPortfolioUrl('');
    setConsentGiven(false);
  };

  const isClosedOrDraft = Boolean(
    internship &&
    (internship.status === 'ARCHIVED' || internship.status === 'DRAFT' || internship.status === 'CLOSED')
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isClosedOrDraft) {
      const msg = `The opportunity "${internship?.title}" is currently closed or unpublished and cannot receive new applications.`;
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (!consentGiven) {
      toast.error('Please accept data processing consent to proceed.');
      return;
    }

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      toast.error('Please complete all mandatory contact fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address.');
      return;
    }

    if (phone.trim().length < 7) {
      toast.error('Please enter a valid phone number with country code.');
      return;
    }

    setErrorMessage(null);
    setLoading(true);

    try {
      const positionToApply = internship ? internship.title : selectedPosition;

      const result = await careersService.submitApplication({
        name: fullName.trim(),
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        position: positionToApply,
        resumeUrl: resumeUrl.trim() || undefined,
        resumeFileName: resumeFileName || undefined,
        resumeBase64: resumeBase64 || undefined,
        linkedin: linkedinUrl.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
        github: githubUrl.trim() || undefined,
        githubUrl: githubUrl.trim() || undefined,
        coverLetter: statementOfPurpose.trim() || undefined,
        statementOfPurpose: statementOfPurpose.trim() || undefined,
        college: college.trim(),
        degree: degree.trim(),
        branch: branch.trim(),
        currentYear: currentYear.trim(),
        graduationYear: Number(graduationYear),
        skills: skills.trim(),
        internshipId: internship?.id,
        portfolioUrl: portfolioUrl.trim() || undefined,
        department: internship?.department || 'Engineering',
        workMode: internship?.internshipType || (internship as any)?.workMode || 'REMOTE',
      });

      if (!result.success) {
        throw new Error(result.message || 'Unable to submit application.');
      }

      setReferenceNumber(result.applicationId);
      setSubmitted(true);
      resetFormFields();

      if (result.duplicate) {
        toast.info(result.message);
      } else {
        toast.success(result.message || 'Application submitted successfully! Confirmation email sent.');
      }

      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Failed to submit application:', err);
      const msg = err.message || 'Unable to submit application. Please try again later.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyRef = () => {
    if (referenceNumber) {
      navigator.clipboard.writeText(referenceNumber);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
      toast.success('Application ID copied to clipboard');
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setReferenceNumber('');
    onClose();
  };

  const currentDisplayPosition = internship ? internship.title : selectedPosition;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col my-auto">
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-850/70">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                KaizenQ Careers &bull; Shaivika Groups
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100/70 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                Official Application
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate max-w-md sm:max-w-xl">
              {currentDisplayPosition}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {submitted ? (
          <div className="p-8 sm:p-12 text-center space-y-5 overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm animate-in zoom-in-50 duration-300">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h4 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Application Successfully Submitted!
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Thank you for applying for the <strong className="text-slate-800 dark:text-slate-200">{currentDisplayPosition}</strong> opportunity at KaizenQ, a Shaivika Groups initiative.
              </p>
            </div>

            {/* Application ID Card */}
            {referenceNumber && (
              <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/70 max-w-md mx-auto text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                    Application ID
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyRef}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    {copiedRef ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy ID</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="font-mono text-xl sm:text-2xl font-black text-blue-900 dark:text-blue-100 tracking-wider">
                  {referenceNumber}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  Recorded in KaizenQ Google Sheets Database. Please keep this ID for your reference.
                </p>
              </div>
            )}

            {/* Email Notification Notice */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700 text-left max-w-md mx-auto flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>Confirmation Email Sent:</strong> An automated confirmation containing your Application ID and next steps has been delivered to <span className="font-semibold text-slate-800 dark:text-slate-100">{email}</span>.
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer hover:scale-[1.02]"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-7 overflow-y-auto space-y-5 text-xs text-slate-700 dark:text-slate-300">
            {isClosedOrDraft && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  This opportunity ({internship?.title}) is currently {internship?.status?.toLowerCase()} and not accepting new applications.
                </span>
              </div>
            )}

            {/* Position Selector (If opening was not pre-selected) */}
            {!internship && (
              <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/60">
                <label className="block font-bold text-slate-900 dark:text-white mb-1.5 text-xs flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Select Position / Track *
                </label>
                <select
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                >
                  {DEFAULT_CAREER_OPENINGS.map((op) => (
                    <option key={op.id} value={op.title}>
                      {op.title} ({op.domain})
                    </option>
                  ))}
                  <option value="General Engineering & Talent Pool Application">
                    General Engineering & Talent Pool Application
                  </option>
                </select>
              </div>
            )}

            {/* Section 1: Candidate Contact Info */}
            <div>
              <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-500" />
                1. Candidate Profile & Contact Information
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:border-blue-500 focus:outline-hidden text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:border-blue-500 focus:outline-hidden text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1">Mobile / WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:border-blue-500 focus:outline-hidden text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Academic Background */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                2. Academic Background & University
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1">College / Institute / University</label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. National Institute of Technology, Warangal"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:border-blue-500 focus:outline-hidden text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Degree Program</label>
                  <select
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:border-blue-500 focus:outline-hidden text-xs"
                  >
                    <option value="B.Tech">B.Tech / B.E</option>
                    <option value="M.Tech">M.Tech / M.E</option>
                    <option value="BCA">BCA</option>
                    <option value="MCA">MCA</option>
                    <option value="B.Sc CS/IT">B.Sc Computer Science / IT</option>
                    <option value="M.Sc CS/IT">M.Sc Computer Science / IT</option>
                    <option value="Other">Other Equivalent Degree</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Branch / Major</label>
                  <input
                    type="text"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    placeholder="e.g. Computer Science, AI, ECE"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:border-blue-500 focus:outline-hidden text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Current Year of Study</label>
                  <select
                    value={currentYear}
                    onChange={(e) => setCurrentYear(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:border-blue-500 focus:outline-hidden text-xs"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year (Final Year)</option>
                    <option value="Recent Graduate">Recent Graduate</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Year of Graduation</label>
                  <input
                    type="number"
                    min={2020}
                    max={2032}
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:border-blue-500 focus:outline-hidden text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Technical Skills, Resume & Project Links */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                3. Technical Skills, Resume & Project Links
              </h5>
              <div className="space-y-3.5">
                <div>
                  <label className="block font-semibold mb-1">Core Technical Skills</label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g. React, TypeScript, Python, Node.js, PostgreSQL, Git"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:border-blue-500 focus:outline-hidden text-xs"
                  />
                </div>

                {/* Resume Upload / URL */}
                <div className="p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-semibold text-slate-800 dark:text-slate-200">
                      Resume Link or File Upload (PDF / DOCX, &le; 5MB)
                    </label>
                    {resumeFileName && (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {resumeFileName}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-medium hover:bg-blue-100 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose File</span>
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-slate-400 text-[11px] text-center sm:text-left">or enter link:</span>
                    <input
                      type="url"
                      value={resumeUrl.startsWith('data:') ? '' : resumeUrl}
                      onChange={(e) => {
                        setResumeUrl(e.target.value);
                        setResumeFileName('');
                        setResumeBase64('');
                      }}
                      placeholder="https://drive.google.com/file/d/..."
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">LinkedIn Profile Link</label>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:border-blue-500 focus:outline-hidden text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">GitHub Profile Link</label>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:border-blue-500 focus:outline-hidden text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold mb-1">Portfolio / Project Link</label>
                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://myportfolio.dev"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:border-blue-500 focus:outline-hidden text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Cover Letter / Statement of Purpose</label>
                  <textarea
                    rows={3}
                    value={statementOfPurpose}
                    onChange={(e) => setStatementOfPurpose(e.target.value)}
                    placeholder="Briefly describe what excites you about this opportunity and the practical skills you aim to contribute..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 focus:border-blue-500 focus:outline-hidden resize-none text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Privacy & Recruitment Data Consent Notice */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2.5 bg-slate-50 dark:bg-slate-850/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <input
                type="checkbox"
                id="consent-check"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-0.5 rounded-sm border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="consent-check" className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed cursor-pointer select-none">
                <strong className="text-slate-800 dark:text-slate-200">Recruitment Privacy Notice:</strong> I hereby consent to KaizenQ and Shaivika Groups recording and processing my applicant details in our secure recruitment database for candidate evaluation, screening, and status updates. All submitted details are certified to be true and verifiable.
              </label>
            </div>

            {/* Inline Error Alert */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-rose-700 dark:text-rose-300 text-xs animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <div className="leading-relaxed">
                  <strong className="block font-bold">Submission Error:</strong>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Form Actions */}
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
                disabled={loading || !consentGiven || isClosedOrDraft}
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
