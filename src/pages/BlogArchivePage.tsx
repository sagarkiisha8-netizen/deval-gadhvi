import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, Calendar, Clock, ArrowRight, X, BookOpen, ShieldCheck 
} from 'lucide-react';
import { useCmsData } from '../context/CmsContext';
import SeoHead from '../components/SeoHead';

const INITIAL_PAGE_SIZE = 9;
const PAGE_INCREMENT = 6;

export default function BlogArchivePage() {
  const { blogs, blogCategories, siteSettings, loading, trackPageView, getMediaUrl } = useCmsData();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialCategory = searchParams.get('category') || 'all';
  const initialTag = searchParams.get('tag') || null;

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedTag, setSelectedTag] = useState<string | null>(initialTag);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_PAGE_SIZE);

  useEffect(() => {
    trackPageView('/blog');
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category');
    const tag = searchParams.get('tag');
    if (cat) setSelectedCategory(cat);
    if (tag) setSelectedTag(tag);
  }, [searchParams]);

  const publishedBlogs = useMemo(() => {
    return blogs.filter((b) => b.status === 'published');
  }, [blogs]);

  const featuredArticle = useMemo(() => {
    if (publishedBlogs.length === 0) return null;
    return publishedBlogs.find((b) => b.isFeatured) || publishedBlogs[0];
  }, [publishedBlogs]);

  const filteredArticles = useMemo(() => {
    return publishedBlogs.filter((b) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        b.category.toLowerCase() === selectedCategory.toLowerCase() ||
        b.categoryId === selectedCategory;

      const matchesTag = !selectedTag || (b.tags && b.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase()));

      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        b.title.toLowerCase().includes(query) ||
        (b.excerpt && b.excerpt.toLowerCase().includes(query)) ||
        (b.category && b.category.toLowerCase().includes(query)) ||
        (b.author && b.author.toLowerCase().includes(query)) ||
        (b.tags && b.tags.some((t) => t.toLowerCase().includes(query)));

      return matchesCategory && matchesTag && matchesSearch;
    });
  }, [publishedBlogs, selectedCategory, selectedTag, searchTerm]);

  const isDefaultView = selectedCategory === 'all' && !selectedTag && !searchTerm;
  const gridArticles = useMemo(() => {
    if (isDefaultView && featuredArticle) {
      return filteredArticles.filter((b) => b.id !== featuredArticle.id);
    }
    return filteredArticles;
  }, [filteredArticles, isDefaultView, featuredArticle]);

  const displayedArticles = useMemo(() => {
    return gridArticles.slice(0, visibleCount);
  }, [gridArticles, visibleCount]);

  const hasMore = visibleCount < gridArticles.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PAGE_INCREMENT);
  };

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSelectedTag(null);
    setVisibleCount(INITIAL_PAGE_SIZE);
    if (categoryName === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', categoryName);
    }
    setSearchParams(searchParams);
  };

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedTag(null);
    setSearchTerm('');
    setVisibleCount(INITIAL_PAGE_SIZE);
    setSearchParams({});
  };

  return (
    <div className="bg-[#FCFBF8] text-[#252A2B] min-h-screen overflow-hidden">
      <SeoHead
        title="The Health Journal | Medical Insights & Preventive Care | Newark Medical Associates"
        description="Expert clinical guidance, preventive screening protocols, and healthy living insights written by board-certified physicians in Newark, NJ."
        keywords={['health blog Newark NJ', 'medical articles Newark', 'preventive medicine advice', 'Dr. Prahlad Gadhvi health tips']}
        canonicalUrl="https://newarkmed.com/blog"
      />

      {/* 1. Header Hero: Warm Ivory Editorial Hero */}
      <section className="bg-[#F4EFE6] py-20 sm:py-24 lg:py-28 border-b border-[#D9D0C5]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="max-w-4xl">
            <p className="text-[12px] uppercase font-bold tracking-[0.24em] text-[#B39A68] mb-4">
              Physician Perspectives
            </p>
            <h1 className="font-serif text-[44px] sm:text-[58px] lg:text-[68px] text-[#0B1F2A] leading-[1.04] tracking-[-0.02em] mb-6">
              The Newark Health Journal.
            </h1>
            <p className="font-sans text-[18px] sm:text-[20px] text-[#5A6264] leading-[1.7] max-w-2xl">
              Evidence-based medical guidance, preventive screening advice, and insights into adult wellness directly from our Newark clinical team.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-20">
        
        {/* Search & Categories Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 mb-12 border-b border-[#D9D0C5]">
          {/* Category Tabs */}
          <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap min-w-max pb-2 md:pb-0">
            <button
              onClick={() => handleCategorySelect('all')}
              className={`text-[15px] pb-1 transition-all relative font-medium ${
                selectedCategory === 'all' && !selectedTag
                  ? 'text-[#0B1F2A] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#0B1F2A]'
                  : 'text-[#5A6264] hover:text-[#0B1F2A]'
              }`}
            >
              All Articles ({publishedBlogs.length})
            </button>

            {blogCategories.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase() && !selectedTag;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.name)}
                  className={`text-[15px] pb-1 transition-all relative font-medium ${
                    isSelected
                      ? 'text-[#0B1F2A] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#0B1F2A]'
                      : 'text-[#5A6264] hover:text-[#0B1F2A]'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[280px]">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A6264]" />
            <input
              type="text"
              placeholder="Search clinical topics..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setVisibleCount(INITIAL_PAGE_SIZE);
              }}
              className="w-full bg-[#FCFBF8] border border-[#D9D0C5] px-10 py-2.5 text-[14px] text-[#0B1F2A] placeholder:text-[#5A6264] focus:outline-none focus:border-[#0B1F2A]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5A6264] hover:text-[#0B1F2A]"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Featured Article */}
        {featuredArticle && isDefaultView && (
          <div className="mb-20 pb-16 border-b border-[#D9D0C5]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center group">
              <div className="lg:col-span-7">
                <Link to={`/blog/${featuredArticle.slug}`} className="block relative aspect-[16/10] overflow-hidden bg-[#F4EFE6] border border-[#D9D0C5]">
                  <img
                    src={getMediaUrl('blog', featuredArticle.id, 'thumbnail') || getMediaUrl('blog', featuredArticle.slug, 'thumbnail') || featuredArticle.coverImage || featuredArticle.featuredImage}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                  />
                  <div className="absolute top-6 left-6 px-3.5 py-1 bg-[#0B1F2A] text-[#FCFBF8] text-[11px] font-bold uppercase tracking-widest">
                    Featured Publication
                  </div>
                </Link>
              </div>

              <div className="lg:col-span-5">
                <div className="flex items-center gap-3 text-[13px] font-medium text-[#5A6264] mb-3">
                  <span>{featuredArticle.publishDate}</span>
                  <span>•</span>
                  <span>{featuredArticle.readTimeMinutes || 5} min read</span>
                </div>

                <h2 className="font-serif text-[32px] sm:text-[40px] text-[#0B1F2A] leading-tight mb-4 group-hover:text-[#315B52] transition-colors">
                  <Link to={`/blog/${featuredArticle.slug}`}>
                    {featuredArticle.title}
                  </Link>
                </h2>

                <p className="font-sans text-[16.5px] text-[#5A6264] leading-[1.7] mb-6">
                  {featuredArticle.excerpt}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-[#D9D0C5]">
                  <span className="text-[13.5px] text-[#252A2B] font-semibold">
                    By {featuredArticle.author}
                  </span>

                  <Link
                    to={`/blog/${featuredArticle.slug}`}
                    className="inline-flex items-center gap-2 text-[13.5px] font-bold uppercase tracking-wider text-[#0B1F2A] hover:text-[#315B52] transition-colors"
                  >
                    <span>Read Article</span>
                    <ArrowRight size={14} className="text-[#B39A68]" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        {displayedArticles.length === 0 ? (
          <div className="text-center py-20 border border-[#D9D0C5] bg-[#F4EFE6]/40 p-12">
            <h3 className="font-serif text-[28px] text-[#0B1F2A] mb-3">No articles found matching your criteria.</h3>
            <p className="font-sans text-[15px] text-[#5A6264] mb-6">Try clearing your search terms or view all publications.</p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-3 bg-[#0B1F2A] text-[#FCFBF8] text-[13px] font-bold uppercase tracking-wider"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
            {displayedArticles.map((article) => (
              <article key={article.id} className="flex flex-col justify-between group border-b border-[#D9D0C5] pb-10">
                <div>
                  <Link to={`/blog/${article.slug}`} className="block relative aspect-[16/10] overflow-hidden bg-[#F4EFE6] border border-[#D9D0C5] mb-5">
                    <img
                      src={getMediaUrl('blog', article.id, 'thumbnail') || getMediaUrl('blog', article.slug, 'thumbnail') || article.coverImage || article.featuredImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4 px-3 py-0.5 bg-[#0B1F2A] text-[#FCFBF8] text-[10.5px] font-bold uppercase tracking-widest">
                      {article.category}
                    </div>
                  </Link>

                  <div className="flex items-center gap-2.5 text-[12.5px] font-medium text-[#5A6264] mb-2.5">
                    <span>{article.publishDate}</span>
                    <span>•</span>
                    <span>{article.readTimeMinutes || 4} min read</span>
                  </div>

                  <h3 className="font-serif text-[24px] text-[#0B1F2A] leading-snug mb-3 group-hover:text-[#315B52] transition-colors">
                    <Link to={`/blog/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h3>

                  <p className="font-sans text-[15px] text-[#5A6264] leading-[1.65] line-clamp-3 mb-6">
                    {article.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#D9D0C5]/60 flex items-center justify-between">
                  <span className="text-[12.5px] text-[#5A6264]">
                    {article.author}
                  </span>

                  <Link
                    to={`/blog/${article.slug}`}
                    className="inline-flex items-center gap-1.5 text-[13px] font-bold uppercase tracking-wider text-[#0B1F2A] hover:text-[#315B52] transition-colors"
                  >
                    <span>Read</span>
                    <ArrowRight size={13} className="text-[#B39A68]" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center pt-14">
            <button
              onClick={handleLoadMore}
              className="px-8 py-4 border border-[#0B1F2A] hover:bg-[#0B1F2A] hover:text-[#FCFBF8] text-[#0B1F2A] font-bold uppercase tracking-wider text-[13px] transition-colors"
            >
              Load More Articles
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
