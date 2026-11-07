import React from 'react';
import { Link } from 'react-router-dom';
import { CategoryIcon } from './CategoryIcon';
import { ArrowUpRight } from 'lucide-react';

export const CategoryCard = ({ category }) => {
  return (
    <Link
      to={`/find-workers?category=${category.id}`}
      className="group relative bg-white p-5 rounded-2xl border border-slate-200/90 hover:border-primary-400 hover:shadow-soft-lg transition-all duration-300 flex flex-col justify-between overflow-hidden"
    >
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${category.bgLight} group-hover:scale-110 transition-transform duration-300`}>
          <CategoryIcon name={category.icon} className="w-6 h-6" />
        </div>
        <div className="w-7 h-7 rounded-full bg-slate-50 group-hover:bg-primary-50 text-slate-400 group-hover:text-primary-600 flex items-center justify-center transition-colors">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-bold text-slate-900 group-hover:text-primary-600 text-base transition-colors">
          {category.name}
        </h3>
        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
          {category.tagline}
        </p>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span>{category.count}+ Available</span>
        <span className="font-semibold text-primary-600 group-hover:underline">Explore</span>
      </div>
    </Link>
  );
};

