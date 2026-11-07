import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Calendar,
  MessageSquare,
  FileText,
  ShieldCheck,
  Check,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { storage } from '../utils/storage';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setNotifications(storage.getNotifications());
  }, []);

  const handleMarkAllRead = () => {
    const updated = storage.markAllNotificationsRead();
    setNotifications(updated);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'booking':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-indigo-600" />;
      case 'proposal':
      case 'job':
        return <FileText className="w-5 h-5 text-amber-600" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary-600" />
            Notification Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Stay updated with your service bookings, quote alerts, and worker messages.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Mark all read</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden divide-y divide-slate-100">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 flex items-start gap-4 transition-colors ${
                !n.read ? 'bg-primary-50/40' : 'hover:bg-slate-50/70'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {n.time}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {n.message}
                </p>

                {n.link && (
                  <Link
                    to={n.link}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:underline mt-2"
                  >
                    <span>View details</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {!n.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-primary-600 shrink-0 mt-2" />
              )}
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-slate-400 text-xs">
            No notifications right now.
          </div>
        )}
      </div>
    </div>
  );
};

