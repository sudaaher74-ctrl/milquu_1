import React from 'react';
import { Star, MessageCircle, ExternalLink } from 'lucide-react';

const Reviews = () => {
  const reviews = [
    {
      name: "Rahul Deshmukh",
      location: "Panvel",
      date: "2 weeks ago",
      text: "The quality of A2 cow milk is exceptional. My kids love the taste, and it forms a really thick layer of malai. Delivery is always on time before 7 AM.",
      rating: 5
    },
    {
      name: "Sneha Patil",
      location: "Kharghar",
      date: "1 month ago",
      text: "Switched to MilQuu Fresh for their buffalo milk to make paneer at home. Best decision ever. The paneer turns out so soft and the milk is completely pure.",
      rating: 5
    },
    {
      name: "Vikram Singh",
      location: "Nerul",
      date: "3 weeks ago",
      text: "Very reliable daily subscription. The app makes it super easy to pause delivery when we go out of town. The Bilona Ghee is also highly recommended!",
      rating: 5
    },
    {
      name: "Pooja Sharma",
      location: "New Panvel",
      date: "2 months ago",
      text: "Finally found a brand I can trust for my toddler. The milk is raw and unadulterated. You can literally smell the freshness when you boil it.",
      rating: 4
    },
    {
      name: "Amit Joshi",
      location: "Belapur",
      date: "1 month ago",
      text: "Excellent service and premium quality. The delivery boy is very polite and always places the milk bag safely in the bag outside.",
      rating: 5
    },
    {
      name: "Neha Kadam",
      location: "Karanjade",
      date: "3 weeks ago",
      text: "Their fresh paneer is a lifesaver for quick dinners. It's so much softer than the packaged ones you get in supermarkets.",
      rating: 5
    }
  ];

  return (
    <section className="py-20 px-4 bg-gray-50 border-t border-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-gray-900 mb-4">Loved by Families Across Navi Mumbai</h2>
            <div className="flex items-center gap-3">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={24} fill="currentColor" />)}
              </div>
              <span className="font-bold text-xl text-gray-800">4.9 / 5</span>
              <span className="text-gray-500 text-sm">(128+ Reviews)</span>
            </div>
          </div>
          <a 
            href="https://g.page/r/milquufresh/review" // Placeholder Google link
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm"
          >
            <MessageCircle size={18} className="text-blue-500" />
            Review Us on Google <ExternalLink size={14} className="ml-1 text-gray-400" />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-milquu-blue rounded-full flex items-center justify-center font-bold text-lg">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{review.name}</h4>
                      <p className="text-xs text-gray-500">{review.location} • {review.date}</p>
                    </div>
                  </div>
                </div>
                <div className="flex text-yellow-400 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i >= review.rating ? "text-gray-300" : ""} />
                  ))}
                </div>
                <p className="text-gray-600 text-sm italic">"{review.text}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
