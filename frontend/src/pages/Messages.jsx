import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Send,
  Search,
  Phone,
  CheckCheck,
  User,
  ShieldCheck,
  Paperclip,
  Smile,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import { storage } from '../utils/storage';
import { useAuth } from '../context/AuthContext';

export const Messages = () => {
  const [searchParams] = useSearchParams();
  const { user, isWorker } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  const chatEndRef = useRef(null);

  useEffect(() => {
    const convs = storage.getConversations();
    setConversations(convs);

    const queryConvId = searchParams.get('conv');
    if (queryConvId && convs.some(c => c.id === queryConvId)) {
      setActiveConvId(queryConvId);
    } else if (convs.length > 0) {
      setActiveConvId(convs[0].id);
    }
  }, [searchParams]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConvId, conversations]);

  const activeConv = conversations.find(c => c.id === activeConvId);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId) return;

    const senderRole = isWorker ? 'worker' : 'customer';
    const { updated } = storage.sendMessage(activeConvId, inputText.trim(), senderRole);
    setConversations(updated);
    setInputText('');

    // Optional simulated quick auto-reply after 1.5s if talking to worker
    if (!isWorker) {
      setTimeout(() => {
        const workerResponses = [
          'Understood! I will be there as scheduled.',
          'Noted. Please share any photos if you have them.',
          'Sure thing, I have the proper tools ready for this task.',
          'Thank you for confirming, see you soon!'
        ];
        const randomReply = workerResponses[Math.floor(Math.random() * workerResponses.length)];
        const { updated: finalUpdated } = storage.sendMessage(activeConvId, randomReply, 'worker');
        setConversations(finalUpdated);
      }, 1500);
    }
  };

  const filteredConversations = conversations.filter(c => {
    const partnerName = isWorker ? c.customerName : c.workerName;
    return partnerName.toLowerCase().includes(searchFilter.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft overflow-hidden h-[82vh] flex flex-col md:flex-row">
        {/* ========================================================
            Conversation List (Left panel)
           ======================================================== */}
        <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 flex flex-col h-full bg-slate-50/50">
          {/* Header */}
          <div className="p-4 border-b border-slate-200/80 bg-white">
            <h2 className="text-lg font-bold text-slate-900">Direct Messages</h2>
            <div className="relative mt-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((c) => {
                const partnerName = isWorker ? c.customerName : c.workerName;
                const partnerAvatar = isWorker
                  ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
                  : c.workerAvatar;
                const lastMsg = c.messages?.[c.messages.length - 1];
                const isSelected = c.id === activeConvId;

                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveConvId(c.id)}
                    className={`w-full p-4 text-left flex items-start gap-3 transition-colors ${
                      isSelected ? 'bg-primary-50/80 border-l-4 border-primary-600' : 'hover:bg-white'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={partnerAvatar}
                        alt={partnerName}
                        className="w-11 h-11 rounded-2xl object-cover ring-1 ring-slate-200"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {partnerName}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {c.lastUpdated}
                        </span>
                      </div>

                      <p className="text-[11px] text-primary-600 font-medium">
                        {isWorker ? 'Customer' : c.workerProfession}
                      </p>

                      <p className="text-xs text-slate-500 truncate mt-1">
                        {lastMsg ? lastMsg.text : 'Start conversation...'}
                      </p>
                    </div>

                    {c.unreadCount > 0 && !isSelected && (
                      <span className="w-5 h-5 bg-primary-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shrink-0">
                        {c.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                No active conversations found.
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            Active Chat Window (Right panel)
           ======================================================== */}
        {activeConv ? (
          <div className="flex-1 flex flex-col h-full bg-white">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-3">
                <img
                  src={isWorker ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80' : activeConv.workerAvatar}
                  alt={isWorker ? activeConv.customerName : activeConv.workerName}
                  className="w-10 h-10 rounded-2xl object-cover ring-1 ring-slate-200"
                />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    {isWorker ? activeConv.customerName : activeConv.workerName}
                    {!isWorker && (
                      <ShieldCheck className="w-4 h-4 fill-emerald-600 text-white" />
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Online &bull; {isWorker ? 'Customer' : activeConv.workerProfession}
                  </p>
                </div>
              </div>

              {!isWorker && (
                <Link
                  to={`/worker/${activeConv.workerId}`}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1 transition-colors"
                >
                  <span>Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>

            {/* Message Feed */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3 bg-slate-50/40">
              <div className="text-center my-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-2xs">
                  End-to-End Encrypted Customer Support
                </span>
              </div>

              {activeConv.messages?.map((msg) => {
                const isMe = isWorker ? msg.sender === 'worker' : msg.sender === 'customer';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[78%] sm:max-w-md px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isMe
                          ? 'bg-primary-600 text-white rounded-br-xs shadow-xs'
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs shadow-2xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 px-1">
                      <span>{msg.time}</span>
                      {isMe && <CheckCheck className="w-3 h-3 text-primary-500" />}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type your message here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-2xl transition-all shadow-md shadow-primary-500/25 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400 text-xs">
            Select a conversation on the left to begin chatting.
          </div>
        )}
      </div>
    </div>
  );
};

