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
    <div className="bg-white min-h-screen pb-16 md:pb-0">
      <SEOHead 
        title="MilQuu Fresh Dairy Blog | Health Tips & Nutritional Info"
        description="Read the latest articles from MilQuu Fresh on the health benefits of A2 milk, ghee, pure dairy, and tips on maintaining a healthy lifestyle."
        keywords="dairy blog, health benefits of milk, A2 milk information, desi ghee benefits"
        canonical="https://milquufresh.in/blog"
        schema={schema}
      />

      <section className="bg-milquu-blue text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4">The Dairy Knowledge Hub</h1>
        <p className="text-xl font-light opacity-90 max-w-2xl mx-auto">
          Insights, health benefits, and everything you need to know about pure farm-fresh dairy.
        </p>
      </section>

      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 flex flex-col group">
              <div className="h-48 overflow-hidden bg-blue-50 relative">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  onError={(e) => { e.target.src = '/favicon.svg'; e.target.className="w-1/2 h-1/2 object-contain absolute top-1/4 left-1/4 opacity-20" }}
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
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
