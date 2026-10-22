import { IndianLanguage } from '../types/index.ts';

export const INDIAN_LANGUAGES: IndianLanguage[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English (Default)',
    speechCode: 'en-IN',
    samplePrompt: 'What are the main eligibility criteria and key deadlines?'
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    speechCode: 'hi-IN',
    samplePrompt: 'इस दस्तावेज़ में मुख्य पात्रता शर्तें और अंतिम तिथियां क्या हैं?'
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    speechCode: 'ta-IN',
    samplePrompt: 'இந்த ஆவணத்தின் முக்கிய விதிமுறைகள் மற்றும் காலக்கெடு என்ன?'
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    speechCode: 'te-IN',
    samplePrompt: 'ఈ పత్రంలో ముఖ్యమైన అర్హత నిబంధనలు మరియు గడువులు ఏమిటి?'
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    speechCode: 'bn-IN',
    samplePrompt: 'এই নথির মূল শর্তাবলী এবং সময়সীমা কি কি?'
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    speechCode: 'mr-IN',
    samplePrompt: 'या दस्तऐवजातील मुख्य पात्रता निकष आणि अंतिम मुदत काय आहे?'
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    speechCode: 'gu-IN',
    samplePrompt: 'આ દસ્તાવેજમાં મુખ્ય પાત્રતા નિયમો અને છેલ્લી તારીખો કઈ છે?'
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    speechCode: 'kn-IN',
    samplePrompt: 'ಈ ದಾಖಲೆಯಲ್ಲಿನ ಪ್ರಮುಖ ಅರ್ಹತಾ ಷರತ್ತುಗಳು ಮತ್ತು ಗಡುವುಗಳು ಯಾವುವು?'
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    speechCode: 'ml-IN',
    samplePrompt: 'ഈ രേഖയിലെ പ്രധാന യോഗ്യതാ മാനദണ്ഡങ്ങളും അവസാന തീയതികളും എന്തൊക്കെയാണ്?'
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    speechCode: 'pa-IN',
    samplePrompt: 'ਇਸ ਦਸਤਾਵੇਜ਼ ਵਿੱਚ ਮੁੱਖ ਯੋਗਤਾ ਸ਼ਰਤਾਂ ਅਤੇ ਆਖਰੀ ਤਾਰੀਖਾਂ ਕੀ ਹਨ?'
  },
  {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    speechCode: 'or-IN',
    samplePrompt: 'ଏହି ଦଲିଲରେ ମୁଖ୍ୟ ଯୋଗ୍ୟତା ସର୍ତ୍ତ ଏବଂ ଶେଷ ତାରିଖ କ\'ଣ ଅଛି?'
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    speechCode: 'ur-IN',
    samplePrompt: 'اس دستاویز میں بنیادی اہلیت کی شرائط اور آخری تاریخیں کیا ہیں؟'
  },
  {
    code: 'as',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    speechCode: 'as-IN',
    samplePrompt: 'এই নথিপত্ৰৰ মুখ্য যোগ্যতা চৰ্ত আৰু অন্তিম সময়সীমা কি?'
  }
];

export const INSUFFICIENT_EVIDENCE_MESSAGES: Record<string, string> = {
  en: 'I could not find sufficient factual information to answer this question in the uploaded document. DocuMind strictly refuses to invent answers or fabricate citations.',
  hi: 'अपलोड किए गए दस्तावेज़ में इस प्रश्न का उत्तर देने के लिए पर्याप्त प्रामाणिक जानकारी नहीं मिली। DocuMind अनुमानित या झूठे उत्तर देने से सख्ती से इनकार करता है।',
  ta: 'பதிவேற்றப்பட்ட ஆவணத்தில் இந்தக் கேள்விக்கு பதிலளிக்க போதுமான உண்மைத் தகவல் கிடைக்கவில்லை. ஆதாரமற்ற பதில்களை உருவாக்குவதை DocuMind கண்டிப்பாக தவிர்க்கிறது.',
  te: 'అప్‌లోడ్ చేసిన పత్రంలో ఈ ప్రశ్నకు సమాధానం ఇవ్వడానికి తగినంత ప్రామాణిక సమాచారం లభించలేదు. ఊహాజనిత సమాధానాలు సృష్టించడాన్ని DocuMind ఖచ్చితంగా నివారిస్తుంది.',
  bn: 'আপলোড করা নথিতে এই প্রশ্নের উত্তর দেওয়ার জন্য পর্যাপ্ত প্রামাণ্য তথ্য পাওয়া যায়নি। DocuMind কোনো কাল্পনিক বা ভিত্তিহীন তথ্য উদ্ভাবন করতে স্পষ্টভাবে অস্বীকার করে।',
  mr: 'अपलोड केलेल्या दस्तऐवजात या प्रश्नाचे उत्तर देण्यासाठी पुरेसा पुरावा किंवा माहिती आढळली नाही. DocuMind खोटी किंवा काल्पनिक उत्तरे तयार करत नाही.',
  gu: 'અપલોડ કરેલા દસ્તાવેજમાં આ પ્રશ્નનો ઉત્તર આપવા માટે પૂરતી અધિકૃત માહિતી મળી નથી. DocuMind કલ્પિત કે બનાવટી જવાબો આપવાનો સખત ઇનકાર કરે છે.',
  kn: 'ಅಪ್‌ಲೋಡ್ ಮಾಡಿದ ದಾಖಲೆಯಲ್ಲಿ ಈ ಪ್ರಶ್ನೆಗೆ ಉತ್ತರಿಸಲು ಸಾಕಷ್ಟು ಅಧಿಕೃತ ಮಾಹಿತಿ ಕಂಡುಬಂದಿಲ್ಲ. DocuMind ಊಹಾತ್ಮಕ ಉತ್ತರಗಳನ್ನು ಸೃಷ್ಟಿಸುವುದನ್ನು ಕಟ್ಟುನಿಟ್ಟಾಗಿ ನಿರಾಕರಿಸುತ್ತದೆ.',
  ml: 'അപ്‌ലോഡ് ചെയ്‌ത രേഖയിൽ ഈ ചോദ്യത്തിന് ഉത്തരം നൽകാൻ ആവശ്യമായ ആധികാരിക വിവരങ്ങൾ കണ്ടെത്താനായില്ല. തെറ്റായതോ ഊഹാപോഹപരമായതോ ആയ ഉത്തരങ്ങൾ നൽകുന്നത് DocuMind കർശനമായി ഒഴിവാക്കുന്നു.',
  pa: 'ਅੱਪਲੋਡ ਕੀਤੇ ਦਸਤਾਵੇਜ਼ ਵਿੱਚ ਇਸ ਸਵਾਲ ਦਾ ਜਵਾਬ ਦੇਣ ਲਈ ਲੋੜੀਂਦੀ ਪ੍ਰਮਾਣਿਕ ਜਾਣਕਾਰੀ ਨਹੀਂ ਮਿਲੀ। DocuMind ਅਨੁਮਾਨਿਤ ਜਾਂ ਗਲਤ ਜਵਾਬ ਬਣਾਉਣ ਤੋਂ ਸਖ਼ਤੀ ਨਾਲ ਇਨਕਾਰ ਕਰਦਾ ਹੈ।',
  or: 'ଅପଲୋଡ୍ ହୋଇଥିବା ଦସ୍ତାବିଜରେ ଏହି ପ୍ରଶ୍ନର ଉତ୍ତର ଦେବା ପାଇଁ ଯଥେଷ୍ଟ ପ୍ରମାଣିକ ତଥ୍ୟ ମିଳିଲା ନାହିଁ। DocuMind କୌଣସି ଅବାସ୍ତବ ତଥ୍ୟ ଦେବାକୁ କଡ଼ାକଡ଼ି ମନା କରେ।',
  ur: 'اپ لوڈ کردہ دستاویز میں اس سوال کا جواب دینے کے لیے کافی مستند معلومات دستیاب نہیں ہیں۔ DocuMind من گھڑت یا فرضی جوابات دینے سے سختی سے انکار کرتا ہے۔',
  as: 'আপলোড কৰা নথিপত্ৰত এই প্ৰশ্নটোৰ উত্তৰ দিবলৈ পৰ্যাপ্ত প্ৰামাণিক তথ্য পোৱা নগ\'ল। DocuMind য়ে কোনো কাল্পনিক বা ভিত্তিহীন উত্তৰ উদ্ভাৱন নকৰে।'
};
