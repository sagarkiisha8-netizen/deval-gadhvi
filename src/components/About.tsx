import { motion } from 'motion/react';
import { FileCheck, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCmsData } from '../context/CmsContext';

export default function About() {
  const { getMediaUrl, getSiteMedia } = useCmsData();
  const mediaItem = getSiteMedia('homepage', 'aboutPreview', 'featured');
  const imageUrl = getMediaUrl('homepage', 'aboutPreview', 'featured') || 
    "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=1200";

  return (
    <section id="about" className="py-20 md:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Image of Doctor consulting with patients */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6"
          >
            <div className="rounded-[32px] overflow-hidden shadow-sm border border-slate-100 aspect-[4/3] sm:aspect-[1/1] max-h-[500px] w-full bg-slate-100">
              <img 
                src={imageUrl} 
                alt={mediaItem?.altText || "Doctor consulting with patients at Newark Medical Associates"} 
                className="w-full h-full"
                style={{
                  objectFit: (mediaItem?.objectFit as any) || 'cover',
                  objectPosition: mediaItem?.position || 'center'
                }}
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>

          {/* Right Column: About Us Header, Mission, Vision, and CTA */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6"
          >
            {/* Category Indicator Dot */}
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
              <span className="text-slate-800 text-sm font-medium">About us</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-[1.15] mb-8">
              Vision for a healthier and <br className="hidden sm:inline" />
              brighter tomorrow
            </h2>

            {/* Mission & Vision Items */}
            <div className="space-y-6 mb-8">
              {/* Our Mission */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <FileCheck size={20} className="stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Our Mission</h3>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg">
                    To keep Newark healthy through accessible, preventive care that empowers every patient to live their best life
                  </p>
                </div>
              </div>

              {/* Our Vision */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield size={20} className="stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Our Vision</h3>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg">
                    To be trusted healthcare partner, promoting wellness and prevention for a healthier, stronger community.
                  </p>
                </div>
              </div>
            </div>

            {/* Learn More Button */}
            <div>
              <Link
                to="/about"
                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-8 py-3 rounded-full shadow-xs hover:shadow transition-all"
              >
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
