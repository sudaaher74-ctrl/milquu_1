import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import SEOHead from '../../components/seo/SEOHead';
import { blogPosts } from '../../data/blog-posts';
import { buildBreadcrumbSchema } from '../../data/schemas';

const BlogIndex = () => {
  const schema = [
    buildBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Dairy Blog', url: '/blog' }
    ])
  ];

  return (
    <div className="bg-gradient-to-br from-[#FDFBF7] to-white min-h-screen pb-16 md:pb-0 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-40 -left-20 w-[400px] h-[400px] rounded-full blur-[100px] bg-milquu-blue/5 opacity-60"></div>
        <div className="absolute bottom-20 -right-20 w-[500px] h-[500px] rounded-full blur-[120px] bg-milquu-gold/10 opacity-50"></div>
      </div>
      <SEOHead 
        title="MilQuu Fresh Dairy Blog | Health Tips & Nutritional Info"
        description="Read the latest articles from MilQuu Fresh on the health benefits of A2 milk, ghee, pure dairy, and tips on maintaining a healthy lifestyle."
        keywords="dairy blog, health benefits of milk, A2 milk information, desi ghee benefits"
        canonical="https://milquufresh.in/blog"
        schema={schema}
      />

      <section className="bg-milquu-blue text-white pt-32 pb-20 px-4 text-center relative z-10">
        <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">The Dairy Knowledge Hub</h1>
        <p className="text-xl font-light opacity-90 max-w-2xl mx-auto">
          Insights, health benefits, and everything you need to know about pure farm-fresh dairy.
        </p>
      </section>

      <section className="py-16 px-4 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="bg-white/80 backdrop-blur-xl rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 border border-white/60 flex flex-col group">
              <div className="h-48 overflow-hidden bg-blue-50 relative">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  onError={(e) => { e.target.src = '/favicon.svg'; e.target.className="w-1/2 h-1/2 object-contain absolute top-1/4 left-1/4 opacity-20" }}
                />
              </div>
              <div className="p-8 flex flex-col flex-grow bg-gradient-to-b from-white/40 to-transparent">
                <div className="flex items-center text-xs text-gray-500 mb-3 gap-4">
                  <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span className="flex items-center gap-1"><Clock size={12}/> {post.readTime}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-milquu-blue transition-colors">{post.title}</h2>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">{post.excerpt}</p>
                <div className="flex items-center text-milquu-blue font-bold text-sm">
                  Read Article <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform"/>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BlogIndex;
