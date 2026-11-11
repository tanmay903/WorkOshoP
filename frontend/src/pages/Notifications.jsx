import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Calendar,
  MessageSquare,
  FileText,
  ShieldCheck,
  Check,
  ExternalLink,
  Trash2,
  CheckCheck
} from 'lucide-react';
import { storage } from '../utils/storage';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread' | 'booking' | 'job'

  useEffect(() => {
    setNotifications(storage.getNotifications());
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(storage.markAllNotificationsRead());
  };

  const handleMarkSingleRead = (id) => {
    setNotifications(storage.markNotificationRead(id));
  };

  const handleDeleteNotification = (id) => {
    setNotifications(storage.deleteNotification(id));
  };

  const handleClearRead = () => {
    setNotifications(storage.clearReadNotifications());
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'booking') return n.type === 'booking';
    if (activeFilter === 'job') return n.type === 'job' || n.type === 'proposal' || n.type === 'message';
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'booking':
        return <Calendar className="w-5 h-5 text-[#2563EB]" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-[#14B8A6]" />;
      case 'proposal':
      case 'job':
        return <FileText className="w-5 h-5 text-amber-600" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-[#16A34A]" />;
    }
  };

  const filterTabs = [
    { key: 'all', label: `All (${notifications.length})` },
    { key: 'unread', label: `Unread (${unreadCount})` },
    { key: 'booking', label: 'Bookings' },
    { key: 'job', label: 'Jobs & Messages' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
              <Bell className="w-6 h-6 text-[#2563EB]" />
              Notification Center
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#2563EB] text-white">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Stay updated with your service bookings, quote alerts, saved workers, and messages.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {notifications.some((n) => n.read) && (
            <button
              onClick={handleClearRead}
              className="px-3.5 py-2 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear read</span>
            </button>
          )}
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="px-4 py-2 bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5 text-[#14B8A6]" />
            <span>Mark all read</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeFilter === tab.key
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-[#1E293B] hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft overflow-hidden divide-y divide-slate-100">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                if (!n.read) handleMarkSingleRead(n.id);
              }}
              className={`p-5 flex items-start gap-4 transition-colors cursor-pointer ${
                !n.read ? 'bg-blue-50/50 hover:bg-blue-50/80' : 'hover:bg-slate-50/80'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-xs sm:text-sm text-[#0F172A] flex items-center gap-2">
                    <span>{n.title}</span>
                    {!n.read && (
                      <span className="inline-block w-2 h-2 rounded-full bg-[#2563EB]" />
                    )}
                  </h4>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {n.time}
                  </span>
                </div>
                <p className="text-xs text-[#1E293B]/80 mt-1 leading-relaxed">
                  {n.message}
                </p>

                <div className="flex items-center justify-between gap-2 mt-2.5">
                  {n.link ? (
                    <Link
                      to={n.link}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline"
                    >
                      <span>View details</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  ) : (
                    <span />
                  )}

                  <div className="flex items-center gap-1">
                    {!n.read && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkSingleRead(n.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-[#16A34A] rounded-lg hover:bg-green-50 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNotification(n.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Dismiss notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-[#0F172A]">All caught up!</p>
            <p className="text-xs text-slate-500">
              No notifications in this category right now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
