import React, { useState } from 'react';
import { Copy, Check, Wand2 } from 'lucide-react';

const SEOGenerator = () => {
  const [formData, setFormData] = useState({
    location: '',
    product: '',
    keyword: ''
  });
  const [generatedContent, setGeneratedContent] = useState(null);
  const [copied, setCopied] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  const generateSEO = (e) => {
    e.preventDefault();
    const { location, product, keyword } = formData;
    
    if (!location || !product || !keyword) return;

    const title = `${keyword} in ${location} | Farm Fresh ${product} | MilQuu`;
    const description = `Looking for ${keyword} in ${location}? MilQuu Fresh delivers pure, unadulterated ${product} directly to your doorstep every morning.`;
    
    const content = `
<h2>Premium ${keyword} in ${location}</h2>
<p>
  Finding reliable and pure <strong>${product} in ${location}</strong> has never been easier. At MilQuu Fresh, we are committed to delivering 100% natural and unadulterated dairy products directly to your doorstep. Our <strong>${keyword}</strong> ensures that your family starts their day with the finest quality dairy available in the region.
</p>
<h3>Why Choose Us for ${product}?</h3>
<p>
  Unlike commercial alternatives, our ${product} is sourced from ethical farms and delivered within hours of preparation. We maintain a strict cold chain to ensure maximum freshness. Residents of ${location} trust us for our zero-adulteration guarantee and hassle-free daily deliveries.
</p>
    `.trim();

    const faqs = [
      {
        question: `Do you deliver ${product} to all areas in ${location}?`,
        answer: `Yes, our delivery network covers all major residential areas and societies across ${location}.`
      },
      {
        question: `Is the ${product} fresh and pure?`,
        answer: `Absolutely. We guarantee 100% purity with zero adulterants or preservatives. Our products are tested daily before dispatch.`
      },
      {
        question: `How can I subscribe for daily ${keyword} in ${location}?`,
        answer: `You can easily set up a daily subscription through our website or app, and manage your deliveries seamlessly.`
      }
    ];

    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };

    setGeneratedContent({
      title,
      description,
      content,
      faqs,
      schema: JSON.stringify(schema, null, 2)
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Wand2 className="text-milquu-blue" /> AI SEO Content Generator
        </h1>
        <p className="text-gray-500 mt-2">Generate optimized Titles, Meta Descriptions, FAQs, and Schema for new landing pages instantly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Generation Parameters</h2>
            <form onSubmit={generateSEO} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Location</label>
                <input 
                  type="text" 
                  name="location"
                  placeholder="e.g., Seawoods" 
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                <input 
                  type="text" 
                  name="product"
                  placeholder="e.g., A2 Cow Milk" 
                  value={formData.product}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Keyword</label>
                <input 
                  type="text" 
                  name="keyword"
                  placeholder="e.g., Milk Delivery" 
                  value={formData.keyword}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-milquu-blue text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <Wand2 size={18} /> Generate Content
              </button>
            </form>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2 space-y-6">
          {!generatedContent ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center text-gray-500">
              <Wand2 size={48} className="mx-auto text-gray-300 mb-4" />
              <p>Fill out the form and hit generate to create SEO content.</p>
            </div>
          ) : (
            <>
              {/* Meta Tags */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
                <button onClick={() => handleCopy(`Title: ${generatedContent.title}\nDesc: ${generatedContent.description}`, 'meta')} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-milquu-blue hover:bg-blue-50 rounded-lg transition-colors">
                  {copied === 'meta' ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                </button>
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Meta Tags</h3>
                <div className="mb-4">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">SEO Title</span>
                  <p className="text-gray-900 font-medium mt-1">{generatedContent.title}</p>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Meta Description</span>
                  <p className="text-gray-900 font-medium mt-1">{generatedContent.description}</p>
                </div>
              </div>

              {/* HTML Content */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
                <button onClick={() => handleCopy(generatedContent.content, 'html')} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-milquu-blue hover:bg-blue-50 rounded-lg transition-colors">
                  {copied === 'html' ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                </button>
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Body Content (HTML)</h3>
                <pre className="bg-gray-800 text-gray-100 p-4 rounded-xl text-sm overflow-x-auto whitespace-pre-wrap font-mono">
                  {generatedContent.content}
                </pre>
              </div>

              {/* JSON-LD Schema */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
                <button onClick={() => handleCopy(generatedContent.schema, 'schema')} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-milquu-blue hover:bg-blue-50 rounded-lg transition-colors">
                  {copied === 'schema' ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                </button>
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">FAQ Schema (JSON-LD)</h3>
                <pre className="bg-gray-800 text-gray-100 p-4 rounded-xl text-sm overflow-x-auto whitespace-pre-wrap font-mono">
                  {generatedContent.schema}
                </pre>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SEOGenerator;
