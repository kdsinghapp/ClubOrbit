import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clubService } from '../services/clubService';
import { useAuthContext } from '../context/AuthContext';
import ClubCard from '../components/ClubCard';

const ClubList = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthContext();

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchClubs(pos.coords.latitude, pos.coords.longitude),
        () => fetchClubs(null, null),
        { timeout: 5000 }
      );
    } else {
      fetchClubs(null, null);
    }
  }, [user]);

  const fetchClubs = async (lat, lng) => {
    try {
      setLoading(true);
      setError(null);

      const result = await clubService.getUserClubs(user.uid, 1, lat, lng);
      setClubs(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error('Error fetching clubs:', err);
      setError('Failed to load clubs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#080d19] via-[#0b1224] to-[#0f1930] text-white relative">

      {/* Loader */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#080d19]/95 z-50">
          <div className="relative flex flex-col items-center justify-center">
            <div className="absolute w-32 h-32 bg-sky-500/20 rounded-full blur-2xl animate-pulse"></div>
            <img src="/assets/img/logo.png" alt="logo" className="w-20 relative z-10 animate-pulse" />
          </div>
        </div>
      )}

      {/* Top Menu */}
      <div className="bg-[#0b101c] border-b border-white/[0.04] relative z-30 shadow-md">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-around py-2.5 text-white/35">
            <Link to="/activity" className="flex flex-col items-center gap-0.5 hover:text-sky-400 transition-colors duration-200">
              <i className="bi bi-activity text-base"></i>
              <span className="text-[9px] font-semibold uppercase tracking-wider">Activity</span>
            </Link>
            <Link to="/search" className="flex flex-col items-center gap-0.5 hover:text-sky-400 transition-colors duration-200">
              <i className="bi bi-search text-base"></i>
              <span className="text-[9px] font-semibold uppercase tracking-wider">Search</span>
            </Link>
            <Link to="/places" className="flex flex-col items-center gap-0.5 hover:text-sky-400 transition-colors duration-200">
              <i className="bi bi-geo-alt text-base"></i>
              <span className="text-[9px] font-semibold uppercase tracking-wider">Places</span>
            </Link>
            <Link to="/event" className="flex flex-col items-center gap-0.5 hover:text-sky-400 transition-colors duration-200">
              <i className="bi bi-calendar-event text-base"></i>
              <span className="text-[9px] font-semibold uppercase tracking-wider">Events</span>
            </Link>
            <Link to="/user-profile" className="flex flex-col items-center gap-0.5 hover:text-sky-400 transition-colors duration-200">
              <i className="bi bi-person text-base"></i>
              <span className="text-[9px] font-semibold uppercase tracking-wider">Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight leading-none">My Clubs</h1>
          </div>

          <Link
            to="/clubs/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[11px] font-extrabold uppercase tracking-wider transition-all duration-200 hover:from-sky-400 hover:to-blue-500 shadow-lg shadow-sky-500/10 hover:shadow-sky-500/20 active:scale-98 group"
          >
            <i className="bi bi-plus-circle-fill text-sm group-hover:scale-105 transition-transform duration-200"></i>
            <span>Add Club</span>
          </Link>
        </div>

        {/* Error Handling */}
        {error && (
          <div className="flex items-center gap-3.5 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-8 animate-in fade-in duration-300">
            <i className="bi bi-exclamation-octagon-fill text-lg flex-shrink-0"></i>
            <span className="text-[13px] font-medium leading-relaxed">{error}</span>
            <button
              onClick={() => fetchClubs(null, null)}
              className="ml-auto text-[11px] px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold transition duration-200"
            >
              Retry
            </button>
          </div>
        )}

        {/* Not Logged In State */}
        {!user && !loading && (
          <div className="bg-[#111c30] border border-white/[0.06] rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-6 text-amber-400">
              <i className="bi bi-shield-lock-fill text-2xl"></i>
            </div>
            <h3 className="text-lg font-bold text-white mb-2 tracking-tight">Access Restricted</h3>
            <p className="text-white/45 text-[13px] mb-8 max-w-sm mx-auto leading-relaxed">Please sign in to view and manage your memberships and clubs.</p>
            <Link to="/login" className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-full text-[11px] font-extrabold uppercase tracking-wider hover:from-sky-400 hover:to-blue-500 shadow-lg shadow-sky-500/10 transition-all">
              Sign In to Continue <i className="bi bi-arrow-right text-xs"></i>
            </Link>
          </div>
        )}

        {/* Empty State */}
        {!loading && user && clubs.length === 0 && !error && (
          <div className="bg-[#111c30] border border-white/[0.06] rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto mb-6 text-sky-400">
              <i className="bi bi-building-fill-add text-2xl"></i>
            </div>
            <h3 className="text-lg font-bold text-white mb-2 tracking-tight">No Clubs Joined</h3>
            <p className="text-white/45 text-[13px] mb-8 max-w-sm mx-auto leading-relaxed">
              You haven't joined or created any clubs yet. Start your journey by creating one today.
            </p>
            <Link
              to="/clubs/create"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-full text-[11px] font-extrabold uppercase tracking-wider hover:from-sky-400 hover:to-blue-500 shadow-lg shadow-sky-500/10 transition-all"
            >
              Create Your First Club
            </Link>
          </div>
        )}

        {/* Clubs Grid */}
        {!loading && user && clubs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {clubs.map((club) => (
              <div key={club.uid || club.id}>
                <ClubCard club={club} />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default ClubList;