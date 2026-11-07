import React from 'react';
import {
  Zap,
  Wrench,
  Hammer,
  Paintbrush,
  Sparkles,
  Car,
  Cog,
  Users,
  HardHat,
  Grid,
  ShieldCheck,
  Clock,
  Headphones,
  CheckCircle2,
  Calendar,
  MapPin,
  Search,
  MessageSquare,
  DollarSign,
  Briefcase
} from 'lucide-react';

const iconMap = {
  Zap,
  Wrench,
  Hammer,
  Paintbrush,
  Sparkles,
  Car,
  Cog,
  Users,
  HardHat,
  Grid,
  ShieldCheck,
  Clock,
  Headphones,
  CheckCircle2,
  Calendar,
  MapPin,
  Search,
  MessageSquare,
  DollarSign,
  Briefcase
};

export const CategoryIcon = ({ name, className = "w-6 h-6" }) => {
  const IconComponent = iconMap[name] || Briefcase;
  return <IconComponent className={className} />;
};

