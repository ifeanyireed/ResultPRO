import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, Heart, MessageCircle, Share2 } from 'lucide-react';

interface BlogComment {
  id: string;
  authorName: string;
  authorEmail: string;
  content: string;
  createdAt: string;
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  htmlContent?: string;
  excerpt: string;
  authorName: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  comments: BlogComment[];
  _count?: {
    comments: number;
  };
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [commentForm, setCommentForm] = useState({
    authorName: '',
    authorEmail: '',
    content: '',
  });
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/super-admin/blog/public/posts/${slug}`);
        setPost(res.data.data);
      } catch (error) {
        console.error('Error fetching post:', error);
        navigate('/blog');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug, navigate]);

  const handleLike = async () => {
    if (!post) return;
    try {
      const userEmail = localStorage.getItem('userEmail') || 'guest@example.com';
      await axios.post(`/api/super-admin/blog/public/posts/${slug}/like`, {
        email: userEmail,
      });
      setLiked(!liked);
      setPost({
        ...post,
        likeCount: liked ? post.likeCount - 1 : post.likeCount + 1,
      });
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !commentForm.content.trim()) return;

    try {
      setSubmittingComment(true);
      await axios.post(`/api/super-admin/blog/public/posts/${post.id}/comments`, {
        authorName: commentForm.authorName || 'Anonymous',
        authorEmail: commentForm.authorEmail,
        content: commentForm.content,
      });

      // Reset form and show success message
      setCommentForm({ authorName: '', authorEmail: '', content: '' });
      alert('Comment submitted and is pending approval');
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to submit comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.excerpt,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-blue-200 text-lg mb-4">Post not found</p>
          <button
            onClick={() => navigate('/blog')}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
          >
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/blog')}
          className="flex items-center gap-2 text-blue-300 hover:text-blue-100 mb-8 transition"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Blog
        </button>

        {/* Article Header */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-8 mb-8">
          {/* Category and Date */}
          <div className="flex items-center justify-between mb-4">
            <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full">
              {post.category.name}
            </span>
            <span className="text-blue-300 text-sm">
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-blue-100 text-lg mb-6">{post.excerpt}</p>

          {/* Article Meta */}
          <div className="flex flex-wrap items-center gap-6 text-blue-300 text-sm border-t border-white/10 pt-6">
            <div className="flex items-center gap-2">
              <span className="font-medium">{post.authorName}</span>
            </div>
            <div className="flex items-center gap-2">
              👁️ <span>{post.viewCount} views</span>
            </div>
            <div className="flex items-center gap-2">
              💬 <span>{post._count?.comments || 0} comments</span>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-8 mb-8">
          <div className="prose prose-invert max-w-none dark:prose-dark">
            {post.htmlContent ? (
              <div
                dangerouslySetInnerHTML={{ __html: post.htmlContent }}
                className="text-blue-100 leading-relaxed"
              />
            ) : (
              <p className="text-blue-100 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            )}
          </div>

          {/* Article Actions */}
          <div className="flex flex-wrap items-center gap-4 mt-8 pt-8 border-t border-white/10">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                liked
                  ? 'bg-red-500/20 text-red-300'
                  : 'bg-white/10 text-blue-300 hover:bg-white/20'
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
              {post.likeCount}
            </button>
            <button
              onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-blue-300 hover:bg-white/20 transition"
            >
              <MessageCircle className="w-5 h-5" />
              Comment
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-blue-300 hover:bg-white/20 transition"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <div id="comments" className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Comments</h2>

          {/* Comment Form */}
          {post.allowComments !== false && (
            <form
              onSubmit={handleCommentSubmit}
              className="mb-8 p-6 bg-white/5 rounded-lg border border-white/10"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Leave a Comment</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Your Name (optional)"
                  value={commentForm.authorName}
                  onChange={(e) =>
                    setCommentForm({ ...commentForm, authorName: e.target.value })
                  }
                  className="bg-white/10 border border-blue-300/30 rounded-lg px-4 py-2 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder="Your Email *"
                  required
                  value={commentForm.authorEmail}
                  onChange={(e) =>
                    setCommentForm({ ...commentForm, authorEmail: e.target.value })
                  }
                  className="bg-white/10 border border-blue-300/30 rounded-lg px-4 py-2 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <textarea
                placeholder="Your comment..."
                required
                rows={4}
                value={commentForm.content}
                onChange={(e) =>
                  setCommentForm({ ...commentForm, content: e.target.value })
                }
                className="w-full bg-white/10 border border-blue-300/30 rounded-lg px-4 py-2 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              />

              <button
                type="submit"
                disabled={submittingComment}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg transition font-semibold"
              >
                {submittingComment ? 'Submitting...' : 'Submit Comment'}
              </button>
              <p className="text-sm text-blue-300 mt-2">
                Comments are moderated and will appear after approval
              </p>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-white">{comment.authorName}</p>
                      <p className="text-sm text-blue-300">{comment.authorEmail}</p>
                    </div>
                    <span className="text-sm text-blue-300">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-blue-100">{comment.content}</p>
                </div>
              ))
            ) : (
              <p className="text-blue-300 text-center py-8">
                No approved comments yet. Be the first to comment!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
