import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { activityService } from "../services/activityService";
import { auth } from "../firebase";

// ── Icons ────────────────────────────────────────────────────────────────────
const HeartIcon = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

const ChatIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

// ── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(timestamp) {
  if (!timestamp) return "";
  const diff = (Date.now() - new Date(timestamp).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatDateRange(startStr, endStr) {
  if (!startStr || !endStr) return "";
  const start = new Date(startStr);
  const end = new Date(endStr);
  const datePart = start.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const startTime = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const endTime = end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${datePart}, ${startTime} - ${endTime}`;
}

// ── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ src, name, size = "lg" }) {
  const [error, setError] = useState(false);

  const dim = size === "lg" ? "w-[46px] h-[46px] text-[16px]"
    : size === "md" ? "w-[36px] h-[36px] text-[12px]"
      : size === "sm" ? "w-[28px] h-[28px] text-[10px]"
        : "w-[40px] h-[40px] text-[14px]";

  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative inline-block flex-shrink-0">
      {src && !error ? (
        <div className={`${dim} rounded-xl overflow-hidden ring-1 ring-white/10`}>
          <img src={src} alt={name} className="w-full h-full object-cover" onError={() => setError(true)} />
        </div>
      ) : (
        <div className={`${dim} rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white font-black ring-1 ring-white/10 shadow-sm`}>
          {initials}
        </div>
      )}
    </div>
  );
}

// ── Comment Item (Recursive Tree View) ─────────────────────────────────────────
function CommentItem({
  comment,
  isPostAdmin,
  currentUserId,
  activeReplyCommentUid,
  onStartReply,
  onCancelReply,
  onAddReply,
  onLike,
  onBlock,
  onReport,
  depth = 0
}) {
  const [replyText, setReplyText] = useState("");
  const currentUser = auth.currentUser;
  const hasLiked = comment.likes?.some((likeUser) => likeUser.uid === currentUser?.uid) || false;

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    onAddReply(comment.uid, replyText);
    setReplyText("");
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Comment Card */}
      <div className="flex gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all duration-300">
        <Avatar src={comment.user?.profilePicUrl} name={comment.user?.displayName} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[13px] font-black text-white/95 leading-tight">{comment.user?.displayName}</p>
            <span className="text-[10px] text-gray-500 font-bold flex-shrink-0">{timeAgo(comment.timestamp)}</span>
          </div>
          <p className="text-[13px] text-gray-400 mt-2 leading-relaxed whitespace-pre-wrap">{comment.text}</p>

          {/* Action Row */}
          <div className="flex items-center gap-4 mt-3 pt-2 border-t border-white/5 flex-wrap">
            {/* Like Button */}
            <button
              onClick={() => onLike(comment.uid, hasLiked)}
              className={`flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider transition-all ${
                hasLiked
                  ? "text-[#38bdf8] drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <HeartIcon filled={hasLiked} />
              <span>{comment.countLikes || 0}</span>
            </button>

            {/* Reply Button */}
            <button
              onClick={() => {
                if (activeReplyCommentUid === comment.uid) {
                  onCancelReply();
                } else {
                  onStartReply(comment.uid);
                }
              }}
              className={`flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider transition-all ${
                activeReplyCommentUid === comment.uid
                  ? "text-[#38bdf8]"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <i className="bi bi-reply-fill text-sm"></i>
              <span>Reply</span>
            </button>

            {/* Block Button */}
            {isPostAdmin && comment.user?.uid !== currentUserId && (
              <button
                onClick={() => onBlock(comment)}
                className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-gray-500 hover:text-red-400 transition-all ml-auto"
                title="Block User"
              >
                <i className="bi bi-dash-circle"></i>
                <span>Block</span>
              </button>
            )}

            {/* Report Button */}
            {comment.user?.uid !== currentUserId && (
              <button
                onClick={() => onReport(comment)}
                className={`flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-gray-500 hover:text-yellow-500 transition-all ${
                  !(isPostAdmin && comment.user?.uid !== currentUserId) ? "ml-auto" : ""
                }`}
                title="Report User"
              >
                <i className="bi bi-flag"></i>
                <span>Report</span>
              </button>
            )}
          </div>

          {/* Inline Reply Input */}
          {activeReplyCommentUid === comment.uid && (
            <div className="flex gap-3 mt-4 items-center">
              <input
                type="text"
                placeholder={`Reply to ${comment.user?.displayName || "user"}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                className="flex-1 px-4 py-2 rounded-xl bg-[#0d1b2a] text-white text-xs outline-none border border-gray-800 focus:border-[#38bdf8]/50 transition-all font-bold"
                autoFocus
              />
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim()}
                className="px-4 py-2 bg-[#38bdf8] text-[#0d1b2a] rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50 hover:scale-105 active:scale-95 transition-all shadow-md"
              >
                Send
              </button>
              <button
                onClick={() => {
                  onCancelReply();
                  setReplyText("");
                }}
                className="px-3 py-2 bg-white/5 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recursive Nested Replies with vertical connector line */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="border-l-2 border-[#38bdf8]/20 ml-6 pl-4 flex flex-col gap-4 mt-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.uid}
              comment={reply}
              isPostAdmin={isPostAdmin}
              currentUserId={currentUserId}
              activeReplyCommentUid={activeReplyCommentUid}
              onStartReply={onStartReply}
              onCancelReply={onCancelReply}
              onAddReply={onAddReply}
              onLike={onLike}
              onBlock={onBlock}
              onReport={onReport}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const updateCommentInTree = (commentsList, commentUid, updater) => {
  return commentsList.map((c) => {
    if (c.uid === commentUid) {
      return { ...c, ...updater(c) };
    }
    if (c.replies && c.replies.length > 0) {
      return { ...c, replies: updateCommentInTree(c.replies, commentUid, updater) };
    }
    return c;
  });
};

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [feedItem, setFeedItem] = useState(null);
  const [loadingPost, setLoadingPost] = useState(true);
  const [error, setError] = useState(null);

  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Threading / Moderation States
  const [activeReplyCommentUid, setActiveReplyCommentUid] = useState(null);
  const [blockTargetComment, setBlockTargetComment] = useState(null);
  const [blockingLoading, setBlockingLoading] = useState(false);
  const [reportTargetComment, setReportTargetComment] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [reportingLoading, setReportingLoading] = useState(false);

  // Load post details
  useEffect(() => {
    (async () => {
      if (location.state?.item) {
        setFeedItem(location.state.item);
        const post = location.state.item.postEntity;
        if (post) {
          setLikeCount(post.countLikes || 0);
        }
        setLoadingPost(false);
      } else {
        try {
          setLoadingPost(true);
          const feed = await activityService.getActivityFeed();
          const match = feed.find((x) => x.postEntity?.uid === postId);
          if (match) {
            setFeedItem(match);
            if (match.postEntity) {
              setLikeCount(match.postEntity.countLikes || 0);
            }
          } else {
            setError("Post not found");
          }
        } catch (err) {
          console.error("Failed to load post:", err);
          setError("Failed to load post.");
        } finally {
          setLoadingPost(false);
        }
      }
    })();
  }, [postId, location.state]);

  const loadComments = async () => {
    if (!postId) return;
    try {
      setLoadingComments(true);
      const data = await activityService.getPostComments(postId);
      setComments(data);
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  // Load comments
  useEffect(() => {
    loadComments();
  }, [postId]);

  const handleLike = async () => {
    const u = auth.currentUser;
    if (!u) return alert("Login first");
    const post = feedItem?.postEntity;
    if (!post) return;
    try {
      if (isLiked) {
        await activityService.unlikePost(post.uid, u.uid);
        setLikeCount((p) => Math.max(0, p - 1));
      } else {
        await activityService.likePost(post.uid, u.uid);
        setLikeCount((p) => p + 1);
      }
      setIsLiked(!isLiked);
    } catch (e) {
      console.error("Failed to like post:", e);
    }
  };

  const handleComment = async () => {
    const u = auth.currentUser;
    if (!u) return alert("Login first");
    if (!newComment.trim()) return;
    const post = feedItem?.postEntity;
    if (!post) return;
    try {
      setIsCommenting(true);
      const res = await activityService.addComment(post.uid, u.uid, newComment);
      if (res) {
        setNewComment("");
        await loadComments();
      }
    } catch (e) {
      console.error("Failed to add comment:", e);
    } finally {
      setIsCommenting(false);
    }
  };

  const handleCommentReply = async (parentCommentUid, text) => {
    const u = auth.currentUser;
    if (!u) return alert("Login first");
    if (!text.trim()) return;
    const post = feedItem?.postEntity;
    if (!post) return;
    try {
      setIsCommenting(true);
      const res = await activityService.addComment(post.uid, u.uid, text, parentCommentUid);
      if (res) {
        setActiveReplyCommentUid(null);
        await loadComments();
      }
    } catch (e) {
      console.error("Failed to reply to comment:", e);
    } finally {
      setIsCommenting(false);
    }
  };

  const handleCommentLike = async (commentUid, currentHasLiked) => {
    const u = auth.currentUser;
    if (!u) return alert("Login first");
    try {
      // Optimistically toggle like locally first for speed
      setComments((prevComments) =>
        updateCommentInTree(prevComments, commentUid, (c) => {
          const alreadyLiked = c.likes?.some((lu) => lu.uid === u.uid) || false;
          let newLikes = c.likes || [];
          if (alreadyLiked) {
            newLikes = newLikes.filter((lu) => lu.uid !== u.uid);
          } else {
            newLikes = [...newLikes, { uid: u.uid, email: u.email, displayName: u.displayName || "User" }];
          }
          return {
            countLikes: alreadyLiked ? Math.max(0, c.countLikes - 1) : c.countLikes + 1,
            likes: newLikes,
          };
        })
      );

      const res = currentHasLiked
        ? await activityService.unlikeComment(commentUid, u.uid)
        : await activityService.likeComment(commentUid, u.uid);

      if (res) {
        setComments((prevComments) =>
          updateCommentInTree(prevComments, commentUid, (c) => ({
            countLikes: res.countLikes !== undefined ? res.countLikes : c.countLikes,
            likes: res.likes || c.likes,
          }))
        );
      }
    } catch (e) {
      console.error("Failed to toggle comment like:", e);
      // Revert or reload if failed
      await loadComments();
    }
  };

  const handleBlockConfirm = async () => {
    if (!blockTargetComment) return;
    const u = auth.currentUser;
    if (!u) return alert("Login first");
    try {
      setBlockingLoading(true);
      const res = await activityService.blockUser(
        "comment",
        u.email,
        blockTargetComment.user?.email,
        blockTargetComment.uid
      );
      alert(res?.message || "User blocked successfully.");
      setBlockTargetComment(null);
      await loadComments();
    } catch (e) {
      console.error("Failed to block user:", e);
      alert("Failed to block user: " + e.message);
    } finally {
      setBlockingLoading(false);
    }
  };

  const handleReportSubmit = async (reasonText) => {
    if (!reportTargetComment) return;
    const u = auth.currentUser;
    if (!u) return alert("Login first");
    try {
      setReportingLoading(true);
      const res = await activityService.reportUser(
        "comment",
        u.email,
        reportTargetComment.user?.email,
        reasonText,
        reportTargetComment.uid
      );
      alert(res?.message || "Report submitted successfully.");
      setReportTargetComment(null);
      setReportReason("");
    } catch (e) {
      console.error("Failed to report user:", e);
      alert("Failed to submit report: " + e.message);
    } finally {
      setReportingLoading(false);
    }
  };


  if (loadingPost) {
    return (
      <div className="min-h-screen bg-[#0d1b2a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#38bdf8] border-t-transparent animate-spin"></div>
          <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em]">Loading Post Details...</p>
        </div>
      </div>
    );
  }

  if (error || !feedItem) {
    return (
      <div className="min-h-screen bg-[#0d1b2a] flex items-center justify-center p-4">
        <div className="bg-[#1a2332] border border-gray-800 rounded-[32px] p-8 max-w-md w-full text-center shadow-2xl">
          <i className="bi bi-exclamation-triangle-fill text-[#fbc02d] text-4xl mb-4"></i>
          <h2 className="text-xl font-black text-white mb-2 uppercase tracking-wider">Error</h2>
          <p className="text-gray-400 mb-6 font-bold">{error || "Post could not be loaded."}</p>
          <button
            onClick={() => navigate("/activity")}
            className="w-full py-3 bg-[#38bdf8] text-[#0d1b2a] rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
          >
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  const post = feedItem.postEntity;
  const user = post.user || {};
  const club = post.club || post.eventDate?.eventSeries?.club || {};
  const eventDate = post.eventDate || {};

  return (
    <div className="min-h-screen bg-[#0d1b2a] text-white">
      {/* Header Bar */}
      <div className="bg-[#0d1b2a] border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl hover:bg-white/5 text-gray-500 hover:text-white transition flex items-center justify-center border border-transparent hover:border-gray-800"
            >
              <i className="bi bi-arrow-left text-xl"></i>
            </button>
            <span className="text-[#38bdf8] text-xs font-black uppercase tracking-widest">
              Post Details
            </span>
          </div>
          <Link
            to="/activity"
            className="px-4 py-1.5 rounded-full bg-[#1a2332] border border-gray-800 text-gray-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition"
          >
            Feed
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Post Card */}
        <div className="bg-[#1a2332] border border-gray-800 rounded-[28px] p-6 shadow-2xl mb-8 relative overflow-hidden">
          {/* Header */}
          <div className="flex gap-4 items-center mb-4">
            <Avatar src={user.profilePicUrl} name={user.displayName} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-[15px] font-black text-white leading-tight">{user.displayName}</p>
                <span className={`text-[8px] font-black tracking-[0.2em] uppercase px-2 py-0.5 rounded-full border ${
                  post.type === "clubPost" 
                    ? "text-[#fbc02d] bg-[#fbc02d]/10 border-[#fbc02d]/20" 
                    : "text-cyan-400 bg-cyan-400/10 border-cyan-400/20"
                }`}>
                  {post.type === "clubPost" ? "Club Post" : "Event Post"}
                </span>
              </div>
              <p className="text-[9px] text-gray-500 font-bold mt-1 uppercase tracking-widest">{timeAgo(post.timestamp)}</p>
            </div>
          </div>

          {/* Text */}
          {post.text && (
            <p className="text-[15px] text-gray-200 leading-relaxed mb-4 whitespace-pre-wrap font-bold">{post.text}</p>
          )}

          {/* Image */}
          {post.galleryCollageUrl && (
            <div className="rounded-2xl overflow-hidden mb-5 border border-gray-800 shadow-inner">
              <img
                src={post.galleryCollageUrl}
                className="w-full max-h-[550px] object-cover block"
                alt="Post"
              />
            </div>
          )}

          {/* Card Footer Info */}
          {(club?.name || eventDate?.startDateTime) && (
            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-800/50">
              {club?.profilePicUrl && (
                <div className="w-9 h-9 rounded-xl overflow-hidden border border-gray-800 shrink-0">
                  <img
                    src={club.profilePicUrl}
                    alt={club.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-[#38bdf8] font-black uppercase tracking-widest truncate">{club?.name || "Unknown Club"}</span>
                  {club?.shortAddress && (
                    <>
                      <span className="text-[11px] text-gray-750">•</span>
                      <span className="text-[11px] text-gray-500 flex items-center gap-1 font-bold">
                        <MapPinIcon />
                        {club.shortAddress}
                      </span>
                    </>
                  )}
                  {club?.distance && (
                    <>
                      <span className="text-[11px] text-gray-755">•</span>
                      <span className="text-[11px] text-[#fbc02d] font-black uppercase tracking-widest">{club.distance.toFixed(1)} km</span>
                    </>
                  )}
                </div>
                {eventDate?.startDateTime && (
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-1 font-bold">
                    <ClockIcon />
                    <span>{formatDateRange(eventDate.startDateTime, eventDate.endDateTime)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Engagement */}
          <div className="flex items-center gap-6 pt-4 mt-3 border-t border-gray-800">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 text-[14px] font-black uppercase tracking-widest transition-all ${isLiked ? "text-[#38bdf8] drop-shadow-[0_0_8px_rgba(56,189,248,0.3)]" : "text-gray-500 hover:text-[#38bdf8]"
                }`}
            >
              <HeartIcon filled={isLiked} />
              <span>{likeCount}</span>
            </button>

            <span className="flex items-center gap-2 text-[14px] font-black uppercase tracking-widest text-gray-500">
              <ChatIcon />
              <span>{comments.length}</span>
            </span>

            <span className="flex items-center gap-2 text-[14px] font-black uppercase tracking-widest text-gray-500">
              <EyeIcon />
              <span>{post.countViews || 0}</span>
            </span>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-[#1a2332] border border-gray-800 rounded-[28px] p-6 shadow-2xl">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 border-b border-gray-800 pb-3">
            Discussion ({comments.length})
          </h3>

          {/* Add Comment Input */}
          <div className="flex gap-4 mb-8">
            <input
              type="text"
              placeholder="Join the discussion..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleComment()}
              disabled={isCommenting}
              className="flex-1 px-5 py-3 rounded-2xl bg-[#0d1b2a] text-white text-[13px] outline-none border border-gray-800 focus:border-[#38bdf8]/50 transition-all font-bold"
            />
            <button
              onClick={handleComment}
              disabled={isCommenting || !newComment.trim()}
              className="px-6 py-3 bg-[#38bdf8] text-[#0d1b2a] rounded-2xl text-[11px] font-black uppercase tracking-widest disabled:opacity-50 hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              {isCommenting ? (
                <div className="w-4 h-4 border-2 border-[#0d1b2a] border-t-transparent animate-spin rounded-full"></div>
              ) : (
                "Send"
              )}
            </button>
          </div>

          {/* Comments List */}
          {loadingComments ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 opacity-55">
              <div className="w-8 h-8 rounded-full border-2 border-[#38bdf8] border-t-transparent animate-spin"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Loading discussion...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-800 rounded-2xl">
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/5">
                <i className="bi bi-chat-dots text-gray-600 text-xl"></i>
              </div>
              <p className="text-gray-500 text-[11px] font-black uppercase tracking-widest">No comments yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {comments.map((c) => (
                <CommentItem
                  key={c.uid}
                  comment={c}
                  isPostAdmin={post.user?.uid === auth.currentUser?.uid}
                  currentUserId={auth.currentUser?.uid}
                  activeReplyCommentUid={activeReplyCommentUid}
                  onStartReply={(uid) => setActiveReplyCommentUid(uid)}
                  onCancelReply={() => setActiveReplyCommentUid(null)}
                  onAddReply={handleCommentReply}
                  onLike={handleCommentLike}
                  onBlock={(commentObj) => setBlockTargetComment(commentObj)}
                  onReport={(commentObj) => setReportTargetComment(commentObj)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Block Confirmation Modal */}
      {blockTargetComment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
          onClick={() => setBlockTargetComment(null)}
        >
          <div
            className="bg-[#1a2332] border border-gray-800 rounded-[32px] p-6 max-w-sm w-full relative shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-black text-white uppercase tracking-widest mb-2">
              Block User
            </h3>
            <p className="text-gray-400 text-xs font-bold mb-6">
              Are you sure you want to block user <span className="text-white">{blockTargetComment.user?.displayName}</span>?
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleBlockConfirm}
                disabled={blockingLoading}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-600 disabled:opacity-50 transition-all shadow-lg font-black"
              >
                {blockingLoading ? "Blocking..." : "Block"}
              </button>
              <button
                onClick={() => setBlockTargetComment(null)}
                className="flex-1 py-3 bg-[#0d1b2a] border border-gray-800 text-gray-400 rounded-xl text-xs font-black uppercase tracking-widest hover:text-white transition-all font-black"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report User Modal */}
      {reportTargetComment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
          onClick={() => {
            setReportTargetComment(null);
            setReportReason("");
          }}
        >
          <div
            className="bg-[#1a2332] border border-gray-800 rounded-[32px] p-6 max-w-md w-full relative shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-black text-white uppercase tracking-widest mb-2">
              Report User
            </h3>
            <p className="text-gray-400 text-xs font-bold mb-4">
              Report user <span className="text-white">{reportTargetComment.user?.displayName}</span> for their comment.
            </p>

            <div className="mb-6">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                Reason for Reporting
              </label>
              <textarea
                placeholder="Please describe why you are reporting this user..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full h-28 px-4 py-3 rounded-xl bg-[#0d1b2a] text-white text-xs outline-none border border-gray-800 focus:border-[#38bdf8]/50 transition-all font-bold resize-none"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleReportSubmit(reportReason)}
                disabled={reportingLoading || !reportReason.trim()}
                className="flex-1 py-3 bg-yellow-500 text-[#0d1b2a] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-yellow-600 disabled:opacity-50 transition-all shadow-lg font-black"
              >
                {reportingLoading ? "Submitting..." : "Submit Report"}
              </button>
              <button
                onClick={() => {
                  setReportTargetComment(null);
                  setReportReason("");
                }}
                className="flex-1 py-3 bg-[#0d1b2a] border border-gray-800 text-gray-400 rounded-xl text-xs font-black uppercase tracking-widest hover:text-white transition-all font-black"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
