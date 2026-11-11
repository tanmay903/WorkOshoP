import React, { useState, useEffect } from 'react';

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)', // Cyan -> Blue
  'linear-gradient(135deg, #6366f1 0%, #9333ea 100%)', // Indigo -> Purple
  'linear-gradient(135deg, #10b981 0%, #0d9488 100%)', // Emerald -> Teal
  'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', // Amber -> Orange
  'linear-gradient(135deg, #ec4899 0%, #e11d48 100%)', // Pink -> Rose
  'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)', // Violet -> Fuchsia
  'linear-gradient(135deg, #0ea5e9 0%, #4f46e5 100%)', // Sky -> Indigo
  'linear-gradient(135deg, #14b8a6 0%, #0284c7 100%)', // Teal -> Sky Blue
];

export const getInitials = (name) => {
  const cleaned = String(name || 'User')
    .replace(/\([^)]*\)/g, '')
    .trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
};

export const getAvatarGradient = (name) => {
  const str = String(name || 'User').toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
};

export const Avatar = ({ name, src, className = 'w-10 h-10 rounded-full text-sm', title }) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={name || 'Profile photo'}
        title={title || name}
        onError={() => setImgError(true)}
        className={`object-cover shrink-0 shadow-sm ring-1 ring-slate-200 ${className}`}
      />
    );
  }

  const initials = getInitials(name);
  const background = getAvatarGradient(name);

  return (
    <div
      role="img"
      aria-label={name || 'User avatar'}
      title={title || name}
      style={{ background }}
      className={`inline-flex items-center justify-center font-extrabold text-white tracking-tight select-none shrink-0 shadow-sm ring-1 ring-white/25 ${className}`}
    >
      {initials}
    </div>
  );
};
