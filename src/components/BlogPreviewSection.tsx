import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useCmsData } from '../context/CmsContext';

export default function BlogPreviewSection() {
  const { blogs, getMediaUrl } = useCmsData();

  const publishedBlogs = blogs && blogs.length > 0
    ? blogs.filter((b) => b.status === 'published')
    : [];

  const fallbackArticles = [
    {
      id: 'post-1',
      slug: 'preventive-care-screenings-adults-newark',
      title: 'Why Annual Preventive Screenings Save Lives: A Primary Care Guide',
      excerpt: 'Most chronic conditions including early-stage hypertension, pre-diabetes, and lipid disorders produce zero early symptoms. Learn why regular biomarker testing is your strongest health defense.',
      featuredImage: getMediaUrl('blog', 'post-1', 'thumbnail') || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1200',
      category: 'Preventive Medicine',
      readTime: '5 min read',
      date: 'April 2025'
    },
    {
      id: 'post-2',
      slug: 'managing-hypertension-guidelines',
      title: 'Understanding Blood Pressure Numbers & Long-Term Heart Health',
      excerpt: 'Practical dietary shifts, in-office diagnostic tracking, and actionable steps to maintain cardiovascular stability.',
      featuredImage: getMediaUrl('blog', 'post-2', 'thumbnail') || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=800',
      category: 'Cardiovascular Care',
      readTime: '4 min read',
      date: 'March 2025'
    },
    {
      id: 'post-3',
      slug: 'in-office-diagnostics-speed-and-accuracy',
      title: 'Why In-Office Diagnostics Matter for Accurate Medical Diagnosis',
      excerpt: 'How immediate certified phlebotomy lab testing and on-site EKGs accelerate acute clinical decisions without hospital delays.',
      featuredImage: getMediaUrl('blog', 'post-3', 'thumbnail') || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
      category: 'Clinical Diagnostics',
      readTime: '6 min read',
      date: 'February 2025'
    }
  ];

  const articles = publishedBlogs.length >= 3
    ? publishedBlogs.slice(0, 3).map((b, i) => ({
        id: b.id,
        slug: b.slug,
        title: b.title,
        excerpt: b.excerpt || b.content?.slice(0, 140) || fallbackArticles[i]?.excerpt,
        featuredImage: getMediaUrl('blog', b.id, 'thumbnail') || getMediaUrl('blog', b.slug, 'thumbnail') || b.featuredImage || fallbackArticles[i]?.featuredImage,
        category: b.category || 'Clinical Health',
        readTime: `${b.readTime || 5} min read`,
        date: b.publishDate ? new Date(b.publishDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recent'
      }))
    : fallbackArticles;

  const featured = articles[0];
  const sideArticles = articles.slice(1, 3);

  return (
    <section id="blog-preview" className="bg-[#FCFBF8] py-16 sm:py-24 lg:py-32 border-b border-[#D9D0C5] overflow-hidden">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16 pb-6 border-b border-[#D9D0C5]"
        >
          <div>
            <p className="text-[11.5px] sm:text-[12px] uppercase font-bold tracking-[0.24em] text-[#B39A68] mb-2 sm:mb-3">
              Physician Perspectives
            </p>
            <h2 className="font-serif text-[32px] sm:text-[46px] lg:text-[56px] xl:text-[58px] text-[#0B1F2A] leading-[1.08] sm:leading-[1.05] tracking-[-0.02em]">
              The Newark Health Journal.
            </h2>
          </div>

          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-[13.5px] sm:text-[14.5px] font-bold uppercase tracking-wider text-[#0B1F2A] hover:text-[#315B52] transition-colors group min-h-[44px]"
          >
            <span>Browse All Articles</span>
            <ArrowRight size={16} className="text-[#B39A68] group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Magazine Editorial Layout (1 Large Featured + 2 Stacked Beside It) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-14">
          
          {/* Large Featured Article (7 Cols) */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 flex flex-col group"
          >
            <Link to={`/blog/${featured.slug}`} className="block relative aspect-[16/10] overflow-hidden mb-5 sm:mb-6 bg-[#F4EFE6] rounded-xs">
              <img
                src={featured.featuredImage}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 sm:top-6 left-4 sm:left-6 px-3 sm:px-3.5 py-1 bg-[#0B1F2A] text-[#FCFBF8] text-[11px] sm:text-[11.5px] font-bold uppercase tracking-widest">
                {featured.category}
              </div>
            </Link>

            <div className="flex items-center gap-3 text-[12.5px] sm:text-[13px] font-medium text-[#5A6264] mb-2.5 sm:mb-3">
              <span>{featured.date}</span>
              <span>•</span>
              <span>{featured.readTime}</span>
            </div>

            <h3 className="font-serif text-[26px] sm:text-[32px] lg:text-[36px] text-[#0B1F2A] leading-tight mb-3 sm:mb-4 group-hover:text-[#315B52] transition-colors">
              <Link to={`/blog/${featured.slug}`}>
                {featured.title}
              </Link>
            </h3>

            <p className="font-sans text-[14.5px] sm:text-[16px] text-[#5A6264] leading-[1.65] sm:leading-[1.7] mb-5 sm:mb-6">
              {featured.excerpt}
            </p>

            <div>
              <Link
                to={`/blog/${featured.slug}`}
                className="inline-flex items-center gap-2 text-[13.5px] sm:text-[14px] font-bold uppercase tracking-wider text-[#0B1F2A] hover:text-[#315B52] transition-colors group/link min-h-[44px]"
              >
                <span className="border-b border-[#0B1F2A] group-hover/link:border-[#315B52]">Read Full Article</span>
                <ArrowRight size={15} className="text-[#B39A68] group-hover/link:translate-x-1.5 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Two Smaller Articles Beside It (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between divide-y divide-[#D9D0C5]">
            {sideArticles.map((post, idx) => (
              <motion.div 
                key={post.id} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: 0.15 + idx * 0.1 }}
                className="py-6 sm:py-8 first:pt-0 last:pb-0 flex flex-col group"
              >
                <div className="relative aspect-[16/9] sm:aspect-[21/9] lg:aspect-[16/9] overflow-hidden mb-4 sm:mb-5 bg-[#F4EFE6] rounded-xs">
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 px-2.5 sm:px-3 py-1 bg-[#0B1F2A] text-[#FCFBF8] text-[10.5px] sm:text-[11px] font-bold uppercase tracking-widest">
                    {post.category}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[12px] sm:text-[12.5px] font-medium text-[#5A6264] mb-2">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>

                <h4 className="font-serif text-[20px] sm:text-[24px] lg:text-[26px] text-[#0B1F2A] leading-snug mb-2.5 sm:mb-3 group-hover:text-[#315B52] transition-colors">
                  <Link to={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h4>

                <p className="font-sans text-[14px] sm:text-[15px] text-[#5A6264] leading-[1.65] mb-4 line-clamp-2">
                  {post.excerpt}
                </p>

                <div>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 text-[13px] sm:text-[13.5px] font-bold uppercase tracking-wider text-[#0B1F2A] hover:text-[#315B52] transition-colors group/link min-h-[44px]"
                  >
                    <span className="border-b border-[#0B1F2A] group-hover/link:border-[#315B52]">Read Article</span>
                    <ArrowRight size={14} className="text-[#B39A68] group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
