// Multi-language support for Hindi, Marathi, Tamil, Telugu, Kannada, Punjabi
type SupportedLanguage = "en" | "hi" | "mr" | "ta" | "te" | "kn" | "pa"

interface TranslationKey {
  [key: string]: string
}

const translations: Record<SupportedLanguage, TranslationKey> = {
  en: {
    // Dashboard
    "dashboard.title": "Agricultural Intelligence Platform",
    "dashboard.subtitle": "Real-time farm optimization with crop health monitoring",
    "dashboard.selectCrop": "Select Crop",
    "dashboard.selectRegion": "Select Region",

    // Alerts
    "alerts.pestWarning": "Pest Warning",
    "alerts.rainAlert": "Rain Alert",
    "alerts.priceAlert": "Price Alert",
    "alerts.frostWarning": "Frost Warning",
    "alerts.irrigationNeeded": "Irrigation Needed",
    "alerts.harvestReady": "Harvest Ready",

    // Features
    "feature.cropHealth": "Crop Health",
    "feature.weatherForecast": "30-Day Weather Forecast",
    "feature.priceforecast": "Commodity Price Forecast",
    "feature.pestRisk": "Pest Risk Assessment",
    "feature.soilMoisture": "Soil Moisture Monitor",
    "feature.yieldForecast": "Yield Forecast",
    "feature.fertilizer": "Fertilizer Recommendation",
    "feature.marketplace": "Equipment Marketplace",
    "feature.directBuyer": "Direct Buyer Connection",
    "feature.soilTesting": "Soil Testing Lab",
    "feature.cropInsurance": "Crop Insurance",

    // Buttons
    "button.viewDetails": "View Details",
    "button.getHelp": "Get Help",
    "button.shareAlert": "Share Alert",
    "button.syncNow": "Sync Now",
    "button.offline": "Offline Mode",
  },

  hi: {
    "dashboard.title": "कृषि बुद्धिमत्ता मंच",
    "dashboard.subtitle": "फसल स्वास्थ्य निगरानी के साथ वास्तविक समय फार्म अनुकूलन",
    "dashboard.selectCrop": "फसल चुनें",
    "dashboard.selectRegion": "क्षेत्र चुनें",

    "alerts.pestWarning": "कीट चेतावनी",
    "alerts.rainAlert": "बारिश की सूचना",
    "alerts.priceAlert": "मूल्य सूचना",
    "alerts.frostWarning": "पाला चेतावनी",
    "alerts.irrigationNeeded": "सिंचाई आवश्यक",
    "alerts.harvestReady": "कटाई के लिए तैयार",

    "feature.cropHealth": "फसल स्वास्थ्य",
    "feature.weatherForecast": "30 दिन का मौसम पूर्वानुमान",
    "feature.priceforecast": "कमोडिटी मूल्य पूर्वानुमान",
    "feature.pestRisk": "कीट जोखिम आकलन",
    "feature.soilMoisture": "मिट्टी नमी निगरानी",
    "feature.yieldForecast": "उपज पूर्वानुमान",
    "feature.fertilizer": "उर्वरक अनुशंसा",
    "feature.marketplace": "उपकरण बाजार",
    "feature.directBuyer": "सीधे खरीदार कनेक्शन",
    "feature.soilTesting": "मिट्टी परीक्षण लैब",
    "feature.cropInsurance": "फसल बीमा",

    "button.viewDetails": "विवरण देखें",
    "button.getHelp": "मदद प्राप्त करें",
    "button.shareAlert": "सूचना साझा करें",
    "button.syncNow": "अभी सिंक करें",
    "button.offline": "ऑफलाइन मोड",
  },

  mr: {
    "dashboard.title": "कृषि बुद्धिमत्ता प्लॅटफॉर्म",
    "dashboard.subtitle": "पिक स्वास्थ्य निरीक्षण सह वास्तविक वेळ शेत अनुकूलन",
    "dashboard.selectCrop": "पिक निवडा",
    "dashboard.selectRegion": "क्षेत्र निवडा",

    "alerts.pestWarning": "कीटक सावधानी",
    "alerts.rainAlert": "पावसाचा इशारा",
    "alerts.priceAlert": "किंमत सूचना",
    "alerts.frostWarning": "अल्पवर्षीय चेतावणी",
    "alerts.irrigationNeeded": "सिंचन आवश्यक",
    "alerts.harvestReady": "कापणीसाठी तयार",

    "feature.cropHealth": "पिकाचे आरोग्य",
    "feature.weatherForecast": "30 दिवसांचा हवामान अंदाज",
    "feature.priceforecast": "वस्तूंचा किंमत अंदाज",
    "feature.pestRisk": "कीटक जोखीम मूल्यांकन",
    "feature.soilMoisture": "मातीतील आर्द्रता निरीक्षण",
    "feature.yieldForecast": "उत्पादन अंदाज",
    "feature.fertilizer": "खते सुपारिश",
    "feature.marketplace": "यंत्रोपकरण बाजार",
    "feature.directBuyer": "थेट खरेदीदार संयोग",
    "feature.soilTesting": "मातीची चाचणी लॅब",
    "feature.cropInsurance": "पिक विमा",

    "button.viewDetails": "तपशील पहा",
    "button.getHelp": "मदत मिळवा",
    "button.shareAlert": "सूचना सामायिक करा",
    "button.syncNow": "आता सिंक करा",
    "button.offline": "ऑफलाइन मोड",
  },

  ta: {
    "dashboard.title": "விவசாய நுண்ணறிவு தளம்",
    "dashboard.subtitle": "பயிர் ஆரோக்கிய கண்காணிப்புடன் நிகழ் நேர பண்ணை மேம்பாடு",
    "dashboard.selectCrop": "பயிரைத் தேர்ந்தெடுக்கவும்",
    "dashboard.selectRegion": "பகுதியைத் தேர்ந்தெடுக்கவும்",

    "alerts.pestWarning": "பூச்சி எச்சரிக்கை",
    "alerts.rainAlert": "மழை எச்சரிக்கை",
    "alerts.priceAlert": "விலை எச்சரிக்கை",
    "alerts.frostWarning": "உறைபனி எச்சரிக்கை",
    "alerts.irrigationNeeded": "நீர்ப்பாசனம் தேவை",
    "alerts.harvestReady": "அறுவடைக்குத் தயாரிக்கப்பட்டுள்ளது",

    "feature.cropHealth": "பயிர் ஆரோக்கியம்",
    "feature.weatherForecast": "30 நாள் வானிலை முன்னறிவிப்பு",
    "feature.priceforecast": "பணப் பொருட்களின் விலை முன்னறிவிப்பு",
    "feature.pestRisk": "பூச்சி ஆபத்து மதிப்பீடு",
    "feature.soilMoisture": "மண் ஈரப்பதம் கண்காணிப்பு",
    "feature.yieldForecast": "விளைச்சல் முன்னறிவிப்பு",
    "feature.fertilizer": "உரம் பரிந்துரை",
    "feature.marketplace": "உபகரண சந்தை",
    "feature.directBuyer": "நேரடி கொள்ளை இணைப்பு",
    "feature.soilTesting": "மண் சோதனை ল்যாப்",
    "feature.cropInsurance": "பயிர் காப்பீடு",

    "button.viewDetails": "விவரங்களைப் பார்க்கவும்",
    "button.getHelp": "உதவி பெறுக",
    "button.shareAlert": "எச்சரிக்கை பகிரவும்",
    "button.syncNow": "இப்போது ஒத்திசைக்கவும்",
    "button.offline": "ஆஃப்லைன் முறை",
  },

  te: {
    "dashboard.title": "వ్యవసాయ గుర్తింపు ప్లాట్‌ఫారమ్",
    "dashboard.selectCrop": "పంట ఎంచుకోండి",
    "dashboard.selectRegion": "ప్రాంతం ఎంచుకోండి",
    "alerts.pestWarning": "అంటువ్యాధి హెచ్చరిక",
    "alerts.rainAlert": "వర్ష హెచ్చరిక",
    "alerts.priceAlert": "ధర హెచ్చరిక",
    "button.viewDetails": "వివరాలను చూడండి",
    "button.offline": "ఆఫ్‌లైన్ మోడ్",
  },

  kn: {
    "dashboard.title": "ಕೃಷಿ ಬುದ್ಧಿಮತ್ತೆ ವೇದಿ",
    "dashboard.selectCrop": "ಬೆಳೆ ಆಯ್ಕೆ ಮಾಡಿ",
    "dashboard.selectRegion": "ಪ್ರದೇಶ ಆಯ್ಕೆ ಮಾಡಿ",
    "alerts.pestWarning": "ಕೀಟ ಎಚ್ಚರಿಕೆ",
    "alerts.rainAlert": "ಮಳೆ ಎಚ್ಚರಿಕೆ",
    "button.offline": "ಆಫ್‌ಲೈನ್ ಮೋಡ್",
  },

  pa: {
    "dashboard.title": "ਕਿਸਾਨ ਬੁਧੀ ਪਲੇਟਫਾਰਮ",
    "dashboard.selectCrop": "ਫਸਲ ਚੁਣੋ",
    "dashboard.selectRegion": "ਖੇਤਰ ਚੁਣੋ",
    "alerts.pestWarning": "ਕੀੜਿਆਂ ਦੀ ਚੇਤਾਵਨੀ",
    "alerts.rainAlert": "ਮੀਂਹ ਦੀ ਚੇਤਾਵਨੀ",
    "button.offline": "ਆਫਲਾਈਨ ਮੋਡ",
  },
}

import { safeLocalStorage } from './storage';

export class LanguageManager {
  private currentLanguage: SupportedLanguage = "en"

  constructor() {
    // Get language from browser or localStorage (browser-side only)
    if (typeof window !== 'undefined') {
      const saved = safeLocalStorage.getItem("app_language");
      if (saved && Object.keys(translations).includes(saved)) {
        this.currentLanguage = saved as SupportedLanguage;
      } else {
        const browserLang = navigator.language.split("-")[0];
        if (Object.keys(translations).includes(browserLang)) {
          this.currentLanguage = browserLang as SupportedLanguage;
        }
      }
    }
  }

  setLanguage(lang: SupportedLanguage): void {
    if (Object.keys(translations).includes(lang)) {
      this.currentLanguage = lang;
      safeLocalStorage.setItem("app_language", lang);
      if (typeof window !== 'undefined') {
        window.location.reload(); // Reload to apply language
      }
    }
  }

  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguage
  }

  getAvailableLanguages(): Array<{ code: SupportedLanguage; name: string }> {
    return [
      { code: "en", name: "English" },
      { code: "hi", name: "हिंदी" },
      { code: "mr", name: "मराठी" },
      { code: "ta", name: "தமிழ்" },
      { code: "te", name: "తెలుగు" },
      { code: "kn", name: "ಕನ್ನಡ" },
      { code: "pa", name: "ਪੰਜਾਬੀ" },
    ]
  }

  t(key: string, defaults: string = key): string {
    return translations[this.currentLanguage]?.[key] ?? translations["en"]?.[key] ?? defaults
  }
}

export const languageManager = new LanguageManager()
