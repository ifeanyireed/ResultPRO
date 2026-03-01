import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Search, ChevronLeft, ChevronRight, Heart } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImageUrl?: string;
  authorName: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  category: {
    id: string;
    name: string;
    slug: string;
    icon?: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export default function BlogList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const selectedCategory = searchParams.get('category');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/super-admin/blog/public/posts', {
        params: {
          page,
          limit: 10,
          category: selectedCategory,
        },
      });
      setPosts(res.data.data);
      setTotalPages(res.data.pagination.pages);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
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

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [page, selectedCategory]);

  const handleCategoryChange = (slug: string | null) => {
    setPage(1);
    if (slug) {
      setSearchParams({ category: slug, page: '1' });
    } else {
      setSearchParams({ page: '1' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            ResultsPRO Blog
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Educational insights, updates, and best practices
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-blue-300/30 rounded-lg px-4 py-3 pl-10 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-blue-300" />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          <button
            onClick={() => handleCategoryChange(null)}
            className={`px-4 py-2 rounded-full transition ${
              !selectedCategory
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-blue-100 hover:bg-white/20'
            }`}
          >
            All Articles
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`px-4 py-2 rounded-full transition ${
                selectedCategory === cat.slug
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-blue-100 hover:bg-white/20'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-lg">
            <p className="text-blue-200 text-lg">No articles found</p>
          </div>
        ) : (
          <>
            {/* Blog Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group bg-white/5 backdrop-blur rounded-lg overflow-hidden hover:bg-white/10 transition border border-white/10 hover:border-blue-400/50"
                >
                  {post.featuredImageUrl && (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-blue-600 overflow-hidden">
                      <img
                        src={post.featuredImageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full">
                        {post.category.name}
                      </span>
                      <span className="text-sm text-blue-300">
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-300">
                      {post.title}
                    </h3>
                    <p className="text-blue-200 text-sm mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-blue-300 pt-4 border-t border-white/10">
                      <span>{post.authorName}</span>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          👁️ {post.viewCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" /> {post.likeCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <button
                  clicked={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg bg-white/10 text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-3 py-1 rounded-lg transition ${
                        page === p
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 text-blue-300 hover:bg-white/20'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg bg-white/10 text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
