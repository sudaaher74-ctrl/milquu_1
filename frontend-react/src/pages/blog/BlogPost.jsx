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
    <div className="bg-white min-h-screen pb-16 md:pb-0">
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
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-6 md:p-12 border border-gray-100">
          <div className="prose prose-lg prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
          
          {post.faqs && post.faqs.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-100">
              <h2 className="text-2xl font-bold font-serif mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {post.faqs.map((faq, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-bold text-gray-800 mb-2">{faq.question}</h4>
                    <p className="text-gray-600 text-sm m-0">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12 p-8 bg-blue-50 rounded-2xl text-center">
            <h3 className="text-2xl font-bold font-serif text-gray-900 mb-4">Ready to switch to pure dairy?</h3>
            <p className="text-gray-600 mb-6">Experience the health benefits of 100% natural, farm-fresh milk delivered daily to your home in Navi Mumbai.</p>
            <Link to="/subscribe" className="bg-milquu-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors inline-block">
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
