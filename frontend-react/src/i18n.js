import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// In a real app, you would load these from individual JSON files
const resources = {
  en: {
    translation: {
      "nav": {
        "products": "Products",
        "subscriptions": "Subscriptions",
        "ourStory": "Our Story",
        "contact": "Contact",
        "login": "Log In"
      },
      "hero": {
        "title": "Fresh Farm Milk",
        "subtitle": "Delivered to your doorstep every morning."
      }
    }
  },
  hi: {
    translation: {
      "nav": {
        "products": "उत्पाद",
        "subscriptions": "सदस्यता",
        "ourStory": "हमारी कहानी",
        "contact": "संपर्क करें",
        "login": "लॉग इन"
      },
      "hero": {
        "title": "ताजा खेत का दूध",
        "subtitle": "हर सुबह आपके दरवाजे पर पहुंचाया गया।"
      }
    }
  },
  mr: {
    translation: {
      "nav": {
        "products": "उत्पादने",
        "subscriptions": "सदस्यता",
        "ourStory": "आमची कहाणी",
        "contact": "संपर्क",
        "login": "लॉगिन करा"
      },
      "hero": {
        "title": "ताजे शेत दूध",
        "subtitle": "दररोज सकाळी आपल्या दारावर पोहोचविले जाते."
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
