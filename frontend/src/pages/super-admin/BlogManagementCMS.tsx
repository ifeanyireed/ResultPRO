import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  Eye,
  Heart,
  MessageSquare,
  BarChart3,
  Folder,
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  status: string;
  publishedAt?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  category: {
    id: string;
    name: string;
  };
  _count?: {
    comments: number;
  };
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  _count?: {
    posts: number;
  };
}

interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalCategories: number;
  totalComments: number;
  totalLikes: number;
  topPosts: BlogPost[];
}

interface BlogComment {
  id: string;
  content: string;
  authorName: string;
  authorEmail: string;
  status: string;
  createdAt: string;
  post?: {
    title: string;
  };
}

export default function BlogManagementCMS() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'posts' | 'categories' | 'comments'>('dashboard');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    categoryId: '',
    authorName: '',
    authorEmail: '',
  });

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/super-admin/blog/cms/stats');
      setStats(res.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await axios.get('/api/super-admin/blog/cms/posts', {
        params: { limit: 50 },
      });
      setPosts(res.data.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/super-admin/blog/public/categories');
      setCategories(res.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get('/api/super-admin/blog/cms/posts');
      const allComments: BlogComment[] = [];
      // Fetch comments from each post
      // Note: In a real implementation, you'd want a dedicated endpoint
      setComments(allComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchPosts(), fetchCategories()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPost) {
        await axios.put(`/api/super-admin/blog/cms/posts/${editingPost.id}`, formData);
      } else {
        await axios.post('/api/super-admin/blog/cms/posts', formData);
      }
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        categoryId: '',
        authorName: '',
        authorEmail: '',
      });
      setShowPostForm(false);
      setEditingPost(null);
      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Error saving post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`/api/super-admin/blog/cms/posts/${postId}`);
        fetchPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Error deleting post');
      }
    }
  };

  const handlePublishPost = async (postId: string) => {
    try {
      await axios.post(`/api/super-admin/blog/cms/posts/${postId}/publish`);
      fetchPosts();
    } catch (error) {
      console.error('Error publishing post:', error);
      alert('Error publishing post');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`/api/super-admin/blog/cms/categories/${categoryId}`);
        fetchCategories();
      } catch (error: any) {
        console.error('Error deleting category:', error);
        alert(error.response?.data?.error || 'Error deleting category');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Blog Management</h1>
          <p className="text-blue-300">Manage blog posts, categories, and comments</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-white/10">
          {['dashboard', 'posts', 'categories', 'comments'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-3 font-semibold capitalize transition ${
                activeTab === tab
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-blue-300 hover:text-blue-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            {stats && (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                  <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-6">
                    <p className="text-blue-300 text-sm mb-2">Total Posts</p>
                    <p className="text-3xl font-bold text-white">{stats.totalPosts}</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-6">
                    <p className="text-blue-300 text-sm mb-2">Published</p>
                    <p className="text-3xl font-bold text-white">{stats.publishedPosts}</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-6">
                    <p className="text-blue-300 text-sm mb-2">Drafts</p>
                    <p className="text-3xl font-bold text-white">{stats.draftPosts}</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-6">
                    <p className="text-blue-300 text-sm mb-2">Categories</p>
                    <p className="text-3xl font-bold text-white">{stats.totalCategories}</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-6">
                    <p className="text-blue-300 text-sm mb-2">Comments</p>
                    <p className="text-3xl font-bold text-white">{stats.totalComments}</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-6">
                    <p className="text-blue-300 text-sm mb-2">Likes</p>
                    <p className="text-3xl font-bold text-white">{stats.totalLikes}</p>
                  </div>
                </div>

                {/* Top Posts */}
                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Top Posts
                  </h3>
                  <div className="space-y-2">
                    {stats.topPosts.map((post) => (
                      <div
                        key={post.id}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                      >
                        <span className="text-white font-medium">{post.title}</span>
                        <div className="flex items-center gap-4 text-sm text-blue-300">
                          <span className="flex items-center gap-1">
                            👁️ {post.viewCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" /> {post.likeCount}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div>
            <button
              onClick={() => {
                setEditingPost(null);
                setFormData({
                  title: '',
                  slug: '',
                  excerpt: '',
                  content: '',
                  categoryId: '',
                  authorName: '',
                  authorEmail: '',
                });
                setShowPostForm(!showPostForm);
              }}
              className="mb-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold transition"
            >
              <Plus className="w-5 h-5" />
              New Post
            </button>

            {/* Post Form */}
            {showPostForm && (
              <form onSubmit={handleCreatePost} className="mb-8 bg-white/5 backdrop-blur border border-white/10 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  {editingPost ? 'Edit Post' : 'Create New Post'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-white/10 border border-blue-300/30 rounded-lg px-4 py-2 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Slug"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="bg-white/10 border border-blue-300/30 rounded-lg px-4 py-2 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="bg-white/10 border border-blue-300/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Author Name"
                    required
                    value={formData.authorName}
                    onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                    className="bg-white/10 border border-blue-300/30 rounded-lg px-4 py-2 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="Author Email"
                    required
                    value={formData.authorEmail}
                    onChange={(e) => setFormData({ ...formData, authorEmail: e.target.value })}
                    className="bg-white/10 border border-blue-300/30 rounded-lg px-4 py-2 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <textarea
                  placeholder="Excerpt"
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full bg-white/10 border border-blue-300/30 rounded-lg px-4 py-2 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />

                <textarea
                  placeholder="Content"
                  rows={6}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-white/10 border border-blue-300/30 rounded-lg px-4 py-2 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition"
                  >
                    {editingPost ? 'Update' : 'Create'} Post
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPostForm(false)}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-blue-300 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Posts List */}
            <div className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-4 flex items-center justify-between hover:bg-white/10 transition"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">{post.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-blue-300">
                      <span className="flex items-center gap-1">
                        <Folder className="w-4 h-4" /> {post.category.name}
                      </span>
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-full ${post.status === 'PUBLISHED' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                        {post.status === 'PUBLISHED' ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        {post.status}
                      </span>
                      <span className="flex items-center gap-1">
                        👁️ {post.viewCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" /> {post.likeCount}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {post.status === 'DRAFT' && (
                      <button
                        onClick={() => handlePublishPost(post.id)}
                        className="p-2 hover:bg-green-500/20 text-green-400 rounded-lg transition"
                        title="Publish"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingPost(post);
                        setFormData({
                          title: post.title,
                          slug: post.slug,
                          excerpt: post.excerpt || '',
                          content: post.content || '',
                          categoryId: post.category.id,
                          authorName: post.authorName || '',
                          authorEmail: post.authorEmail || '',
                        });
                        setShowPostForm(true);
                      }}
                      className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            <button
              onClick={() => setShowCategoryForm(!showCategoryForm)}
              className="mb-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold transition"
            >
              <Plus className="w-5 h-5" />
              New Category
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">{cat.name}</h4>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-1 hover:bg-red-500/20 text-red-400 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-blue-300 mb-2">Slug: {cat.slug}</p>
                  <p className="text-sm text-blue-200">
                    Posts: <span className="font-semibold">{cat._count?.posts || 0}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <div>
            <p className="text-blue-300 text-center py-8">
              Comment moderation system coming soon
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
