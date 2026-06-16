import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import SEOHead from '../../components/seo/SEOHead';
import StickyMobileCTA from '../../components/seo/StickyMobileCTA';
import { blogPosts } from '../../data/blog-posts';
import { buildArticleSchema, buildBreadcrumbSchema, buildFAQSchema } from '../../data/schemas';

const BlogPost = () => {
  const { slug } = useParams();
  const post = blogPosts.find(p => p.slug === slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const breadcrumbs = buildBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: post.title, url: `/blog/${slug}` }
  ]);

  const articleSchema = buildArticleSchema({
    title: post.title,
    description: post.excerpt,
    slug: post.slug,
    datePublished: post.date,
    image: `https://milquufresh.in${post.image}`
  });

  const schema = [articleSchema, breadcrumbs];
  if (post.faqs && post.faqs.length > 0) {
    schema.push(buildFAQSchema(post.faqs));
  }

  return (
    <div className="bg-gradient-to-br from-[#FDFBF7] to-white min-h-screen pb-16 md:pb-0 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0 fixed">
        <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] rounded-full blur-[100px] bg-milquu-blue/5 opacity-60"></div>
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] rounded-full blur-[120px] bg-milquu-gold/10 opacity-50"></div>
      </div>
      <SEOHead 
        title={`${post.title} | MilQuu Fresh Blog`}
        description={post.excerpt}
        keywords={post.keywords}
        canonical={`https://milquufresh.in/blog/${slug}`}
        ogImage={`https://milquufresh.in${post.image}`}
        ogType="article"
        schema={schema}
      />

      {/* Header */}
      <section className="bg-milquu-blue text-white pt-24 pb-32 px-4 relative">
        <div className="max-w-3xl mx-auto relative z-10 text-center">
          <Link to="/blog" className="inline-flex items-center text-blue-200 hover:text-white mb-6 transition-colors text-sm font-bold uppercase tracking-wide">
            <ArrowLeft size={16} className="mr-2" /> Back to all articles
          </Link>
          <h1 className="text-3xl md:text-5xl font-bold font-serif mb-6 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center justify-center gap-4 text-blue-100 text-sm">
            <span>By MilQuu Fresh Team</span>
            <span>•</span>
            <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock size={14} /> {post.readTime}</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 -mt-20 relative z-20 pb-16">
        <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-12 border border-white/60">
          <div className="prose prose-lg prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
          
          {post.faqs && post.faqs.length > 0 && (
            <div className="mt-12 pt-8 border-t border-white/40">
              <h2 className="text-2xl font-bold font-serif mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {post.faqs.map((faq, idx) => (
                  <div key={idx} className="bg-white/50 backdrop-blur-md p-5 rounded-2xl border border-white/60 shadow-[0_4px_15px_rgb(0,0,0,0.02)]">
                    <h4 className="font-bold text-gray-800 mb-2">{faq.question}</h4>
                    <p className="text-gray-600 text-sm m-0">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12 p-10 bg-gradient-to-br from-blue-50/80 to-white/50 backdrop-blur-md border border-white/60 rounded-3xl text-center shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden">
            {/* Subtle orb inside the CTA */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-milquu-blue/10 rounded-full blur-2xl pointer-events-none"></div>
            <h3 className="text-2xl font-bold font-serif text-gray-900 mb-4 relative z-10">Ready to switch to pure dairy?</h3>
            <p className="text-gray-600 mb-6">Experience the health benefits of 100% natural, farm-fresh milk delivered daily to your home in Navi Mumbai.</p>
            <Link to="/subscribe" className="bg-milquu-blue text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-milquu-blue/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all duration-300 inline-block relative z-10">
              Start Subscription Today
            </Link>
          </div>
        </div>
      </section>

      <StickyMobileCTA />
    </div>
  );
};

export default BlogPost;
