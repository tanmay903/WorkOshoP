/**
 * Auto-detects and formats a clean human-readable Full Name from an email address.
 * E.g.:
 *  "kuddus.haque@gmail.com"  => "Kuddus Haque"
 *  "john_doe@example.com"    => "John Doe"
 *  "aarav.singhal@work.io"   => "Aarav Singhal"
 *  "rohit@yahoo.com"         => "Rohit"
 */
export const detectNameFromEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  
  const username = email.split('@')[0] || '';
  if (!username) return '';

  // Remove numbers and replace delimiters (. _ - +) with spaces
  const cleaned = username
    .replace(/[0-9]+/g, ' ')
    .replace(/[._\-+]+/g, ' ')
    .trim();

  if (!cleaned) return username;

  // Capitalize each word properly
  return cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

