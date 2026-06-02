import { buildProductSchema, buildFAQSchema } from './schemas';

export const productSEOData = {
  'farm-fresh-cow-milk': {
    name: 'A2 Farm Fresh Cow Milk',
    slug: 'farm-fresh-cow-milk',
    title: 'A2 Farm Fresh Cow Milk Delivery | 100% Pure & Natural | MilQuu',
    description: 'Buy pure A2 cow milk online in Navi Mumbai. Sourced from free-grazing Gir cows. Delivered farm-fresh to your home within 24 hours. No preservatives.',
    keywords: 'A2 cow milk, fresh cow milk delivery, pure cow milk navi mumbai, buy A2 milk online',
    price: 85,
    image: '/img/A2milk.webp',
    nutrition: [
      { label: 'Energy', value: '62 kcal' },
      { label: 'Protein', value: '3.2 g' },
      { label: 'Carbohydrates', value: '4.8 g' },
      { label: 'Calcium', value: '120 mg' },
      { label: 'Fat', value: '4.0 g' }
    ],
    details: `Our flagship A2 Cow Milk is sourced from indigenous Indian cow breeds like the Gir cow. Known for its distinct golden hue and rich, creamy taste, this milk contains only the A2 beta-casein protein, making it extremely easy to digest. It is naturally rich in calcium, phosphorus, and essential vitamins. Our cows are free-grazing and fed a natural diet, ensuring that the milk you drink is completely free of synthetic hormones and antibiotics. Delivered chilled at 4°C to maintain ultimate freshness.`,
    faqs: [
      {
        question: 'What is A2 milk and how is it different?',
        answer: 'A2 milk contains only the A2 type of beta-casein protein rather than the A1 protein found in most commercial milk. It is generally easier to digest and closely resembles human mother\'s milk.'
      },
      {
        question: 'Do you add water or standardise the fat content?',
        answer: 'Absolutely not. We deliver whole, unadulterated milk exactly as it comes from the cow. We do not standardise or remove the cream.'
      }
    ],
    get schema() {
      return [
        buildProductSchema({
          name: this.name,
          description: this.description,
          image: this.image,
          price: this.price,
          sku: 'MQ-COW-1L'
        }),
        buildFAQSchema(this.faqs)
      ];
    }
  },
  'pure-buffalo-milk': {
    name: 'Premium Buffalo Milk',
    slug: 'pure-buffalo-milk',
    title: 'Premium Buffalo Milk Delivery | Thick & Creamy | MilQuu',
    description: 'Order thick, creamy buffalo milk online. Perfect for tea, coffee, curd, and homemade sweets. Delivered fresh every morning across Navi Mumbai.',
    keywords: 'buffalo milk delivery, thick milk for tea, pure buffalo milk navi mumbai',
    price: 90,
    image: '/img/buffalomilk.webp',
    nutrition: [
      { label: 'Energy', value: '97 kcal' },
      { label: 'Protein', value: '3.7 g' },
      { label: 'Carbohydrates', value: '5.2 g' },
      { label: 'Calcium', value: '169 mg' },
      { label: 'Fat', value: '6.5+ g' }
    ],
    details: `Experience the richness of our Premium Buffalo Milk. Sourced from well-cared-for Murrah buffaloes, this milk boasts a naturally high fat content (6.5% and above), making it luxuriously thick and creamy. It is the perfect choice for making rich, kadak chai, setting thick dahi (curd), or preparing traditional Indian sweets at home. It undergoes the same rigorous quality testing and cold-chain delivery as our cow milk, guaranteeing absolute purity.`,
    faqs: [
      {
        question: 'Is buffalo milk good for making paneer at home?',
        answer: 'Yes! Because of its high fat and protein content, buffalo milk yields soft, rich, and high-quantity paneer compared to cow milk.'
      },
      {
        question: 'Is this milk pasteurized?',
        answer: 'We deliver raw, chilled milk to preserve its natural enzymes and nutrients. We strongly recommend boiling the milk before consumption.'
      }
    ],
    get schema() {
      return [
        buildProductSchema({
          name: this.name,
          description: this.description,
          image: this.image,
          price: this.price,
          sku: 'MQ-BUFF-1L'
        }),
        buildFAQSchema(this.faqs)
      ];
    }
  },
  'desi-cow-ghee': {
    name: 'Bilona A2 Cow Ghee',
    slug: 'desi-cow-ghee',
    title: 'Pure Bilona A2 Cow Ghee | Traditional Churned | MilQuu',
    description: 'Buy authentic Bilona A2 cow ghee. Made from curd using the traditional Vedic churning method. Rich aroma, granular texture, and immense health benefits.',
    keywords: 'bilona ghee, A2 cow ghee online, traditional churned ghee, pure desi ghee',
    price: 1800,
    image: '/img/A2ghee.webp',
    nutrition: [
      { label: 'Energy', value: '897 kcal' },
      { label: 'Protein', value: '0 g' },
      { label: 'Carbohydrates', value: '0 g' },
      { label: 'Vitamin A', value: '850 mcg' },
      { label: 'Fat', value: '99.5 g' }
    ],
    details: `Our Bilona A2 Cow Ghee is crafted using the ancient Vedic method. We do not extract ghee directly from cream. Instead, pure A2 cow milk is set into curd, which is then hand-churned (bilona) to separate the makkhan (butter). This butter is slowly heated over a wood fire to produce ghee with a distinct golden color, granular texture (danedar), and a rich, nutty aroma. It is packed with healthy fats, butyric acid, and vitamins A, D, E, and K.`,
    faqs: [
      {
        question: 'Why is Bilona ghee more expensive than regular ghee?',
        answer: 'Regular ghee is made mechanically from leftover cream. Bilona ghee takes about 25-30 liters of pure A2 milk to make just 1 liter of ghee, and the traditional churning process is highly labor-intensive.'
      },
      {
        question: 'Is this ghee lactose-free?',
        answer: 'The traditional culturing (curd making) and heating process removes almost all milk solids and moisture, making our ghee generally safe for those with lactose intolerance.'
      }
    ],
    get schema() {
      return [
        buildProductSchema({
          name: this.name,
          description: this.description,
          image: this.image,
          price: this.price,
          sku: 'MQ-GHEE-1L'
        }),
        buildFAQSchema(this.faqs)
      ];
    }
  },
  'fresh-paneer': {
    name: 'Fresh Malai Paneer',
    slug: 'fresh-paneer',
    title: 'Fresh Malai Paneer Delivery | Soft & Spongy | MilQuu',
    description: 'Order incredibly soft and fresh malai paneer. Made daily from pure buffalo milk without any synthetic coagulants. Delivered fresh to your home.',
    keywords: 'fresh paneer delivery, malai paneer online, soft paneer navi mumbai',
    price: 120,
    image: '/img/panner.webp',
    nutrition: [
      { label: 'Energy', value: '296 kcal' },
      { label: 'Protein', value: '18 g' },
      { label: 'Carbohydrates', value: '3 g' },
      { label: 'Calcium', value: '200 mg' },
      { label: 'Fat', value: '24 g' }
    ],
    details: `Indulge in the melt-in-your-mouth goodness of our Fresh Malai Paneer. Made daily in small batches using our premium, high-fat buffalo milk, this paneer is incredibly soft, spongy, and rich in taste. We use only natural lemon juice to curdle the milk, strictly avoiding synthetic coagulants or firming agents. It is packed fresh and delivered to you within hours of preparation, elevating your homemade curries and snacks to a whole new level.`,
    faqs: [
      {
        question: 'Does the paneer contain any preservatives?',
        answer: 'No. Our paneer is completely chemical and preservative-free. Because of this, it has a short shelf life and must be consumed within 2 days when refrigerated.'
      },
      {
        question: 'Can I add paneer to my daily milk subscription?',
        answer: 'Yes! You can easily add a paneer delivery to any specific day of the week through your MilQuu account dashboard.'
      }
    ],
    get schema() {
      return [
        buildProductSchema({
          name: this.name,
          description: this.description,
          image: this.image,
          price: this.price,
          sku: 'MQ-PAN-250G'
        }),
        buildFAQSchema(this.faqs)
      ];
    }
  },
  'fresh-dahi': {
    name: 'Fresh Farm Dahi',
    slug: 'fresh-dahi',
    title: 'Fresh Thick Dahi | Probiotic Curd | MilQuu',
    description: 'Thick, naturally set farm-fresh curd with a smooth velvety texture. Contains natural probiotics.',
    keywords: 'fresh dahi, buy curd online, probiotic curd',
    price: 60,
    image: '/img/Dahi.webp',
    nutrition: [
      { label: 'Energy', value: '98 kcal' },
      { label: 'Protein', value: '3.4 g' }
    ],
    details: 'Our Fresh Dahi is set naturally without any synthetic coagulants. It boasts a thick, creamy texture that reminds you of traditional homemade curd.',
    faqs: [],
    get schema() {
      return [
        buildProductSchema({
          name: this.name,
          description: this.description,
          image: this.image,
          price: this.price,
          sku: 'MQ-DAHI-500G'
        }),
        buildFAQSchema(this.faqs)
      ];
    }
  },
  'sweet-lassi': {
    name: 'Sweet Lassi',
    slug: 'sweet-lassi',
    title: 'Traditional Sweet Lassi | Refreshing Drink | MilQuu',
    description: 'Traditional churned yogurt drink, refreshing and lightly sweetened.',
    keywords: 'sweet lassi, traditional lassi, buy lassi online',
    price: 40,
    image: '/img/lassi.webp',
    nutrition: [
      { label: 'Energy', value: '110 kcal' },
      { label: 'Protein', value: '3.0 g' }
    ],
    details: 'A beautifully balanced sweet lassi crafted from our pure farm dahi. Churned to perfection to give you that authentic taste of Punjab.',
    faqs: [],
    get schema() {
      return [
        buildProductSchema({
          name: this.name,
          description: this.description,
          image: this.image,
          price: this.price,
          sku: 'MQ-LASSI-250ML'
        }),
        buildFAQSchema(this.faqs)
      ];
    }
  }
};
