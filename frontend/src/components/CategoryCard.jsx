import React from 'react';
import { Link } from 'react-router-dom';
import { CategoryIcon } from './CategoryIcon';
import { ArrowUpRight } from 'lucide-react';

export const CategoryCard = ({ category }) => {
  return (
    <Link
      to={`/find-workers?category=${category.id}`}
      className="group relative bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-primary-400 dark:hover:border-primary-500 card-lift flex flex-col justify-between overflow-hidden"
    >
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${category.bgLight} group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 shadow-xs`}>
          <CategoryIcon name={category.icon} className="w-6 h-6" />
        </div>
        <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-950/60 text-slate-400 group-hover:text-primary-600 flex items-center justify-center transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 text-base transition-colors">
          {category.name}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
          {category.tagline}
        </p>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
        <span>{category.count}+ Available</span>
        <span className="font-semibold text-primary-600 dark:text-primary-400 group-hover:underline">Explore</span>
      </div>
    </Link>
  );
};

