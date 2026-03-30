// public/lang.js
const translations = {
  en: {
    title: "Citizen Portal",
    reportIssue: "Report an Issue",
    description: "Describe the issue...",
    phone: "Phone Number",
    submit: "Submit",
    officialsLogin: "Officials Login",
    username: "Username",
    password: "Password",
    login: "Login",
    onlyOfficials: "Only authorized officials can access this portal.",
    reports: "Reports",
    status: "Status",
    logout: "Logout",
  },
  hi: {
    title: "नागरिक पोर्टल",
    reportIssue: "समस्या दर्ज करें",
    description: "समस्या का विवरण लिखें...",
    phone: "फ़ोन नंबर",
    submit: "जमा करें",
    officialsLogin: "अधिकारी लॉगिन",
    username: "उपयोगकर्ता नाम",
    password: "पासवर्ड",
    login: "लॉगिन",
    onlyOfficials: "केवल अधिकृत अधिकारी इस पोर्टल का उपयोग कर सकते हैं।",
    reports: "रिपोर्ट्स",
    status: "स्थिति",
    logout: "लॉगआउट",
  },
  te: {
    title: "పౌర పోర్టల్",
    reportIssue: "సమస్యను నివేదించండి",
    description: "సమస్య వివరాన్ని వ్రాయండి...",
    phone: "ఫోన్ నంబర్",
    submit: "సమర్పించండి",
    officialsLogin: "అధికారుల లాగిన్",
    username: "వాడుకరి పేరు",
    password: "పాస్‌వర్డ్",
    login: "లాగిన్",
    onlyOfficials: "ఈ పోర్టల్‌ను కేవలం అధికారికులు మాత్రమే యాక్సెస్ చేయగలరు.",
    reports: "నివేదికలు",
    status: "స్థితి",
    logout: "లాగ్ అవుట్",
  },
  ta: {
    title: "குடிமக்கள் தளம்",
    reportIssue: "சிக்கலை அறிவிக்கவும்",
    description: "சிக்கலை விவரிக்கவும்...",
    phone: "தொலைபேசி எண்",
    submit: "சமர்ப்பிக்கவும்",
    officialsLogin: "அதிகாரிகள் உள்நுழைவு",
    username: "பயனர் பெயர்",
    password: "கடவுச்சொல்",
    login: "உள்நுழைவு",
    onlyOfficials: "அங்கீகரிக்கப்பட்ட அதிகாரிகள் மட்டுமே இந்த தளத்தை அணுகலாம்.",
    reports: "அறிக்கைகள்",
    status: "நிலை",
    logout: "வெளியேறு",
  },
};

function setLanguage(lang) {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang] && translations[lang][key]) {
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.placeholder = translations[lang][key];
      } else {
        el.innerText = translations[lang][key];
      }
    }
  });
  localStorage.setItem("lang", lang);
}

window.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("lang") || "en";
  const langSwitcher = document.getElementById("langSwitcher");
  if (langSwitcher) {
    langSwitcher.value = savedLang;
    langSwitcher.addEventListener("change", (e) =>
      setLanguage(e.target.value)
    );
  }
  setLanguage(savedLang);
});
