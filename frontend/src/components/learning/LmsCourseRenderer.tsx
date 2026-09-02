import React, { useMemo, useState } from 'react';
import { CodeBlock } from './CodeBlock';
import { Sparkles, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';
import { soundService } from '@/services/soundService';
import { GamifiedArchitectureFlow } from './GamifiedArchitectureFlow';

interface LmsCourseRendererProps {
  content: string;
  isNightMode?: boolean;
  courseId?: string;
}

// ---------------------------------------------------------------------
// 🎨 LIGHTWEIGHT SVG TOPIC-SPECIFIC ILLUSTRATIONS
// ---------------------------------------------------------------------
const TopicVisual: React.FC<{ topicKey: string; isNightMode: boolean }> = ({ topicKey, isNightMode }) => {
  const strokeColor = isNightMode ? '#22d3ee' : '#0284c7'; // cyan vs sky-600
  const fillColor = isNightMode ? '#1e293b' : '#f0f9ff'; // slate-800 vs sky-50
  const accentColor = isNightMode ? '#a5f3fc' : '#bae6fd';

  switch (topicKey) {
    // --- PYTHON VISUALS ---
    case 'Python Basics':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="5" y="5" width="90" height="30" rx="6" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <path d="M25 20 L40 20 M35 15 L40 20 L35 25" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <text x="48" y="24" fontFamily="monospace" fontSize="10" fontWeight="bold" fill={isNightMode ? '#e2e8f0' : '#0f172a'}>print("Hello Python")</text>
        </svg>
      );
    case 'Variables':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="15" y="10" width="30" height="20" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="30" y="23" textAnchor="middle" fontFamily="monospace" fontSize="10" fontWeight="bold" fill={strokeColor}>x</text>
          <path d="M52 20 L60 20" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" fill="none" />
          <rect x="65" y="10" width="20" height="20" rx="4" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="75" y="23" textAnchor="middle" fontFamily="monospace" fontSize="10" fontWeight="bold" fill={isNightMode ? '#0f172a' : '#0369a1'}>10</text>
        </svg>
      );
    case 'Data Types':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="5" y="10" width="25" height="20" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="17.5" y="22" textAnchor="middle" fontFamily="sans-serif" fontSize="7" fontWeight="bold" fill={strokeColor}>int</text>
          <rect x="37.5" y="10" width="25" height="20" rx="4" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="50" y="22" textAnchor="middle" fontFamily="sans-serif" fontSize="7" fontWeight="bold" fill={isNightMode ? '#0f172a' : '#0369a1'}>str</text>
          <rect x="70" y="10" width="25" height="20" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="82.5" y="22" textAnchor="middle" fontFamily="sans-serif" fontSize="7" fontWeight="bold" fill={strokeColor}>bool</text>
        </svg>
      );
    case 'Operators':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <circle cx="20" cy="20" r="10" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="20" y="24" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fontWeight="bold" fill={strokeColor}>+</text>
          <circle cx="50" cy="20" r="10" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="50" y="24" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fontWeight="bold" fill={isNightMode ? '#0f172a' : '#0369a1'}>==</text>
          <circle cx="80" cy="20" r="10" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="80" y="24" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fontWeight="bold" fill={strokeColor}>%</text>
        </svg>
      );
    case 'Conditions':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <path d="M50 5 L70 20 L50 35 L30 20 Z" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="50" y="23" textAnchor="middle" fontFamily="sans-serif" fontSize="8" fontWeight="bold" fill={strokeColor}>IF / ELSE</text>
          <path d="M20 20 L30 20" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M70 20 L80 20" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'Loops':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <path d="M50 10 A 10 10 0 1 1 40 13" fill="none" stroke={strokeColor} strokeWidth="2" strokeDasharray="3,1" />
          <path d="M40 8 L40 14 L46 12 Z" fill={strokeColor} />
          <text x="50" y="24" textAnchor="middle" fontFamily="monospace" fontSize="8" fontWeight="bold" fill={isNightMode ? '#e2e8f0' : '#0f172a'}>for item in list:</text>
        </svg>
      );
    case 'Strings':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="10" y="10" width="80" height="20" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="50" y="23" textAnchor="middle" fontFamily="monospace" fontSize="10" fontWeight="bold" fill={strokeColor}>"P" + "y" + "t" + "h" + "o" + "n"</text>
        </svg>
      );
    case 'Lists':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="10" y="12" width="16" height="16" rx="3" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <rect x="30" y="12" width="16" height="16" rx="3" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
          <rect x="50" y="12" width="16" height="16" rx="3" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <rect x="70" y="12" width="16" height="16" rx="3" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="18" y="23" fontSize="8" fontFamily="monospace" fill={strokeColor}>[0]</text>
          <text x="38" y="23" fontSize="8" fontFamily="monospace" fill={isNightMode ? '#0f172a' : '#0369a1'}>[1]</text>
        </svg>
      );
    case 'Dictionaries':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="10" y="8" width="80" height="24" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="20" y="23" fontFamily="monospace" fontSize="8" fontWeight="bold" fill={strokeColor}>"key"</text>
          <path d="M42 20 L48 20" stroke={strokeColor} strokeWidth="1.5" />
          <text x="55" y="23" fontFamily="monospace" fontSize="8" fontWeight="bold" fill={isNightMode ? '#e2e8f0' : '#0f172a'}>"value"</text>
        </svg>
      );
    case 'Functions':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="35" y="8" width="30" height="24" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="50" y="22" textAnchor="middle" fontFamily="sans-serif" fontSize="8" fontWeight="bold" fill={strokeColor}>def func(x)</text>
          <path d="M10 20 L30 20" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M70 20 L90 20" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'Exceptions':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <path d="M50 5 L85 32 L15 32 Z" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" strokeLinejoin="round" />
          <text x="50" y="26" textAnchor="middle" fontFamily="sans-serif" fontSize="14" fontWeight="bold" fill={isNightMode ? '#fb7185' : '#e11d48'}>!</text>
          <text x="50" y="38" textAnchor="middle" fontFamily="monospace" fontSize="6" fill={isNightMode ? '#cbd5e1' : '#475569'}>try / except</text>
        </svg>
      );
    case 'File Handling':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="35" y="5" width="30" height="30" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <path d="M55 5 L55 15 L65 15" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <line x1="40" y1="20" x2="60" y2="20" stroke={strokeColor} strokeWidth="1.5" />
          <line x1="40" y1="26" x2="55" y2="26" stroke={strokeColor} strokeWidth="1.5" />
        </svg>
      );
    case 'Classes':
    case 'Objects':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="15" y="8" width="30" height="24" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" strokeDasharray="3,1" />
          <text x="30" y="22" textAnchor="middle" fontFamily="sans-serif" fontSize="8" fontWeight="bold" fill={strokeColor}>Class</text>
          <path d="M50 20 L60 20" stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="75" cy="20" r="10" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="75" y="23" textAnchor="middle" fontFamily="sans-serif" fontSize="7" fontWeight="bold" fill={isNightMode ? '#0f172a' : '#0369a1'}>Object</text>
        </svg>
      );
    case 'Encapsulation':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="35" y="15" width="30" height="20" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <path d="M42 15 L42 10 A 8 8 0 0 1 58 10 L58 15" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="50" cy="25" r="3" fill={strokeColor} />
        </svg>
      );
    case 'Inheritance':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="40" y="5" width="20" height="10" rx="2" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <rect x="15" y="25" width="20" height="10" rx="2" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
          <rect x="65" y="25" width="20" height="10" rx="2" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
          <path d="M50 15 L50 20 L25 20 L25 25 M50 20 L75 20 L75 25" fill="none" stroke={strokeColor} strokeWidth="1.5" />
        </svg>
      );
    case 'Polymorphism':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <circle cx="25" cy="20" r="10" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <rect x="65" y="10" width="20" height="20" rx="2" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
          <path d="M40 20 L60 20" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="3,1" />
        </svg>
      );
    case 'Abstraction':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="10" y="10" width="80" height="20" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="25" cy="20" r="3" fill={strokeColor} />
          <circle cx="50" cy="20" r="3" fill={strokeColor} />
          <circle cx="75" cy="20" r="3" fill={strokeColor} />
          <text x="50" y="38" textAnchor="middle" fontFamily="sans-serif" fontSize="6" fill={strokeColor}>Simple Interface</text>
        </svg>
      );
    case 'Iterators':
    case 'Generators':
    case 'Decorators':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <path d="M15 20 L35 20 A 15 15 0 0 1 65 20 L85 20" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="15" cy="20" r="3" fill={strokeColor} />
          <circle cx="50" cy="20" r="3" fill={accentColor} stroke={strokeColor} />
          <circle cx="85" cy="20" r="3" fill={strokeColor} />
        </svg>
      );

    case 'Linux Overview':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="5" y="5" width="90" height="30" rx="6" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="12" cy="11" r="1.5" fill="#ef4444" />
          <circle cx="17" cy="11" r="1.5" fill="#f59e0b" />
          <circle cx="22" cy="11" r="1.5" fill="#10b981" />
          <path d="M12 22 L18 25 L12 28" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="21" y1="28" x2="30" y2="28" stroke={strokeColor} strokeWidth="1.5" />
          <text x="35" y="27" fontFamily="monospace" fontSize="8" fontWeight="bold" fill={isNightMode ? '#cbd5e1' : '#475569'}>root@linux:~#</text>
        </svg>
      );
    // --- GIT VISUALS ---
    case 'Git Overview':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="5" y="5" width="90" height="30" rx="6" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="20" cy="20" r="4" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <line x1="24" y1="20" x2="46" y2="20" stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="50" cy="20" r="4" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
          <path d="M20 20 C 35 20, 35 10, 50 10" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="50" cy="10" r="4" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <line x1="54" y1="20" x2="76" y2="20" stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="80" cy="20" r="4" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
          <path d="M50 10 C 65 10, 65 20, 80 20" fill="none" stroke={strokeColor} strokeWidth="1.5" />
        </svg>
      );
    case 'GitHub':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="5" y="5" width="90" height="30" rx="6" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <path d="M30 25 A 8 8 0 0 1 40 15 A 12 12 0 0 1 65 15 A 8 8 0 0 1 75 25 Z" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="52" cy="22" r="5" fill={accentColor} stroke={strokeColor} strokeWidth="1" />
          <line x1="52" y1="27" x2="52" y2="33" stroke={strokeColor} strokeWidth="1.5" />
          <rect x="42" y="31" width="20" height="4" rx="1" fill={fillColor} stroke={strokeColor} strokeWidth="1" />
        </svg>
      );
    case 'Git Branching':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="5" y="5" width="90" height="30" rx="6" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <line x1="15" y1="25" x2="85" y2="25" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
          <circle cx="30" cy="25" r="3.5" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="70" cy="25" r="3.5" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <path d="M30 25 C 45 25, 45 12, 60 12 L 80 12" fill="none" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="3,1" />
          <circle cx="60" cy="12" r="3.5" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
        </svg>
      );
    case 'Git Commits':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="5" y="5" width="90" height="30" rx="6" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <line x1="15" y1="18" x2="85" y2="18" stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="25" cy="18" r="4" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="50" cy="18" r="4" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="75" cy="18" r="4" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="25" y="30" textAnchor="middle" fontSize="6" fontFamily="monospace" fill={strokeColor}>C1</text>
          <text x="50" y="30" textAnchor="middle" fontSize="6" fontFamily="monospace" fill={strokeColor}>C2</text>
          <text x="75" y="30" textAnchor="middle" fontSize="6" fontFamily="monospace" fill={strokeColor}>C3</text>
        </svg>
      );
    case 'Git Remote':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="5" y="5" width="90" height="30" rx="6" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <rect x="15" y="12" width="22" height="15" rx="2" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <line x1="10" y1="27" x2="42" y2="27" stroke={strokeColor} strokeWidth="2" />
          <path d="M37 20 L63 20" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="2,2" strokeLinecap="round" />
          <path d="M60 17 L63 20 L60 23" fill="none" stroke={strokeColor} strokeWidth="1.5" />
          <rect x="63" y="12" width="22" height="15" rx="2" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="26" y="21" textAnchor="middle" fontSize="5" fill={strokeColor}>Local</text>
          <text x="74" y="21" textAnchor="middle" fontSize="5" fill={isNightMode ? '#0f172a' : '#0369a1'}>Remote</text>
        </svg>
      );

    // --- KUBERNETES VISUALS ---
    case 'Kubernetes Overview':
    case 'Helm':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <circle cx="50" cy="20" r="10" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <path d="M50 5 L50 35 M35 20 L65 20 M39 9 L61 31 M39 31 L61 9" stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <circle cx="50" cy="20" r="4" fill={accentColor} stroke={strokeColor} strokeWidth="1" />
        </svg>
      );
    case 'Architecture':
    case 'Control Plane':
    case 'Worker Nodes':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="5" y="12" width="25" height="16" rx="3" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="17.5" y="22" textAnchor="middle" fontSize="6" fontWeight="bold" fill={strokeColor}>Control</text>
          <path d="M30 20 L45 10 M30 20 L45 30" stroke={strokeColor} strokeWidth="1" strokeDasharray="2,2" fill="none" />
          <rect x="45" y="4" width="25" height="12" rx="2" fill={accentColor} stroke={strokeColor} strokeWidth="1" />
          <text x="57.5" y="12" textAnchor="middle" fontSize="5" fontWeight="bold" fill={isNightMode ? '#0f172a' : '#0369a1'}>Node 1</text>
          <rect x="45" y="24" width="25" height="12" rx="2" fill={accentColor} stroke={strokeColor} strokeWidth="1" />
          <text x="57.5" y="32" textAnchor="middle" fontSize="5" fontWeight="bold" fill={isNightMode ? '#0f172a' : '#0369a1'}>Node 2</text>
        </svg>
      );
    case 'Pods':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="25" y="8" width="50" height="24" rx="12" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="40" cy="20" r="4" fill={accentColor} stroke={strokeColor} strokeWidth="1" />
          <circle cx="50" cy="20" r="4" fill={accentColor} stroke={strokeColor} strokeWidth="1" />
          <circle cx="60" cy="20" r="4" fill={accentColor} stroke={strokeColor} strokeWidth="1" />
          <text x="50" y="38" textAnchor="middle" fontSize="6" fontWeight="bold" fill={strokeColor}>Pod (Containers)</text>
        </svg>
      );
    case 'Services':
    case 'Networking':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <circle cx="20" cy="20" r="6" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="20" y="23" textAnchor="middle" fontSize="8" fontWeight="bold" fill={strokeColor}>S</text>
          <path d="M26 20 L50 10 M26 20 L50 20 M26 20 L50 30" stroke={strokeColor} strokeWidth="1" fill="none" />
          <circle cx="56" cy="10" r="4" fill={accentColor} stroke={strokeColor} strokeWidth="1" />
          <circle cx="56" cy="20" r="4" fill={accentColor} stroke={strokeColor} strokeWidth="1" />
          <circle cx="56" cy="30" r="4" fill={accentColor} stroke={strokeColor} strokeWidth="1" />
        </svg>
      );
    case 'Deployments':
    case 'ReplicaSets':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="20" y="12" width="20" height="16" rx="2" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <rect x="25" y="8" width="20" height="16" rx="2" fill={accentColor} stroke={strokeColor} strokeWidth="1.2" />
          <rect x="30" y="4" width="20" height="16" rx="2" fill={isNightMode ? '#0e7490' : '#bae6fd'} stroke={strokeColor} strokeWidth="1" />
          <text x="68" y="24" fontSize="8" fontWeight="bold" fill={strokeColor}>Replicas: 3</text>
        </svg>
      );
    case 'ConfigMaps':
    case 'Secrets':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="35" y="6" width="30" height="28" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <line x1="42" y1="14" x2="58" y2="14" stroke={strokeColor} strokeWidth="1.5" />
          <line x1="42" y1="20" x2="52" y2="20" stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="50" cy="26" r="3" fill={accentColor} stroke={strokeColor} strokeWidth="1" />
        </svg>
      );
    case 'Namespaces':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="15" y="6" width="30" height="28" rx="3" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <rect x="55" y="6" width="30" height="28" rx="3" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="30" y="22" textAnchor="middle" fontSize="6" fontWeight="bold" fill={strokeColor}>ns-1</text>
          <text x="70" y="22" textAnchor="middle" fontSize="6" fontWeight="bold" fill={isNightMode ? '#0f172a' : '#0369a1'}>ns-2</text>
        </svg>
      );
    case 'Volumes':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <ellipse cx="50" cy="12" rx="15" ry="5" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <path d="M35 12 L35 28 A 15 5 0 0 0 65 28 L65 12" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <ellipse cx="50" cy="20" rx="15" ry="5" fill={accentColor} stroke={strokeColor} strokeWidth="1" />
          <ellipse cx="50" cy="28" rx="15" ry="5" fill={accentColor} stroke={strokeColor} strokeWidth="1" />
        </svg>
      );
    case 'Ingress':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="10" y="10" width="20" height="20" rx="3" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <text x="20" y="22" textAnchor="middle" fontSize="6" fontWeight="bold" fill={strokeColor}>Ingress</text>
          <path d="M30 20 L55 12 M30 20 L55 28" stroke={strokeColor} strokeWidth="1" fill="none" />
          <rect x="55" y="4" width="30" height="12" rx="2" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
          <rect x="55" y="24" width="30" height="12" rx="2" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
        </svg>
      );
    case 'Monitoring':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="10" y="5" width="80" height="30" rx="4" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <path d="M15 28 L30 15 L45 22 L60 8 L75 25 L85 12" fill="none" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="60" cy="8" r="3" fill={accentColor} stroke={strokeColor} strokeWidth="1" />
        </svg>
      );
    case 'Security':
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <path d="M50 5 C60 5 70 8 75 12 C75 24 65 32 50 35 C35 32 25 24 25 12 C30 8 40 5 50 5 Z" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="50" cy="18" r="4" fill={accentColor} stroke={strokeColor} strokeWidth="1" />
          <path d="M50 22 L50 28" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 100 40" className="w-full max-h-32 object-contain my-4">
          <rect x="5" y="5" width="90" height="30" rx="6" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="30" cy="20" r="8" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
          <circle cx="70" cy="20" r="8" fill={fillColor} stroke={strokeColor} strokeWidth="1.5" />
        </svg>
      );
  }
};

const getVisualKey = (title: string, desc: string, isK8s: boolean, isGit?: boolean, isReact?: boolean, isLinux?: boolean): string => {
  const searchStr = `${title} ${desc}`.toLowerCase();

  if (isReact) {
    return 'Default';
  }

  if (isLinux) {
    return 'Linux Overview';
  }

  if (isGit) {
    if (searchStr.includes('github') || searchStr.includes('remote')) {
      if (searchStr.includes('push') || searchStr.includes('pull') || searchStr.includes('clone') || searchStr.includes('fetch')) {
        return 'Git Remote';
      }
      return 'GitHub';
    }
    if (searchStr.includes('branch') || searchStr.includes('merge') || searchStr.includes('conflict')) return 'Git Branching';
    if (searchStr.includes('commit') || searchStr.includes('stage') || searchStr.includes('add') || searchStr.includes('log') || searchStr.includes('init')) return 'Git Commits';
    return 'Git Overview';
  }

  if (isK8s) {
    if (searchStr.includes('ingress') || searchStr.includes('routing')) return 'Ingress';
    if (searchStr.includes('service') || searchStr.includes('network') || searchStr.includes('port')) return 'Services';
    if (searchStr.includes('replicaset') || searchStr.includes('hpa') || searchStr.includes('scale')) return 'ReplicaSets';
    if (searchStr.includes('deployment') || searchStr.includes('rollout')) return 'Deployments';
    if (searchStr.includes('secret')) return 'Secrets';
    if (searchStr.includes('configmap')) return 'ConfigMaps';
    if (searchStr.includes('volume') || searchStr.includes('pv') || searchStr.includes('storage')) return 'Volumes';
    if (searchStr.includes('namespace')) return 'Namespaces';
    if (searchStr.includes('pod') || searchStr.includes('container')) return 'Pods';
    if (searchStr.includes('control plane') || searchStr.includes('scheduler') || searchStr.includes('etcd')) return 'Control Plane';
    if (searchStr.includes('worker') || searchStr.includes('kubelet')) return 'Worker Nodes';
    if (searchStr.includes('architecture')) return 'Architecture';
    if (searchStr.includes('monitoring') || searchStr.includes('log') || searchStr.includes('prometheus')) return 'Monitoring';
    if (searchStr.includes('security') || searchStr.includes('rbac') || searchStr.includes('access')) return 'Security';
    if (searchStr.includes('helm') || searchStr.includes('package')) return 'Helm';
    return 'Kubernetes Overview';
  } else {
    if (searchStr.includes('project') || searchStr.includes('management project')) return 'OOP Projects';
    if (searchStr.includes('decorator')) return 'Decorators';
    if (searchStr.includes('generator')) return 'Generators';
    if (searchStr.includes('iterator')) return 'Iterators';
    if (searchStr.includes('abstraction')) return 'Abstraction';
    if (searchStr.includes('polymorphism') || searchStr.includes('override')) return 'Polymorphism';
    if (searchStr.includes('inheritance')) return 'Inheritance';
    if (searchStr.includes('encapsulation') || searchStr.includes('private')) return 'Encapsulation';
    if (searchStr.includes('class') && !searchStr.includes('subclass')) return 'Classes';
    if (searchStr.includes('object') || searchStr.includes('instance')) return 'Objects';
    if (searchStr.includes('file') || searchStr.includes('open(') || searchStr.includes('csv')) return 'File Handling';
    if (searchStr.includes('exception') || searchStr.includes('try') || searchStr.includes('except')) return 'Exceptions';
    if (searchStr.includes('function') || searchStr.includes('def ')) return 'Functions';
    if (searchStr.includes('dictionary') || searchStr.includes('dict') || searchStr.includes('key')) return 'Dictionaries';
    if (searchStr.includes('list') || searchStr.includes('set') || searchStr.includes('tuple') || searchStr.includes('collection')) return 'Lists';
    if (searchStr.includes('string') || searchStr.includes('slice') || searchStr.includes('index')) return 'Strings';
    if (searchStr.includes('loop') || searchStr.includes('for') || searchStr.includes('while')) return 'Loops';
    if (searchStr.includes('condition') || searchStr.includes('if') || searchStr.includes('else')) return 'Conditions';
    if (searchStr.includes('operator') || searchStr.includes('arithmetic')) return 'Operators';
    if (searchStr.includes('type') || searchStr.includes('float') || searchStr.includes('int') || searchStr.includes('bool')) return 'Data Types';
    if (searchStr.includes('variable') || searchStr.includes('identifier')) return 'Variables';
    return 'Python Basics';
  }
};

// ---------------------------------------------------------------------
// 🔍 FLOWCHART & TABLE & QUESTION RENDERERS
// ---------------------------------------------------------------------
const FlowchartRenderer: React.FC<{ lines: string[]; isNightMode: boolean }> = ({ lines, isNightMode }) => {
  const raw = lines.join('\n');
  return (
    <GamifiedArchitectureFlow
      rawContent={raw}
      isNightMode={isNightMode}
      title="Architecture & Workflow Simulation"
    />
  );
};

const TableRenderer: React.FC<{ lines: string[]; isNightMode: boolean }> = ({ lines, isNightMode }) => {
  const rows = lines.map(line => {
    const separator = line.includes('|') ? '|' : '│';
    return line.split(separator).map(cell => cell.trim()).filter(Boolean);
  }).filter(row => row.length > 0);

  if (rows.length === 0) return null;

  const headers = rows[0];
  const bodyRows = rows.slice(1);

  return (
    <div className="overflow-x-auto my-6 rounded-2xl border border-sky-100 dark:border-slate-800">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className={isNightMode ? 'bg-slate-900' : 'bg-sky-50/50'}>
            {headers.map((h, i) => (
              <th key={i} className={`p-3 font-semibold border-b ${isNightMode ? 'border-slate-800 text-white' : 'border-sky-100 text-sky-900'}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, ri) => (
            <tr key={ri} className={`hover:bg-slate-900/10 ${ri % 2 === 0 ? (isNightMode ? 'bg-slate-950/20' : 'bg-slate-50/30') : ''}`}>
              {row.map((cell, ci) => (
                <td key={ci} className={`p-3 border-b ${isNightMode ? 'border-slate-900 text-slate-350' : 'border-sky-50 text-slate-700'}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TaskCard: React.FC<{
  title: string;
  content: string;
  isNightMode: boolean;
}> = ({ title, content, isNightMode }) => {
  const cleanTitle = title.trim();
  const cleanContent = content.trim();

  return (
    <div className={`my-5 rounded-2xl border p-4 sm:p-5 transition-all shadow-xs ${
      isNightMode
        ? 'bg-slate-900/60 border-slate-800 text-slate-200'
        : 'bg-amber-50/40 border-amber-200/70 text-slate-800'
    }`}>
      <div className="flex items-center gap-2 font-mono text-xs sm:text-sm font-black text-amber-500 tracking-wider uppercase">
        <span className="p-1 rounded bg-amber-500/10 text-amber-500 font-bold">⚡</span>
        <span>{cleanTitle}</span>
      </div>
      {cleanContent && (
        <div className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 pl-1">
          {formatInlineStyles(cleanContent, isNightMode)}
        </div>
      )}
    </div>
  );
};

const NumberedItem: React.FC<{
  number: string;
  text: string;
  isNightMode: boolean;
}> = ({ number, text, isNightMode }) => {
  return (
    <div className="flex items-start gap-3 ml-1 my-2.5 text-sm sm:text-base leading-relaxed">
      <span className="shrink-0 w-6 h-6 rounded-lg bg-primary/10 text-primary border border-primary/20 font-mono text-xs font-bold flex items-center justify-center mt-0.5">
        {number}
      </span>
      <span className={isNightMode ? 'text-slate-200' : 'text-slate-750'}>
        {formatInlineStyles(text, isNightMode)}
      </span>
    </div>
  );
};

const QuestionCard: React.FC<{
  question: string;
  answer: string[];
  isNightMode: boolean;
  isK8s?: boolean;
  isGit?: boolean;
  isReact?: boolean;
  isLinux?: boolean;
}> = ({ question, answer, isNightMode, isK8s = false, isGit = false, isReact = false, isLinux = false }) => {
  const cleanQ = question.trim();
  const cleanAnswerLines = answer
    .map((ans) => ans.trim().replace(/```(?:bash|sh|cmd|yaml|json|python|js|jsx|sql|c|java)?/g, '').trim())
    .filter(Boolean);

  return (
    <div className={`my-6 rounded-2xl border p-4 sm:p-5 transition-all shadow-xs ${
      isNightMode 
        ? 'bg-slate-900/80 border-slate-800 text-slate-200 shadow-[0_0_12px_rgba(0,0,0,0.3)]' 
        : 'bg-sky-50/50 border-sky-100/80 text-slate-800 shadow-sm'
    }`}>
      {/* Bold Question Header */}
      <div className="flex items-start gap-2.5">
        <span className="shrink-0 text-primary text-base">❓</span>
        <h4 className="text-sm sm:text-base font-heading font-bold text-primary leading-snug">
          {cleanQ}
        </h4>
      </div>

      {/* Visually Separated Answer Section */}
      {cleanAnswerLines.length > 0 && (
        <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
          <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
            Answer:
          </div>
          <div className="space-y-2 pl-1">
            {cleanAnswerLines.map((ansLine, idx) => {
              let trimmed = ansLine.replace(/^answer:\s*/i, '').trim();
              if (!trimmed || trimmed.toLowerCase() === 'answer:') return null;

              if (isCodeLine(trimmed, isK8s, isGit, isReact, isLinux)) {
                return (
                  <div key={idx} className="my-2">
                    <CodeBlock
                      code={trimmed}
                      language={isReact ? 'jsx' : (isGit || isLinux ? 'bash' : (isK8s ? 'yaml' : 'python'))}
                    />
                  </div>
                );
              }

              if (trimmed.startsWith('●') || trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                const cleanText = trimmed.replace(/^[-*•●]\s*/, '');
                return (
                  <div key={idx} className="flex items-start gap-2 ml-1 my-1.5 text-xs sm:text-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" />
                    <span>{formatInlineStyles(cleanText, isNightMode)}</span>
                  </div>
                );
              }

              return (
                <p key={idx} className="text-xs sm:text-sm leading-relaxed my-1 font-normal text-slate-700 dark:text-slate-300">
                  {formatInlineStyles(trimmed, isNightMode)}
                </p>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------
// 📦 HELPER FUNCTIONS FOR PYTHON & KUBERNETES PARSING
// ---------------------------------------------------------------------
function isCodeLine(line: string, isK8s: boolean, isGit?: boolean, isReact?: boolean, isLinux?: boolean): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  if (isReact) {
    const reactPatterns = [
      /^\s*(import|export|const|let|var|function|return|class|extends)\b/,
      /^\s*<\/?([A-Za-z][A-Za-z0-9]*|[a-z]+)\b/,
      /^\s*(console\.log|useState|useEffect|useContext|useRef|useMemo|useCallback)\b/,
      /^\s*(npm\s+(install|run|create|init)|npx\s+|node\s+-v|npm\s+-v|cd\s+react-app)\b/,
      /^\s*onClick\s*=\s*/,
      /^[[{}(）]\s*.*$/, // Matches starting with braces/brackets
      /^\s*props\./,
      /^\s*<\/?\s*>?\s*$/,
      /^\s*\b(ReactDOM|React)\b/,
      /^\s*<\/?[a-zA-Z0-9_\s"'={}.]+>?\s*$/, // XML/JSX tags
      /^[a-zA-Z0-9_$]+\s*(\+|-|\*|\/|%|\*\*|\/\/)?=\s*.+/, // Assignments like x = y
      /^\s*(?:{|\s*\}\s*|\s*\);\s*|\s*\}\s*\);\s*)$/, // lonely closing brackets/braces
      /^\s*(react-app\/|├──\s*node_modules|└──\s*src\/)/
    ];
    return reactPatterns.some(regex => regex.test(line));
  }

  if (isLinux) {
    const linuxPatterns = [
      /^\s*(git|mkdir|cd|touch|cat|echo|sudo|apt|dnf|brew|rm|tar|unzip|chmod|chown|docker|kubectl|minikube|pwd|ls|grep|systemctl|useradd|groupadd|usermod|passwd|chage|setfacl|getfacl|df|du|find|awk|sed|head|tail|who|cut|uniq|sort|wc|ssh|ufw|iptables|journalctl|ssh-keygen|ssh-copy-id|ping|ifconfig|ip|netstat|ss|curl|wget|nslookup|dig|sysctl|uname|top|htop|ps|kill|pkill|killall|crontab|lsof|fdisk|mkfs|mount|umount)\b/,
      /^\s*#\s+.+$/,
      /^\s*(host|Client Version)\s*:/i,
    ];
    return linuxPatterns.some(regex => regex.test(line));
  }
  
  if (isGit) {
    const gitPatterns = [
      /^\s*(git|mkdir|cd|touch|cat|echo|sudo|apt|dnf|brew|rm|tar|unzip|chmod|chown|docker|kubectl|minikube)\b/,
      /^\s*(commit\s+[0-9a-f]{6,}|Author:|Date:)/i,
      /^\s*(On branch|No commits yet|Untracked files:|nothing added to commit|Changes to be committed:|Changes not staged for commit:)/i,
      /^\s*(Initialized empty Git repository|MyProject\/|\.git\/|objects\/|refs\/|hooks\/|config|HEAD|index|package\.json|index\.html|style\.css|app\.js)\b/,
      /^\s*[\w\-./]+\s*│\s*▼/,
      /^\s*[\w\-./]+\s*──────*→/,
      /^\s*#\s+.+$/,
      /^\s*(\*?\s*)(main|master|login|payment|authentication|feature\/profile|feature\/cart)\s*$/,
      /^\s*(host|kubelet|apiserver|kubeconfig|minikube|Client Version)\s*:/i,
      /^\s*(NAME\s+STATUS\s+ROLES\s+AGE|minikube\s+Ready\s+control-plane)/,
      /^\s*(Docker version|Client Version:)/i,
    ];
    return gitPatterns.some(regex => regex.test(line));
  }
  
  if (isK8s) {
    const k8sPatterns = [
      /^\s*(apiVersion|kind|metadata|spec|status|selector|labels|containers|resources|ports|env|volumes|volumeMounts|template|replicas|rules|http|paths|backend|service|port|rules|data|stringData)\s*:/,
      /^\s*-\s+(name|image|containerPort|hostPath|mountPath|claimName|port|protocol|path|host|value|configMapRef|secretRef)\b/,
      /^\s*(kubectl|minikube|helm|docker|systemctl|cat|echo|cd|sudo|apt-get|curl|wget)\b/,
      /^\s*#\s+.+$/,
      /^\s*"""\s*$/,
      /^\s*["'].*["']\s*$/,
      /^[[{]\s*.*[\]}]$/,
      /:$/,
    ];
    return k8sPatterns.some(regex => regex.test(line));
  } else {
    const pythonPatterns = [
      /^\s*(def|class|import|from|return|pass|try|except|finally|raise|assert|yield|print|input)\b/,
      /^\s*(if|elif|else|for|while)\b.*:$/,
      /^\s*[a-zA-Z_]\w*\s*(\+|-|\*|\/|%|\*\*|\/\/)?=\s*.+/,
      /^[a-zA-Z_]\w*\.[a-zA-Z_]\w*\(.*\)$/,
      /^\s*#\s+.+$/,
      /^\s*"""\s*$/,
      /^\s*["'].*["']\s*$/,
      /^[[{]\s*.*[\]}]$/,
    ];
    return pythonPatterns.some(regex => regex.test(line));
  }
}

function splitInlineCodeStatements(line: string, isK8s: boolean): string[] {
  if (isK8s) return [line];
  if (line.includes('  ')) {
    const parts = line.split(/\s{2,}/).map(p => p.trim()).filter(Boolean);
    const allCode = parts.every(part => isCodeLine(part, isK8s));
    if (allCode && parts.length > 1) {
      return parts;
    }
  }
  return [line];
}

function formatInlineStyles(text: string, isNightMode: boolean): React.ReactNode {
  if (!text) return null;
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className={`px-1.5 py-0.5 rounded-md font-mono text-xs ${
          isNightMode ? 'bg-slate-900 text-cyan-300 border border-slate-800' : 'bg-sky-50 text-sky-700 border border-sky-100'
        }`}>
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="italic">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

const InteractiveConceptCard: React.FC<{ text: string; isWarning: boolean; isNightMode: boolean }> = ({ text, isWarning, isNightMode }) => {
  const cleanText = text.replace(/^(note|warning|mistake|tip|important):\s*/i, '');
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [isExpanded, setIsExpanded] = useState(isReduced);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    soundService.play('select');
  };

  const shouldTruncate = cleanText.length > 120;
  const displayText = (!isExpanded && shouldTruncate) 
    ? cleanText.substring(0, 120) + '...' 
    : cleanText;

  return (
    <div
      onClick={!isReduced ? handleToggle : undefined}
      className={`p-4 rounded-2xl border flex items-start gap-3 my-4 leading-relaxed transition-all duration-300 cursor-pointer ${
        isReduced ? '' : 'hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(249,115,22,0.15)] active:scale-[0.99]'
      } ${
        isWarning
          ? 'bg-rose-955/15 border-rose-900/50 text-rose-200'
          : 'bg-amber-955/15 border-amber-900/50 text-amber-200'
      }`}
    >
      {isWarning ? (
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
      ) : (
        <Lightbulb className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
      )}
      <div className="space-y-1 flex-1">
        <div className="flex items-center justify-between w-full">
          <span className="text-[10px] font-black uppercase tracking-widest font-mono">
            {isWarning ? '⚠️ WARNING / IMPORTANT' : '💡 TIP / BEST PRACTICE'}
          </span>
          {!isReduced && shouldTruncate && (
            <span className="text-[9px] font-mono font-black uppercase text-primary tracking-wider hover:underline">
              {isExpanded ? '[ 📘 COLLAPSE ]' : '[ 📖 DETAILS ]'}
            </span>
          )}
        </div>
        <span className="text-sm font-medium block transition-all duration-200">
          {formatInlineStyles(displayText, isNightMode)}
        </span>
      </div>
    </div>
  );
};

const InteractiveExampleCard: React.FC<{ title: string; isNightMode: boolean; children: React.ReactNode }> = ({ title, isNightMode, children }) => {
  const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [isRevealed, setIsRevealed] = useState(isReduced);

  const handleReveal = () => {
    setIsRevealed(true);
    soundService.play('unlock');
  };

  return (
    <div
      className={`p-5 rounded-2xl border my-4 leading-relaxed transition-all duration-300 ${
        isNightMode 
          ? 'bg-primary/5 border-primary/20 text-slate-100' 
          : 'bg-primary/5 border-primary/10 text-slate-800'
      } ${isRevealed ? 'shadow-[0_0_15px_var(--color-primary-glow)]' : ''}`}
    >
      <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase tracking-widest text-primary font-mono border-b border-primary/10 pb-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>💡 EXAMPLE MISSION</span>
        </div>
        {isRevealed ? (
          <span className="text-emerald-450 font-black animate-pulse">
            ✓ EXAMPLE UNDERSTOOD
          </span>
        ) : (
          <span className="text-primary font-black animate-pulse">
            ⚡ LOCKED
          </span>
        )}
      </div>

      {isRevealed ? (
        <div className="space-y-4 text-sm font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-2 duration-305">
          <div className="text-sm font-black mb-2 text-primary">
            {formatInlineStyles(title, isNightMode)}
          </div>
          {children}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 border border-dashed border-primary/20 rounded-xl bg-primary/2">
          <button
            onClick={handleReveal}
            className="bg-linear-to-r from-primary to-secondary text-slate-955 font-mono text-[9px] font-black py-2 px-4 rounded-xl cursor-pointer active:scale-95 transition-all shadow-[0_0_8px_var(--color-primary)]"
          >
            [ REVEAL EXPLANATION ]
          </button>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------
// 🚀 MAIN LMS COURSE RENDERER COMPONENT
// ---------------------------------------------------------------------
export const LmsCourseRenderer: React.FC<LmsCourseRendererProps> = ({ content, isNightMode = false, courseId }) => {
  const isK8s = courseId === 'kubernetes-complete-course-beginner-to-advanced';
  const isGit = courseId === 'git-github-mastery-course-id' || courseId === 'git-github-mastery';
  const isDbms = courseId === 'database-management-system' || (courseId || '').toLowerCase().includes('dbms') || (courseId || '').toLowerCase().includes('database');
  const isReact = (courseId || '').toLowerCase().includes('react');
  const isLinux = courseId === 'course_linux_101';

  const blocks = useMemo(() => {
    let cleanContent = content
      .replace(/\r/g, '')
      .trim();

    if (isLinux) {
      cleanContent = cleanContent
        .replace(/\n+\s*([↓→│▼])\s*\n+/g, '\n$1\n')
        .replace(/\n+\s*([↓→│▼])\s*\n+/g, '\n$1\n');
    }

    // Dynamically heal Python Module 1 to skip Page 5 Table of Contents (TOC) index page
    if (!isK8s && !isGit && !isReact && !isLinux && !isDbms && cleanContent.includes('Module') && cleanContent.includes('15:')) {
      const headingMatch = cleanContent.match(/(🐍\s*)?Module\s+1\s*:/i);
      if (headingMatch && headingMatch.index !== undefined) {
        cleanContent = cleanContent.slice(headingMatch.index);
      }
    }

    // 1. Pre-normalize tasks: "Task 1 ... Task 2 ... Task 3" -> separate lines
    cleanContent = cleanContent.replace(/(\S)\s+(Task\s+\d+\b)/gi, '$1\n$2');
    cleanContent = cleanContent.replace(/(\S)\s+(Scenario\s+\d+\b)/gi, '$1\n$2');
    cleanContent = cleanContent.replace(/(\S)\s+(Practical\s+Task\s+\d+\b)/gi, '$1\n$2');
    cleanContent = cleanContent.replace(/(\S)\s+(Lab\s+Task\s+\d+\b)/gi, '$1\n$2');

    // 2. Pre-normalize numbered lists & questions: "1. First point 2. Second point" -> separate lines
    cleanContent = cleanContent.replace(/(\S)\s+(\d+\.\s+)/g, '$1\n$2');

    // 3. Pre-normalize inline Q1. Q2. Q3.
    cleanContent = cleanContent.replace(/(\S)\s+(Q\d+\.?\s+)/gi, '$1\n$2');

    // 4. Pre-normalize Question and Answer if on the same line: "1. What is Git? Answer: ..."
    cleanContent = cleanContent.replace(/(\?|[a-zA-Z0-9])\s+(Answer\s*:)/gi, '$1\n$2');

    // 5. Pre-normalize bullets with ●, •, ✔, ❌
    cleanContent = cleanContent.replace(/(\S)\s+([●•✔❌]\s*)/g, '$1\n$2');

    let lines = cleanContent.split('\n');

    // Pass: Clean inline/malformed fenced markdown and single-line fence blocks
    let cleanFenceLines: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Inline fence: ```bash Git is a distributed version control system ```
      if (trimmed.startsWith('```') && trimmed.endsWith('```') && trimmed.length > 6) {
        const cleaned = trimmed.replace(/^```(?:[a-zA-Z0-9_-]+)?\s*/, '').replace(/\s*```$/, '');
        cleanFenceLines.push(cleaned);
        continue;
      }

      // Single-line fence spanning 3 lines (opening, content, closing)
      if (trimmed.startsWith('```') && !trimmed.endsWith('```')) {
        if (i + 2 < lines.length && lines[i + 2].trim() === '```') {
          const contentLine = lines[i + 1];
          cleanFenceLines.push(contentLine);
          i += 2;
          continue;
        }
      }

      cleanFenceLines.push(line);
    }
    lines = cleanFenceLines;

    const parsedBlocks: any[] = [];
    
    let inCodeBlock = false;
    let codeBuffer: string[] = [];
    let codeLang = 'bash';

    let currentCodeLines: string[] = [];
    let currentFlowchartLines: string[] = [];
    let currentTableLines: string[] = [];
    let currentTextLines: string[] = [];
    
    let currentQuestion: { title: string; lines: string[] } | null = null;
    let currentTask: { title: string; lines: string[] } | null = null;

    const flushText = () => {
      if (currentTextLines.length > 0) {
        const collapsedText = currentTextLines.join(' ').replace(/\s+/g, ' ').trim();
        if (collapsedText) {
          parsedBlocks.push({ type: 'text', text: collapsedText });
        }
        currentTextLines = [];
      }
    };

    const flushCodeBlock = () => {
      if (currentCodeLines.length > 0) {
        parsedBlocks.push({ type: 'code', code: currentCodeLines.join('\n') });
        currentCodeLines = [];
      }
    };

    const flushFlowchartBlock = () => {
      if (currentFlowchartLines.length > 0) {
        parsedBlocks.push({ type: 'flowchart', lines: [...currentFlowchartLines] });
        currentFlowchartLines = [];
      }
    };

    const flushTableBlock = () => {
      if (currentTableLines.length > 0) {
        parsedBlocks.push({ type: 'table', lines: [...currentTableLines] });
        currentTableLines = [];
      }
    };

    const flushQuestionBlock = () => {
      if (currentQuestion) {
        parsedBlocks.push({
          type: 'question',
          question: currentQuestion.title,
          answer: [...currentQuestion.lines]
        });
        currentQuestion = null;
      }
    };

    const flushTaskBlock = () => {
      if (currentTask) {
        parsedBlocks.push({
          type: 'task',
          title: currentTask.title,
          content: currentTask.lines.join('\n').trim()
        });
        currentTask = null;
      }
    };

    const flushAllAccumulators = () => {
      flushText();
      flushCodeBlock();
      flushFlowchartBlock();
      flushTableBlock();
      flushTaskBlock();
      flushQuestionBlock();
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (/===== PDF PAGE \d+ =====/.test(trimmed)) {
        continue;
      }

      if (trimmed.startsWith('```')) {
        if (inCodeBlock) {
          parsedBlocks.push({ type: 'code', code: codeBuffer.join('\n'), lang: codeLang });
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          flushAllAccumulators();
          inCodeBlock = true;
          codeLang = trimmed.replace('```', '').trim() || 'bash';
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      if (!trimmed) {
        if (currentQuestion) {
          currentQuestion.lines.push('');
        } else if (currentTask) {
          currentTask.lines.push('');
        } else {
          flushAllAccumulators();
        }
        continue;
      }

      // 1. Heading check
      const isMarkdownHeading = trimmed.startsWith('#');
      const isModuleTitleHeading = /^Module\s+\d+\s*[:—]/i.test(trimmed);
      const isSpecialSectionHeading = /^(interview questions|top interview questions|practical lab|practical tasks|practical exercise|real-time scenario|common mistakes|common misconceptions)\b/i.test(trimmed);

      if (isMarkdownHeading || isModuleTitleHeading || isSpecialSectionHeading) {
        flushAllAccumulators();
        if (isMarkdownHeading) {
          const level = trimmed.match(/^#+/)?.[0].length || 1;
          const headerText = trimmed.replace(/^#+\s*/, '').replace(/\s*#+$/, '').trim();
          parsedBlocks.push({ type: 'heading', text: headerText, level });
        } else {
          parsedBlocks.push({ type: 'heading', text: trimmed, level: isModuleTitleHeading ? 1 : 2 });
        }
        continue;
      }

      // 2. Subheading check (e.g. 1.1 Introduction)
      if (/^\d+\.\d+\s+/.test(trimmed)) {
        flushAllAccumulators();
        parsedBlocks.push({ type: 'subheading', text: trimmed });
        continue;
      }

      // 3. Task check (e.g. "Task 1", "Task 1: Install Node.js", "Scenario 1")
      const taskMatch = trimmed.match(/^(Task\s+\d+|TASK\s+\d+|Scenario\s+\d+|Practical\s+Task\s+\d+|Lab\s+Task\s+\d+|Exercise\s+\d+)\b(?:\s*[:—-])?\s*(.*)$/i);
      if (taskMatch) {
        flushAllAccumulators();
        currentTask = {
          title: taskMatch[1].toUpperCase(),
          lines: taskMatch[2] ? [taskMatch[2]] : []
        };
        continue;
      }

      // 4. Interview Question check (e.g. "Q1. What is Linux?", "1. What is Git?", "1. What is React?")
      const explicitQMatch = trimmed.match(/^\s*Q(\d+)\.?\s+(.+)$/i);
      let isNumberedQuestion = false;
      let numQMatch: RegExpMatchArray | null = null;

      const genericNumMatch = trimmed.match(/^\s*(\d+)\.\s+(.+)$/);
      if (genericNumMatch) {
        const hasQMark = genericNumMatch[2].includes('?');
        let hasAnswerLookahead = false;
        for (let look = i + 1; look <= Math.min(i + 3, lines.length - 1); look++) {
          if (/^answer\s*:/i.test(lines[look].trim()) || lines[look].trim().toLowerCase() === 'answer:') {
            hasAnswerLookahead = true;
            break;
          }
        }
        if (hasQMark || hasAnswerLookahead) {
          isNumberedQuestion = true;
          numQMatch = genericNumMatch;
        }
      }

      if (explicitQMatch || (isNumberedQuestion && numQMatch)) {
        flushAllAccumulators();
        const fullQText = explicitQMatch ? `Q${explicitQMatch[1]}. ${explicitQMatch[2]}` : `${numQMatch![1]}. ${numQMatch![2]}`;
        currentQuestion = {
          title: fullQText,
          lines: []
        };
        continue;
      }

      // 5. If inside currentQuestion or currentTask, collect content lines
      if (currentQuestion) {
        currentQuestion.lines.push(line);
        continue;
      }

      if (currentTask) {
        currentTask.lines.push(line);
        continue;
      }

      // 6. Generic Numbered Item (e.g. "1. First step", "2. Second step")
      if (genericNumMatch) {
        flushAllAccumulators();
        parsedBlocks.push({
          type: 'numbered-item',
          number: genericNumMatch[1],
          text: genericNumMatch[2]
        });
        continue;
      }

      // 7. Flowchart / Architecture diagram detection
      if (/↓|→|↙|↘/.test(trimmed) || (/[▼│┌┐─┼]/.test(trimmed) && trimmed.length > 3)) {
        flushText();
        flushCodeBlock();
        flushTableBlock();
        currentFlowchartLines.push(line);
        continue;
      }

      // 8. Table detection
      if (trimmed.includes('|') || (trimmed.includes('│') && trimmed.length > 5)) {
        flushText();
        flushCodeBlock();
        flushFlowchartBlock();
        currentTableLines.push(trimmed);
        continue;
      }

      // 9. Bullet Points (●, •, -, *, ❌, ✔)
      if (trimmed.startsWith('●') || trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('❌') || trimmed.startsWith('✔')) {
        flushAllAccumulators();
        const isCross = trimmed.startsWith('❌');
        const cleanBulletText = trimmed.replace(/^[-*•●❌✔]\s*/, '');
        parsedBlocks.push({ type: 'bullet', text: cleanBulletText, isCross });
        continue;
      }

      // 10. Notes / Warnings / Important
      if (/^(warning|mistake|note|tip|important)\s*:/i.test(trimmed)) {
        flushAllAccumulators();
        parsedBlocks.push({ type: 'note', text: trimmed });
        continue;
      }

      // 11. Interactive Example trigger line
      if (/^(example|real-time example|real-time scenario)\s*:/i.test(trimmed)) {
        flushAllAccumulators();
        parsedBlocks.push({ type: 'example', text: trimmed });
        continue;
      }

      // 12. Code detection
      const inlineCodeStatements = splitInlineCodeStatements(trimmed, isK8s);
      if (isCodeLine(trimmed, isK8s, isGit, isReact, isLinux) || inlineCodeStatements.length > 1) {
        flushText();
        flushFlowchartBlock();
        flushTableBlock();
        currentCodeLines.push(...inlineCodeStatements);
        continue;
      }

      // 13. Normal Text accumulation for paragraphs
      flushCodeBlock();
      flushFlowchartBlock();
      flushTableBlock();
      currentTextLines.push(trimmed);
    }

    if (inCodeBlock && codeBuffer.length > 0) {
      parsedBlocks.push({ type: 'code', code: codeBuffer.join('\n'), lang: codeLang });
    }
    flushAllAccumulators();

    const groupedBlocks: any[] = [];
    let currentExampleBlock: any = null;

    for (const block of parsedBlocks) {
      if (block.type === 'example') {
        currentExampleBlock = {
          ...block,
          children: []
        };
        groupedBlocks.push(currentExampleBlock);
      } else if (currentExampleBlock) {
        const isBoundary = block.type === 'heading' || block.type === 'subheading' || block.type === 'question' || block.type === 'task';
        if (isBoundary) {
          currentExampleBlock = null;
          groupedBlocks.push(block);
        } else {
          currentExampleBlock.children.push(block);
        }
      } else {
        groupedBlocks.push(block);
      }
    }

    return groupedBlocks;
  }, [content, isK8s, isGit, isReact, isLinux, isDbms, courseId]);

  const topicVisualKey = useMemo(() => {
    const heading = blocks.find(b => b.type === 'heading')?.text || '';
    const subheading = blocks.find(b => b.type === 'subheading')?.text || '';
    return getVisualKey(heading, subheading + ' ' + content.slice(0, 100), isK8s, isGit, isReact, isLinux);
  }, [blocks, content, isK8s, isGit, isReact, isLinux]);

  return (
    <div className="space-y-6">
      {/* Dynamic Visual Illustration Card */}
      <div className={`p-4 rounded-3xl border shadow-sm flex flex-col items-center justify-center ${
        isNightMode ? 'bg-slate-900/40 border-slate-800' : 'bg-sky-50/10 border-sky-100/50'
      }`}>
        <TopicVisual topicKey={topicVisualKey} isNightMode={isNightMode} />
        <span className={`text-[10px] font-semibold uppercase tracking-wider font-mono ${isNightMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Concept Visual: {topicVisualKey}
        </span>
      </div>

      {/* Render Parsed Blocks */}
      <div className="space-y-4">
        {(() => {
          const renderBlock = (block: any, idx: number): React.ReactNode => {
            let blockContent = null;
            switch (block.type) {
              case 'heading':
                const isSubSub = block.level >= 3;
                if (isSubSub) {
                  blockContent = (
                    <h4
                      className="text-base sm:text-lg font-heading font-bold mt-5 mb-2 flex items-center gap-1.5 text-primary/90"
                    >
                      <span>{block.text}</span>
                    </h4>
                  );
                } else {
                  const headingNum = String(idx + 1).padStart(2, '0');
                  blockContent = (
                    <div className="mt-8 mb-4 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                          {headingNum}
                        </span>
                        <div className="h-px bg-slate-800/80 flex-1 relative">
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)]" />
                        </div>
                      </div>
                      <h2 
                        className="text-xl sm:text-2xl font-black text-primary tracking-tight uppercase font-sans"
                        style={{ textShadow: '0 0 8px var(--kq-glow)' }}
                      >
                        {block.text}
                      </h2>
                    </div>
                  );
                }
                break;

              case 'subheading':
                blockContent = (
                  <h3
                    className="text-md sm:text-lg font-heading font-black mt-6 mb-3 flex items-center gap-2 border-l-2 border-primary pl-2.5 text-primary"
                    style={{ textShadow: '0 0 6px var(--kq-glow)' }}
                  >
                    <span>{block.text}</span>
                  </h3>
                );
                break;

              case 'task':
                blockContent = (
                  <TaskCard
                    title={block.title}
                    content={block.content}
                    isNightMode={isNightMode}
                  />
                );
                break;

              case 'numbered-item':
                blockContent = (
                  <NumberedItem
                    number={block.number}
                    text={block.text}
                    isNightMode={isNightMode}
                  />
                );
                break;

              case 'code':
                blockContent = (
                  <CodeBlock
                    code={block.code}
                    language={block.lang || (isDbms ? 'sql' : ((isGit || isLinux) ? 'bash' : (isK8s ? 'yaml' : (isReact ? 'jsx' : 'python'))))}
                  />
                );
                break;

              case 'flowchart':
                blockContent = (
                  <FlowchartRenderer
                    lines={block.lines}
                    isNightMode={isNightMode}
                  />
                );
                break;

              case 'table':
                blockContent = (
                  <TableRenderer
                    lines={block.lines}
                    isNightMode={isNightMode}
                  />
                );
                break;

              case 'question':
                blockContent = (
                  <QuestionCard
                    question={block.question}
                    answer={block.answer}
                    isNightMode={isNightMode}
                    isK8s={isK8s}
                    isGit={isGit}
                    isReact={isReact}
                    isLinux={isLinux}
                  />
                );
                break;

              case 'bullet':
                const isCross = block.isCross;
                blockContent = (
                  <div className="flex items-start gap-2.5 ml-3 my-2 text-sm sm:text-base leading-relaxed">
                    {isCross ? (
                      <span className="shrink-0 mt-0.5 text-base">❌</span>
                    ) : (
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-1 text-primary" />
                    )}
                    <span className={isNightMode ? 'text-slate-200' : 'text-slate-700'}>
                      {formatInlineStyles(block.text, isNightMode)}
                    </span>
                  </div>
                );
                break;

              case 'example':
                blockContent = (
                  <InteractiveExampleCard
                    title={block.text}
                    isNightMode={isNightMode}
                  >
                    <div className="space-y-4">
                      {(block.children || []).map((child: any, cidx: number) => (
                        <React.Fragment key={cidx}>
                          {renderBlock(child, cidx)}
                        </React.Fragment>
                      ))}
                    </div>
                  </InteractiveExampleCard>
                );
                break;

              case 'note':
                const isWarning = block.text.toLowerCase().startsWith('warning:') || block.text.toLowerCase().startsWith('mistake:') || block.text.toLowerCase().startsWith('important:');
                blockContent = (
                  <InteractiveConceptCard
                    text={block.text}
                    isWarning={isWarning}
                    isNightMode={isNightMode}
                  />
                );
                break;

              case 'text':
              default:
                blockContent = (
                  <p
                    className={`text-sm sm:text-base leading-relaxed my-3 font-normal ${
                      isNightMode ? 'text-slate-200' : 'text-slate-700'
                    }`}
                  >
                    {formatInlineStyles(block.text, isNightMode)}
                  </p>
                );
                break;
            }
            return blockContent;
          };

          return blocks.map((block, idx) => {
            const style = { animationDelay: `${Math.min(300, idx * 25)}ms` };
            return (
              <div key={idx} className="animate-slide-up opacity-0" style={style}>
                {renderBlock(block, idx)}
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
};
