import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, Clock, MapPin, FileText, CheckCircle2, ShieldCheck, DollarSign } from 'lucide-react';
import { storage } from '../utils/storage';
import { useAuth } from '../context/AuthContext';

export const BookingModal = ({ worker, initialService, isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [serviceDate, setServiceDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [serviceTime, setServiceTime] = useState('10:00 AM');
  const [address, setAddress] = useState(user?.city ? `Sector 14, ${user.city}` : 'Flat 302, Green Valley Apartments, Delhi NCR');
  const [instructions, setInstructions] = useState('');
  const [selectedService, setSelectedService] = useState(initialService || worker.services?.[0] || {
    title: `General ${worker.profession} Service`,
    price: worker.hourlyRate || 300,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newBooking = storage.saveBooking({
        workerId: worker.id,
        workerName: worker.name,
        workerProfession: worker.profession,
        workerAvatar: worker.avatar,
        customerId: user?.id || 'cust-1',
        customerName: user?.name || 'Aarav Singhal',
        customerPhone: user?.phone || '+91 98711 22334',
        serviceTitle: selectedService.title,
        serviceDate,
        serviceTime,
        address,
        instructions,
        estimatedAmount: selectedService.price,
        status: 'Pending',
      });

      setCreatedBooking(newBooking);
      setIsSubmitting(false);
      setIsConfirmed(true);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={worker.avatar}
              alt={worker.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-white/40 shadow-sm"
            />
            <div>
              <h3 className="font-bold text-lg leading-tight flex items-center gap-2">
                Book {worker.name}
                {worker.verified && (
                  <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full font-medium">Verified</span>
                )}
              </h3>
              <p className="text-primary-100 text-xs">{worker.profession} &bull; ₹{worker.hourlyRate}/hr</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isConfirmed ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                Booking Requested
              </span>
              <h4 className="text-2xl font-bold text-slate-800 mt-2">
                Booking #{createdBooking?.bookingNumber} Confirmed!
              </h4>
              <p className="text-slate-600 text-sm mt-1 max-w-md mx-auto">
                Your request has been sent to <strong>{worker.name}</strong>. You will receive real-time updates under your Bookings dashboard.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 text-left border border-slate-100 text-xs space-y-2 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="font-semibold text-slate-900">{selectedService.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled Time:</span>
                <span className="font-semibold text-slate-900">{serviceDate} at {serviceTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-semibold text-slate-900 truncate max-w-[240px]">{address}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-sm">
                <span className="font-medium text-slate-700">Estimated Cost:</span>
                <span className="font-bold text-primary-600">₹{selectedService.price}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  onClose();
                  navigate('/bookings');
                }}
                className="flex-1 py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-primary-500/25"
              >
                View My Bookings
              </button>
              <button
                onClick={onClose}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Service Selection */}
            {worker.services && worker.services.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Choose Service Package
                </label>
                <div className="space-y-2">
                  {worker.services.map((srv) => {
                    const isSelected = selectedService.id === srv.id || selectedService.title === srv.title;
                    return (
                      <div
                        key={srv.id || srv.title}
                        onClick={() => setSelectedService(srv)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50/50 ring-1 ring-primary-500'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div>
                          <p className="font-medium text-sm text-slate-900">{srv.title}</p>
                          <p className="text-xs text-slate-500">{srv.duration || 'Standard'} &bull; {srv.description?.slice(0, 50)}...</p>
                        </div>
                        <span className="font-bold text-primary-600 text-sm">
                          ₹{srv.price}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Date & Time Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Service Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="date"
                    required
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Preferred Time Slot
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <select
                    value={serviceTime}
                    onChange={(e) => setServiceTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
                  >
                    <option value="09:00 AM">09:00 AM - 11:00 AM</option>
                    <option value="11:00 AM">11:00 AM - 01:00 PM</option>
                    <option value="02:00 PM">02:00 PM - 04:00 PM</option>
                    <option value="04:00 PM">04:00 PM - 06:00 PM</option>
                    <option value="06:00 PM">06:00 PM - 08:00 PM</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Work Location / Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="House/Flat number, Street, Landmark, City"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
                />
              </div>
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Additional Instructions (Optional)
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <textarea
                  rows="2"
                  placeholder="e.g. Bring step ladder, switchboard sparking since morning..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white outline-none"
                />
              </div>
            </div>

            {/* Price Guarantee Banner */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>HireWorker Guarantee:</strong> Pay after service satisfaction. No hidden advance charges.
              </span>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div>
                <span className="text-xs text-slate-500 block">Total Estimate</span>
                <span className="text-xl font-bold text-slate-900">₹{selectedService.price}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 font-medium rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 active:scale-95 transition-all rounded-xl shadow-md hover:shadow-primary-500/25 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

