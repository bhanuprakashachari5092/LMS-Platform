import React, { useEffect, useState } from 'react';
import { Award, Clock, Loader2, RefreshCw, CheckCircle2, AlertCircle, X, ExternalLink, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export type QueueModalStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface CertificateJobState {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  position?: number;
  estimatedWaitSeconds?: number;
  certificateId?: string;
  googleDriveUrl?: string;
  pdfUrl?: string;
  errorMessage?: string;
}

interface CertificateGenerationQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  initialJob?: CertificateJobState | null;
  onCertificateReady?: (certificateData: any) => void;
}

export const CertificateGenerationQueueModal: React.FC<CertificateGenerationQueueModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  initialJob,
  onCertificateReady,
}) => {
  const { user, userProfile } = useAuth();
  const [job, setJob] = useState<CertificateJobState | null>(initialJob || null);
  const [status, setStatus] = useState<QueueModalStatus>('QUEUED');
  const [isRetrying, setIsRetrying] = useState(false);

  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';

  useEffect(() => {
    if (initialJob) {
      setJob(initialJob);
      if (initialJob.status === 'completed') setStatus('COMPLETED');
      else if (initialJob.status === 'processing') setStatus('PROCESSING');
      else if (initialJob.status === 'failed') setStatus('FAILED');
      else setStatus('QUEUED');
    }
  }, [initialJob]);

  // Poll for job updates if status is QUEUED or PROCESSING
  useEffect(() => {
    if (!isOpen || !job?.jobId || status === 'COMPLETED' || status === 'FAILED') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const token = user ? await user.getIdToken() : '';
        const res = await fetch(`${apiBase}/certificates/jobs/${encodeURIComponent(job.jobId)}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.job) {
            const updatedJob = data.job;
            setJob(updatedJob);

            if (updatedJob.status === 'completed') {
              setStatus('COMPLETED');
              toast.success('🎉 Your Certificate is Ready!');
              if (onCertificateReady) {
                onCertificateReady(updatedJob);
              }
            } else if (updatedJob.status === 'processing') {
              setStatus('PROCESSING');
            } else if (updatedJob.status === 'failed') {
              setStatus('FAILED');
            } else {
              setStatus('QUEUED');
            }
          }
        }
      } catch (pollErr) {
        console.warn('Queue poll notice:', pollErr);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isOpen, job?.jobId, status, user, apiBase, onCertificateReady]);

  const handleRetry = async () => {
    if (!user) return;
    setIsRetrying(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${apiBase}/certificates/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentId: user.uid,
          studentName: userProfile?.name || user.displayName || 'Student',
          studentEmail: user.email,
          courseId,
          courseTitle,
          forceRegenerate: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.job) {
          setJob(data.job);
          setStatus('QUEUED');
          toast.info('Certificate request re-enqueued.');
        } else if (data.certificate) {
          setStatus('COMPLETED');
          if (onCertificateReady) onCertificateReady(data.certificate);
        }
      } else {
        toast.error(data.error || 'Retry failed.');
      }
    } catch (err: any) {
      toast.error('Network error during retry.');
    } finally {
      setIsRetrying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative font-['Sora']">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950/80 border border-cyan-800 text-cyan-400 flex items-center justify-center shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-black text-lg text-white">Certificate Generation</h3>
              <p className="text-xs text-slate-400 font-medium truncate max-w-[260px]">{courseTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Queue Content */}
        <div className="py-2">
          {status === 'QUEUED' && (
            <div className="text-center space-y-5">
              <div className="relative inline-flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-cyan-500/10 border-2 border-dashed border-cyan-500/40 flex items-center justify-center animate-spin-slow">
                  <Clock className="w-8 h-8 text-cyan-400" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                  Waiting in queue
                </span>
                <h4 className="text-2xl font-black text-white mt-2">
                  Queue Position: #{job?.position || 1}
                </h4>
                <p className="text-sm text-slate-400">
                  Estimated wait: <span className="text-cyan-300 font-semibold">~{job?.estimatedWaitSeconds || 8} seconds</span>
                </p>
              </div>

              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Your certificate is queued for sequential generation. You can leave this window open or come back anytime.
              </p>
            </div>
          )}

          {status === 'PROCESSING' && (
            <div className="text-center space-y-5">
              <div className="inline-flex items-center justify-center">
                <Loader2 className="w-16 h-16 text-cyan-400 animate-spin" />
              </div>
              <div className="space-y-1">
                <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">
                  Generating certificate...
                </span>
                <h4 className="text-xl font-bold text-white mt-2">Compiling High-Fidelity Credential</h4>
                <p className="text-xs text-slate-400">
                  Rendering dynamic vector typography and syncing credential to Google Drive storage.
                </p>
              </div>
            </div>
          )}

          {status === 'COMPLETED' && (
            <div className="text-center space-y-5">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  Certificate Ready
                </span>
                <h4 className="text-xl font-bold text-white mt-2">Credential Issued Successfully!</h4>
                {job?.certificateId && (
                  <p className="text-xs font-mono text-cyan-400 font-bold">ID: {job.certificateId}</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {job?.googleDriveUrl && (
                  <a
                    href={job.googleDriveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-cyan-500/20"
                  >
                    <Download className="w-4 h-4" /> Download Certificate
                  </a>
                )}
                {job?.certificateId && (
                  <a
                    href={`/verify-certificate/${job.certificateId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-slate-700"
                  >
                    <ExternalLink className="w-4 h-4" /> Verify Credential
                  </a>
                )}
              </div>
            </div>
          )}

          {status === 'FAILED' && (
            <div className="text-center space-y-5">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 mx-auto">
                <AlertCircle className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">
                  Certificate generation failed
                </span>
                <h4 className="text-lg font-bold text-white mt-2">Generation Encountered An Issue</h4>
                <p className="text-xs text-red-400/80 max-w-sm mx-auto">
                  {job?.errorMessage || 'An error occurred during queue processing. Please retry.'}
                </p>
              </div>

              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-cyan-500/20 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Retrying...' : 'Retry Generation'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
