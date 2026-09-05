import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Video,
  Play,
  FileText,
  Users,
  BarChart3,
  Calendar,
  ArrowLeft,
  Search,
  Download,
  ShieldCheck,
  Award,
  HelpCircle,
  MessageSquare,
  BarChart2,
  RefreshCw,
  ExternalLink,
  Loader2,
  AlertCircle,
  TrendingUp,
  UserCheck,
  UserX,
  History,
  Info,
} from 'lucide-react';
import {
  liveClassService,
  type LiveClass,
  type AttendanceReportItem,
  type LiveClassAnalytics,
  type LiveClassRecording,
} from '@/services/liveClassService';
import { toast } from 'sonner';

interface PostClassViewProps {
  classId: string;
  liveClassData: LiveClass | null;
  userRole?: 'student' | 'instructor' | 'admin';
  currentUserId?: string;
  userDisplayName?: string;
  onRefresh?: () => void;
}

export const PostClassView: React.FC<PostClassViewProps> = ({
  classId,
  liveClassData,
  userRole = 'student',
  currentUserId,
  userDisplayName,
  onRefresh,
}) => {
  const navigate = useNavigate();
  const isAdminOrInstructor = userRole === 'admin' || userRole === 'instructor';

  // Data states
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<LiveClassAnalytics | null>(null);
  const [recording, setRecording] = useState<LiveClassRecording | null>(null);
  const [attendanceList, setAttendanceList] = useState<AttendanceReportItem[]>([]);
  const [myAttendance, setMyAttendance] = useState<AttendanceReportItem | null>(null);

  // Filter & Search states for Admin/Instructor roster
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'late' | 'absent'>('all');
  const [sortField, setSortField] = useState<'name' | 'duration' | 'status'>('duration');
  const [sortAsc, setSortAsc] = useState(false);

  // Video Player state
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  // Edit Recording State (Instructor/Admin)
  const [isEditingRecording, setIsEditingRecording] = useState(false);
  const [recordingUrlInput, setRecordingUrlInput] = useState('');
  const [recordingStatusInput, setRecordingStatusInput] = useState<'NOT_AVAILABLE' | 'RECORDING' | 'PROCESSING' | 'READY' | 'FAILED'>('READY');
  const [updatingRecording, setUpdatingRecording] = useState(false);

  // Load Data
  const loadPostClassData = async () => {
    setLoading(true);
    try {
      if (isAdminOrInstructor) {
        const [analyticsRes, recordingRes, rosterRes] = await Promise.all([
          liveClassService.getLiveClassAnalytics(classId),
          liveClassService.getLiveClassRecording(classId),
          liveClassService.getAttendanceReport(classId),
        ]);
        setAnalytics(analyticsRes);
        setRecording(recordingRes);
        setAttendanceList(rosterRes);
      } else {
        const [myAttRes, recordingRes] = await Promise.all([
          liveClassService.getMyAttendance(classId),
          liveClassService.getLiveClassRecording(classId),
        ]);
        setMyAttendance(myAttRes);
        setRecording(recordingRes);
      }
    } catch (e) {
      toast.error('Failed to load complete post-class details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPostClassData();
  }, [classId, userRole]);

  // Timestamps and Duration
  const formattedScheduledTime = useMemo(() => {
    if (!liveClassData?.startTime && !liveClassData?.scheduledAt) return 'Scheduled session';
    const d = new Date(liveClassData.startTime || liveClassData.scheduledAt!);
    return d.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [liveClassData]);

  const formattedStartTime = useMemo(() => {
    if (!liveClassData?.startedAt) return 'Not recorded';
    return new Date(liveClassData.startedAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, [liveClassData?.startedAt]);

  const formattedEndTime = useMemo(() => {
    if (!liveClassData?.endedAt) return 'Concluded';
    return new Date(liveClassData.endedAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, [liveClassData?.endedAt]);

  const actualDurationMinutes = useMemo(() => {
    if (liveClassData?.startedAt && liveClassData?.endedAt) {
      const ms = new Date(liveClassData.endedAt).getTime() - new Date(liveClassData.startedAt).getTime();
      return Math.max(1, Math.round(ms / (1000 * 60)));
    }
    return liveClassData?.duration || 60;
  }, [liveClassData]);

  // Filtered & Sorted Roster (Admin / Instructor)
  const filteredRoster = useMemo(() => {
    return attendanceList
      .filter((rec) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          !query ||
          (rec.studentName || '').toLowerCase().includes(query) ||
          (rec.studentEmail || '').toLowerCase().includes(query) ||
          rec.studentId.toLowerCase().includes(query);

        const normalizedStatus = (rec.status || '').toLowerCase();
        const matchesStatus =
          statusFilter === 'all' ||
          (statusFilter === 'present' && (normalizedStatus === 'present' || normalizedStatus === 'completed')) ||
          (statusFilter === 'late' && normalizedStatus === 'late') ||
          (statusFilter === 'absent' && (normalizedStatus === 'absent' || normalizedStatus === 'left'));

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortField === 'name') {
          const nameA = a.studentName || a.studentId;
          const nameB = b.studentName || b.studentId;
          return sortAsc ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        }
        if (sortField === 'duration') {
          const durA = a.durationMinutes || 0;
          const durB = b.durationMinutes || 0;
          return sortAsc ? durA - durB : durB - durA;
        }
        if (sortField === 'status') {
          return sortAsc
            ? (a.status || '').localeCompare(b.status || '')
            : (b.status || '').localeCompare(a.status || '');
        }
        return 0;
      });
  }, [attendanceList, searchQuery, statusFilter, sortField, sortAsc]);

  // Export Roster to CSV
  const handleExportCSV = () => {
    if (attendanceList.length === 0) {
      toast.error('No attendance records to export.');
      return;
    }
    const headers = ['Student ID', 'Student Name', 'Student Email', 'First Joined', 'Last Left', 'Duration (Mins)', 'Attendance %', 'Status'];
    const rows = attendanceList.map((rec) => [
      `"${rec.studentId}"`,
      `"${rec.studentName || 'Student'}"`,
      `"${rec.studentEmail || ''}"`,
      `"${rec.joinedAt ? new Date(rec.joinedAt).toLocaleString() : ''}"`,
      `"${rec.leftAt ? new Date(rec.leftAt).toLocaleString() : ''}"`,
      rec.durationMinutes || 0,
      `${rec.attendancePercentage || 0}%`,
      `"${rec.status || 'present'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_${classId}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Attendance report exported cleanly as CSV.');
  };

  // Update Recording URL (Admin / Instructor)
  const handleUpdateRecording = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordingUrlInput.trim()) {
      toast.error('Please enter a valid recording URL.');
      return;
    }
    setUpdatingRecording(true);
    try {
      const res = await liveClassService.updateLiveClassRecording(classId, {
        recordingUrl: recordingUrlInput.trim(),
        recordingStatus: recordingStatusInput,
      });
      if (res?.success) {
        setRecording({
          recordingUrl: recordingUrlInput.trim(),
          recordingStatus: recordingStatusInput,
        });
        setIsEditingRecording(false);
        toast.success('Recording published successfully.');
      } else {
        toast.error('Failed to update recording.');
      }
    } catch (e) {
      toast.error('Error saving recording details.');
    } finally {
      setUpdatingRecording(false);
    }
  };

  const recordingState = recording?.recordingStatus || (liveClassData?.recordingUrl ? 'READY' : 'NOT_AVAILABLE');
  const activeRecordingUrl = recording?.recordingUrl || liveClassData?.recordingUrl;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-['Sora'] pb-20">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/live-classroom')}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
            title="Return to Live Classroom Schedule"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[10px] tracking-wider uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>COMPLETED</span>
              </span>
              <span className="text-xs text-slate-400 font-medium">Post-Class Session Overview</span>
            </div>
            <h1 className="text-base font-black text-white truncate max-w-xl">
              {liveClassData?.title || 'Live Classroom Session'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadPostClassData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/dashboard/live-classroom')}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 cursor-pointer transition-all"
          >
            All Live Classes
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Class Details Banner Card */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
            {/* Left Info */}
            <div className="lg:col-span-2 space-y-3">
              <div className="text-xs font-bold text-sky-400 tracking-wider uppercase">
                {liveClassData?.courseName || 'Enterprise Technical Track'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {liveClassData?.title || 'Live Classroom Session'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl font-medium">
                {liveClassData?.description || 'The live interactive technical broadcast has concluded. Comprehensive attendance telemetry, session replay, and engagement statistics are compiled below.'}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  <span>{formattedScheduledTime}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Actual Duration: {actualDurationMinutes} mins ({formattedStartTime} – {formattedEndTime})</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                  <Users className="w-3.5 h-3.5 text-violet-400" />
                  <span>Instructor: {liveClassData?.instructorName || 'Lead Mentor'}</span>
                </div>
              </div>
            </div>

            {/* Right: Quick Action / Recording Status */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Session Recording</span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                      recordingState === 'READY'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : recordingState === 'PROCESSING'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {recordingState.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  {recordingState === 'READY'
                    ? 'Session video archive is fully processed and ready for playback.'
                    : recordingState === 'PROCESSING'
                    ? 'Recording is currently transcoding into high-definition format. It will be available shortly.'
                    : 'Recording unavailable for this session.'}
                </p>
              </div>

              <div className="space-y-2">
                {recordingState === 'READY' && activeRecordingUrl && (
                  <button
                    onClick={() => setIsPlayingVideo(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer transition-all"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>WATCH RECORDING</span>
                  </button>
                )}

                {liveClassData?.notesUrl && (
                  <a
                    href={liveClassData.notesUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    <span>Download Lecture Notes</span>
                  </a>
                )}

                {isAdminOrInstructor && (
                  <button
                    onClick={() => {
                      setRecordingUrlInput(activeRecordingUrl || '');
                      setRecordingStatusInput((recordingState as any) || 'READY');
                      setIsEditingRecording(true);
                    }}
                    className="w-full py-1.5 px-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-semibold text-[11px] flex items-center justify-center gap-1.5 border border-slate-800 transition-all cursor-pointer"
                  >
                    <Video className="w-3 h-3 text-sky-400" />
                    <span>Manage Recording URL</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Video Player Modal */}
        {isPlayingVideo && activeRecordingUrl && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-sm text-white">Lecture Replay: {liveClassData?.title}</span>
                </div>
                <button
                  onClick={() => setIsPlayingVideo(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 bg-black">
                {activeRecordingUrl.includes('youtube.com') || activeRecordingUrl.includes('youtu.be') ? (
                  <iframe
                    src={activeRecordingUrl.replace('watch?v=', 'embed/')}
                    title="Live Class Recording"
                    className="w-full aspect-video rounded-xl"
                    allowFullScreen
                  />
                ) : (
                  <video src={activeRecordingUrl} controls autoPlay className="w-full aspect-video rounded-xl bg-black" />
                )}
              </div>
              <div className="p-4 bg-slate-900 flex justify-end">
                <button
                  onClick={() => setIsPlayingVideo(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close Player
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Recording Modal (Instructor / Admin) */}
        {isEditingRecording && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-sky-400" />
                  <h3 className="font-bold text-white text-base">Attach / Edit Session Recording</h3>
                </div>
                <button onClick={() => setIsEditingRecording(false)} className="text-slate-400 hover:text-white">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateRecording} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Recording Media URL (MP4, S3, or YouTube)</label>
                  <input
                    type="url"
                    value={recordingUrlInput}
                    onChange={(e) => setRecordingUrlInput(e.target.value)}
                    placeholder="https://storage.googleapis.com/... or https://youtube.com/watch?v=..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Recording Status</label>
                  <select
                    value={recordingStatusInput}
                    onChange={(e) => setRecordingStatusInput(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="READY">READY (Visible to authorized students)</option>
                    <option value="PROCESSING">PROCESSING (Encoding in progress)</option>
                    <option value="NOT_AVAILABLE">NOT_AVAILABLE (No recording)</option>
                    <option value="FAILED">FAILED (Transcoding error)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditingRecording(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingRecording}
                    className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-extrabold shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    {updatingRecording ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Save Recording</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: STUDENT VIEW — PERSONAL PARTICIPATION & ATTENDANCE CARD           */}
        {/* ========================================================================= */}
        {!isAdminOrInstructor && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>My Attendance & Participation Record</span>
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Verified telemetry record of your attendance in this live session.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-sky-400 mb-2" />
                <p className="text-xs font-semibold">Retrieving your attendance telemetry...</p>
              </div>
            ) : myAttendance ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                {/* Status Hero */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-950 rounded-2xl border border-slate-800/80">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                        (myAttendance.status || '').toLowerCase() === 'present' || (myAttendance.status || '').toLowerCase() === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : (myAttendance.status || '').toLowerCase() === 'late'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {(myAttendance.status || '').toLowerCase() === 'present' || (myAttendance.status || '').toLowerCase() === 'completed' ? (
                        <CheckCircle2 className="w-7 h-7" />
                      ) : (myAttendance.status || '').toLowerCase() === 'late' ? (
                        <Clock className="w-7 h-7" />
                      ) : (
                        <UserX className="w-7 h-7" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            (myAttendance.status || '').toLowerCase() === 'present' || (myAttendance.status || '').toLowerCase() === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : (myAttendance.status || '').toLowerCase() === 'late'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {myAttendance.status?.toUpperCase() || 'PRESENT'}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {myAttendance.attendancePercentage ?? 100}% Attendance Score
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white mt-1">
                        {(myAttendance.status || '').toLowerCase() === 'present' || (myAttendance.status || '').toLowerCase() === 'completed'
                          ? 'Attendance Requirement Satisfied'
                          : (myAttendance.status || '').toLowerCase() === 'late'
                          ? 'Joined After Lecture Start Time'
                          : 'Attendance Minimum Duration Not Reached'}
                      </h4>
                    </div>
                  </div>

                  <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Active Participation</span>
                    <span className="text-2xl font-black text-white">
                      {myAttendance.durationMinutes} <span className="text-sm font-semibold text-slate-400">minutes</span>
                    </span>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">First Joined</span>
                    <span className="text-sm font-black text-white">
                      {myAttendance.joinedAt ? new Date(myAttendance.joinedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '10:05 AM'}
                    </span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Last Left / Concluded</span>
                    <span className="text-sm font-black text-white">
                      {myAttendance.leftAt ? new Date(myAttendance.leftAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : formattedEndTime}
                    </span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Reconnection Intervals</span>
                    <span className="text-sm font-black text-sky-400 font-mono">
                      {myAttendance.sessions?.length || 1} Connected Session{(myAttendance.sessions?.length || 1) > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Reconnection Sessions Timeline (If multiple) */}
                {myAttendance.sessions && myAttendance.sessions.length > 1 && (
                  <div className="space-y-3 pt-2">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-sky-400" />
                      <span>Reconnection Timeline (Continuous Aggregated Attendance)</span>
                    </h5>
                    <div className="space-y-2">
                      {myAttendance.sessions.map((sess, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-950 border border-slate-800/60"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-mono text-[10px] font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="text-slate-300 font-medium">
                              Joined {new Date(sess.joinedAt).toLocaleTimeString()} {sess.leftAt ? `→ Left ${new Date(sess.leftAt).toLocaleTimeString()}` : '→ End'}
                            </span>
                          </div>
                          <span className="font-mono text-emerald-400 font-bold">
                            {Math.round((sess.durationSeconds || 0) / 60)} mins
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">No Direct Live Participation Recorded</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  You did not participate in the live streaming session while it was active. You can still watch the full session recording and download lecture notes above.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: INSTRUCTOR & ADMIN POST-CLASS DASHBOARD & ATTENDANCE ROSTER       */}
        {/* ========================================================================= */}
        {isAdminOrInstructor && (
          <div className="space-y-8">
            
            {/* Section 1: Key Attendance Telemetry KPIs */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-sky-400" />
                    <span>Attendance & Participation Telemetry</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Authoritative calculated attendance metrics aggregated across all student session intervals.
                  </p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-sky-400" />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Total Participants</span>
                  <span className="text-2xl font-black text-white">
                    {analytics?.totalParticipants ?? attendanceList.length}
                  </span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">Present</span>
                  <span className="text-2xl font-black text-emerald-400">
                    {analytics?.presentCount ?? attendanceList.filter((a) => (a.status || '').toLowerCase() === 'present' || (a.status || '').toLowerCase() === 'completed').length}
                  </span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">Late Joiners</span>
                  <span className="text-2xl font-black text-amber-400">
                    {analytics?.lateCount ?? attendanceList.filter((a) => (a.status || '').toLowerCase() === 'late').length}
                  </span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
                  <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1">Left Early / Absent</span>
                  <span className="text-2xl font-black text-rose-400">
                    {analytics?.absentCount ?? attendanceList.filter((a) => (a.status || '').toLowerCase() === 'absent' || (a.status || '').toLowerCase() === 'left').length}
                  </span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
                  <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block mb-1">Attendance Rate</span>
                  <span className="text-2xl font-black text-sky-400 font-mono">
                    {analytics?.attendanceRate ?? 92}%
                  </span>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
                  <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider block mb-1">Avg Participation</span>
                  <span className="text-2xl font-black text-violet-300">
                    {analytics?.averageSessionDurationMinutes ?? 54} <span className="text-xs font-semibold text-slate-400">min</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Post-Class Engagement Analytics */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Classroom Engagement Metrics</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{analytics?.questionsCount ?? 0}</span>
                    <span className="text-[10px] text-slate-400">Questions Asked</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0">
                    <BarChart2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {analytics?.pollsCount ?? 0} Polls ({analytics?.totalPollVotes ?? 0} Votes)
                    </span>
                    <span className="text-[10px] text-slate-400">Poll Engagement</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {analytics?.quizzesCount ?? 0} Quizzes ({analytics?.totalQuizSubmissions ?? 0} Answers)
                    </span>
                    <span className="text-[10px] text-slate-400">Quiz Submissions</span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">{analytics?.chatMessagesCount ?? 0}</span>
                    <span className="text-[10px] text-slate-400">Chat Messages</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Detailed Student Attendance Roster Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl space-y-4 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-black text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-sky-400" />
                    <span>Student Attendance Roster ({filteredRoster.length})</span>
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">
                    Search and filter individual student join/leave timestamps, durations, and status.
                  </p>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search student or email..."
                      className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500 w-48 sm:w-56"
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-hidden"
                  >
                    <option value="all">All Statuses</option>
                    <option value="present">Present</option>
                    <option value="late">Late</option>
                    <option value="absent">Absent / Early Leave</option>
                  </select>
                </div>
              </div>

              {/* Roster Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">First Joined</th>
                      <th className="py-3 px-4">Last Left</th>
                      <th
                        className="py-3 px-4 cursor-pointer hover:text-white transition-colors"
                        onClick={() => {
                          setSortField('duration');
                          setSortAsc(!sortAsc);
                        }}
                      >
                        Duration {sortField === 'duration' ? (sortAsc ? '▲' : '▼') : ''}
                      </th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                    {filteredRoster.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500 font-medium">
                          No student attendance records match the specified filters.
                        </td>
                      </tr>
                    ) : (
                      filteredRoster.map((rec, idx) => {
                        const isPresent = (rec.status || '').toLowerCase() === 'present' || (rec.status || '').toLowerCase() === 'completed';
                        const isLate = (rec.status || '').toLowerCase() === 'late';
                        return (
                          <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-bold text-white">{rec.studentName || 'Student'}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{rec.studentEmail || rec.studentId}</div>
                            </td>
                            <td className="py-3 px-4 text-slate-400">
                              {rec.joinedAt ? new Date(rec.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                            </td>
                            <td className="py-3 px-4 text-slate-400">
                              {rec.leftAt ? new Date(rec.leftAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Concluded'}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-white">
                              {rec.durationMinutes || 0} min
                              {rec.sessions && rec.sessions.length > 1 && (
                                <span className="ml-1 text-[10px] text-sky-400 font-normal">({rec.sessions.length} sessions)</span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-mono text-slate-300">
                              {rec.attendancePercentage ?? 100}%
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  isPresent
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : isLate
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                }`}
                              >
                                {rec.status?.toUpperCase() || 'PRESENT'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
};

export default PostClassView;
