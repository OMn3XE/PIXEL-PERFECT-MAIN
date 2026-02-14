import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Leaf, Loader2, Globe } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { LeafAnalysis } from "./LeafAnalysis";

type Lang = "EN" | "HI" | "OD";
type Msg = { role: "user" | "assistant"; content: string; options?: string[] };

type Step =
  | "lang"
  | "greeting"
  | "camera"
  | "camera_yes"
  | "npk"
  | "npk_yes_n"
  | "npk_yes_p"
  | "npk_yes_k"
  | "soil"
  | "soil_yes_n"
  | "soil_yes_p"
  | "soil_yes_k"
  | "soil_yes_ph"
  | "crop"
  | "done";

const T: Record<string, Record<Lang, string>> = {
  greeting: {
    EN: "Hello Farmer! 🌱 I am your Smart Farming Assistant. I will ask a few simple questions to help you better.",
    HI: "नमस्ते किसान भाई! 🌱 मैं आपका स्मार्ट खेती सहायक हूँ। मैं आपकी मदद के लिए कुछ आसान सवाल पूछूँगा।",
    OD: "ନମସ୍କାର କୃଷକ! 🌱 ମୁଁ ଆପଣଙ୍କ ସ୍ମାର୍ଟ ଚାଷ ସହାୟକ। ମୁଁ ଆପଣଙ୍କୁ ସାହାଯ୍ୟ କରିବା ପାଇଁ କିଛି ସହଜ ପ୍ରଶ୍ନ ପଚାରିବି।",
  },
  camera: {
    EN: "Would you like to open the camera to scan your crop? 📷",
    HI: "क्या आप अपनी फसल को स्कैन करने के लिए कैमरा खोलना चाहेंगे? 📷",
    OD: "ଆପଣ ଆପଣଙ୍କ ଫସଲ ସ୍କାନ କରିବାକୁ କ୍ୟାମେରା ଖୋଲିବାକୁ ଚାହୁଁଛନ୍ତି କି? 📷",
  },
  camera_yes: {
    EN: "Great! 📸 Please point your camera clearly at the affected leaf or crop. Make sure there is good light!",
    HI: "बहुत अच्छा! 📸 कृपया अपने कैमरे को प्रभावित पत्ती या फसल पर साफ़ रखें। अच्छी रोशनी में रखें!",
    OD: "ବହୁତ ଭଲ! 📸 ଦୟାକରି ଆପଣଙ୍କ କ୍ୟାମେରାକୁ ପ୍ରଭାବିତ ପତ୍ର ବା ଫସଲ ଉପରେ ସ୍ପଷ୍ଟ ଭାବରେ ରଖନ୍ତୁ। ଭଲ ଆଲୋକ ଥିବା ନିଶ୍ଚିତ କରନ୍ତୁ!",
  },
  camera_no: {
    EN: "No problem! Let's continue. 😊",
    HI: "कोई बात नहीं! आगे बढ़ते हैं। 😊",
    OD: "କୌଣସି ସମସ୍ୟା ନାହିଁ! ଆସନ୍ତୁ ଆଗକୁ ବଢ଼ିବା। 😊",
  },
  npk: {
    EN: "Do you have an NPK sensor to measure soil nutrients? 🧪",
    HI: "क्या आपके पास मिट्टी के पोषक तत्व मापने के लिए NPK सेंसर है? 🧪",
    OD: "ଆପଣଙ୍କ ପାଖରେ ମାଟିର ପୋଷକ ତତ୍ତ୍ୱ ମାପିବା ପାଇଁ NPK ସେନ୍ସର ଅଛି କି? 🧪",
  },
  npk_no: {
    EN: "That's okay! Not everyone has one. Let's move ahead. 💪",
    HI: "कोई बात नहीं! सबके पास नहीं होता। आगे बढ़ते हैं। 💪",
    OD: "ଠିକ ଅଛି! ସମସ୍ତଙ୍କ ପାଖରେ ନଥାଏ। ଆସନ୍ତୁ ଆଗକୁ ବଢ଼ିବା। 💪",
  },
  enter_n: {
    EN: "Please enter the Nitrogen (N) value:",
    HI: "कृपया नाइट्रोजन (N) का मान दर्ज करें:",
    OD: "ଦୟାକରି ନାଇଟ୍ରୋଜେନ (N) ମୂଲ୍ୟ ଲେଖନ୍ତୁ:",
  },
  enter_p: {
    EN: "Please enter the Phosphorus (P) value:",
    HI: "कृपया फॉस्फोरस (P) का मान दर्ज करें:",
    OD: "ଦୟାକରି ଫସଫରସ (P) ମୂଲ୍ୟ ଲେଖନ୍ତୁ:",
  },
  enter_k: {
    EN: "Please enter the Potassium (K) value:",
    HI: "कृपया पोटैशियम (K) का मान दर्ज करें:",
    OD: "ଦୟାକରି ପୋଟାସିୟମ (K) ମୂଲ୍ୟ ଲେଖନ୍ତୁ:",
  },
  enter_ph: {
    EN: "Please enter the Soil pH value:",
    HI: "कृपया मिट्टी का pH मान दर्ज करें:",
    OD: "ଦୟାକରି ମାଟିର pH ମୂଲ୍ୟ ଲେଖନ୍ତୁ:",
  },
  soil: {
    EN: "Do you have a Soil Health Card? 🪪",
    HI: "क्या आपके पास मृदा स्वास्थ्य कार्ड है? 🪪",
    OD: "ଆପଣଙ୍କ ପାଖରେ ମୃତ୍ତିକା ସ୍ୱାସ୍ଥ୍ୟ କାର୍ଡ ଅଛି କି? 🪪",
  },
  soil_no: {
    EN: "No worries! You can get one from your nearest agriculture office. Let's continue! 🌿",
    HI: "चिंता मत करें! आप अपने नज़दीकी कृषि कार्यालय से प्राप्त कर सकते हैं। आगे बढ़ते हैं! 🌿",
    OD: "ଚିନ୍ତା କରନ୍ତୁ ନାହିଁ! ଆପଣ ନିକଟତମ କୃଷି କାର୍ଯ୍ୟାଳୟରୁ ପାଇପାରିବେ। ଆସନ୍ତୁ ଆଗକୁ ବଢ଼ିବା! 🌿",
  },
  crop: {
    EN: "Which crop are you growing? 🌾\n\nPlease choose:\n1) Tomato 🍅\n2) Potato 🥔\n3) Corn 🌽",
    HI: "आप कौन सी फसल उगा रहे हैं? 🌾\n\nकृपया चुनें:\n1) टमाटर 🍅\n2) आलू 🥔\n3) मक्का 🌽",
    OD: "ଆପଣ କେଉଁ ଫସଲ ଚାଷ କରୁଛନ୍ତି? 🌾\n\nଦୟାକରି ବାଛନ୍ତୁ:\n1) ଟମାଟୋ 🍅\n2) ଆଳୁ 🥔\n3) ମକା 🌽",
  },
  crop_invalid: {
    EN: "Sorry, please choose from: Tomato, Potato, or Corn only. 🙏",
    HI: "क्षमा करें, कृपया केवल टमाटर, आलू, या मक्का में से चुनें। 🙏",
    OD: "କ୍ଷମା କରନ୍ତୁ, ଦୟାକରି କେବଳ ଟମାଟୋ, ଆଳୁ, କିମ୍ବା ମକା ମଧ୍ୟରୁ ବାଛନ୍ତୁ। 🙏",
  },
  done: {
    EN: "Thank you! 🎉 Here's what I collected:\n\n",
    HI: "धन्यवाद! 🎉 मैंने जो जानकारी एकत्र की:\n\n",
    OD: "ଧନ୍ୟବାଦ! 🎉 ମୁଁ ଯାହା ସଂଗ୍ରହ କଲି:\n\n",
  },
  done_footer: {
    EN: "\n\nI will now help you with the best suggestions for your farm! 🌾💚",
    HI: "\n\nमैं अब आपकी खेती के लिए सबसे अच्छे सुझाव दूंगा! 🌾💚",
    OD: "\n\nମୁଁ ଏବେ ଆପଣଙ୍କ ଚାଷ ପାଇଁ ସର୍ବୋତ୍ତମ ପରାମର୍ଶ ଦେବି! 🌾💚",
  },
  yes: { EN: "Yes", HI: "हाँ", OD: "ହଁ" },
  no: { EN: "No", HI: "नहीं", OD: "ନାହିଁ" },
  choose_lang: {
    EN: "Welcome! 🌱 Please choose your language:",
    HI: "Welcome! 🌱 Please choose your language:",
    OD: "Welcome! 🌱 Please choose your language:",
  },
  value_saved: {
    EN: "Got it! ✅",
    HI: "समझ गया! ✅",
    OD: "ବୁଝିଲି! ✅",
  },
};

const CROP_MAP: Record<string, string> = {
  "1": "Tomato", tomato: "Tomato", "🍅": "Tomato",
  "2": "Potato", potato: "Potato", "🥔": "Potato",
  "3": "Corn", corn: "Corn", "🌽": "Corn",
  // Hindi
  "टमाटर": "Tomato", "आलू": "Potato", "मक्का": "Corn",
  // Odia
  "ଟମାଟୋ": "Tomato", "ଆଳୁ": "Potato", "ମକା": "Corn",
};

function isYes(text: string): boolean {
  const t = text.trim().toLowerCase();
  return ["yes", "y", "हाँ", "हां", "ha", "ହଁ", "han"].includes(t);
}

function isNo(text: string): boolean {
  const t = text.trim().toLowerCase();
  return ["no", "n", "नहीं", "nahi", "ନାହିଁ", "nahi"].includes(t);
}

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState<Step>("lang");
  const [lang, setLang] = useState<Lang>("EN");
  const [data, setData] = useState<Record<string, string>>({});
  const [showLeafAnalysis, setShowLeafAnalysis] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const addBot = useCallback((content: string, options?: string[]) => {
    setMessages((prev) => [...prev, { role: "assistant", content, options }]);
  }, []);

  const addUser = useCallback((content: string) => {
    setMessages((prev) => [...prev, { role: "user", content }]);
  }, []);

  // Start chat
  useEffect(() => {
    if (open && messages.length === 0) {
      addBot(T.choose_lang.EN, ["English", "हिन्दी (Hindi)", "ଓଡ଼ିଆ (Odia)"]);
    }
  }, [open, messages.length, addBot]);

  const processInput = useCallback(
    (text: string) => {
      const t = text.trim();
      addUser(t);

      switch (step) {
        case "lang": {
          let selectedLang: Lang = "EN";
          const lower = t.toLowerCase();
          if (lower.includes("hindi") || lower.includes("हिन्दी") || lower === "2") selectedLang = "HI";
          else if (lower.includes("odia") || lower.includes("ଓଡ଼ିଆ") || lower === "3") selectedLang = "OD";
          setLang(selectedLang);
          setStep("greeting");
          setTimeout(() => {
            addBot(T.greeting[selectedLang]);
            setTimeout(() => {
              addBot(T.camera[selectedLang], [T.yes[selectedLang], T.no[selectedLang]]);
              setStep("camera");
            }, 600);
          }, 400);
          break;
        }
        case "camera":
          if (isYes(t)) {
            addBot(T.camera_yes[lang]);
            setShowLeafAnalysis(true);
            // NPK step will be triggered after leaf analysis closes
          } else if (isNo(t)) {
            addBot(T.camera_no[lang]);
            setTimeout(() => {
              addBot(T.npk[lang], [T.yes[lang], T.no[lang]]);
              setStep("npk");
            }, 600);
          } else {
            addBot(T.camera[lang], [T.yes[lang], T.no[lang]]);
          }
          break;
        case "npk":
          if (isYes(t)) {
            addBot(T.enter_n[lang]);
            setStep("npk_yes_n");
          } else if (isNo(t)) {
            addBot(T.npk_no[lang]);
            setTimeout(() => {
              addBot(T.soil[lang], [T.yes[lang], T.no[lang]]);
              setStep("soil");
            }, 600);
          } else {
            addBot(T.npk[lang], [T.yes[lang], T.no[lang]]);
          }
          break;
        case "npk_yes_n":
          setData((d) => ({ ...d, npk_n: t }));
          addBot(T.value_saved[lang] + " " + T.enter_p[lang]);
          setStep("npk_yes_p");
          break;
        case "npk_yes_p":
          setData((d) => ({ ...d, npk_p: t }));
          addBot(T.value_saved[lang] + " " + T.enter_k[lang]);
          setStep("npk_yes_k");
          break;
        case "npk_yes_k":
          setData((d) => ({ ...d, npk_k: t }));
          addBot(T.value_saved[lang]);
          setTimeout(() => {
            addBot(T.soil[lang], [T.yes[lang], T.no[lang]]);
            setStep("soil");
          }, 600);
          break;
        case "soil":
          if (isYes(t)) {
            addBot(T.enter_n[lang]);
            setStep("soil_yes_n");
          } else if (isNo(t)) {
            addBot(T.soil_no[lang]);
            setTimeout(() => {
              addBot(T.crop[lang]);
              setStep("crop");
            }, 600);
          } else {
            addBot(T.soil[lang], [T.yes[lang], T.no[lang]]);
          }
          break;
        case "soil_yes_n":
          setData((d) => ({ ...d, soil_n: t }));
          addBot(T.value_saved[lang] + " " + T.enter_p[lang]);
          setStep("soil_yes_p");
          break;
        case "soil_yes_p":
          setData((d) => ({ ...d, soil_p: t }));
          addBot(T.value_saved[lang] + " " + T.enter_k[lang]);
          setStep("soil_yes_k");
          break;
        case "soil_yes_k":
          setData((d) => ({ ...d, soil_k: t }));
          addBot(T.value_saved[lang] + " " + T.enter_ph[lang]);
          setStep("soil_yes_ph");
          break;
        case "soil_yes_ph":
          setData((d) => ({ ...d, soil_ph: t }));
          addBot(T.value_saved[lang]);
          setTimeout(() => {
            addBot(T.crop[lang]);
            setStep("crop");
          }, 600);
          break;
        case "crop": {
          const cropKey = t.toLowerCase();
          const crop = CROP_MAP[cropKey] || CROP_MAP[t];
          if (crop) {
            const newData: Record<string, string> = { ...data, crop };
            setData(newData);
            // Build summary
            let summary = T.done[lang];
            summary += `🌾 **${lang === "EN" ? "Crop" : lang === "HI" ? "फसल" : "ଫସଲ"}:** ${crop}\n`;
            if (newData["npk_n"]) summary += `🧪 **NPK:** N=${newData["npk_n"]}, P=${newData["npk_p"]}, K=${newData["npk_k"]}\n`;
            if (newData["soil_n"]) summary += `🪪 **${lang === "EN" ? "Soil Card" : lang === "HI" ? "मृदा कार्ड" : "ମୃତ୍ତିକା କାର୍ଡ"}:** N=${newData["soil_n"]}, P=${newData["soil_p"]}, K=${newData["soil_k"]}, pH=${newData["soil_ph"]}\n`;
            summary += T.done_footer[lang];
            addBot(summary);
            setStep("done");
          } else {
            addBot(T.crop_invalid[lang]);
          }
          break;
        }
        case "done":
          addBot(
            lang === "EN"
              ? "Thank you for using AgriVision! If you have more questions, feel free to ask. 🌱"
              : lang === "HI"
              ? "AgriVision का उपयोग करने के लिए धन्यवाद! और सवाल हों तो पूछें। 🌱"
              : "AgriVision ବ୍ୟବହାର କରିଥିବାରୁ ଧନ୍ୟବାଦ! ଆଉ ପ୍ରଶ୍ନ ଥିଲେ ପଚାରନ୍ତୁ। 🌱"
          );
          break;
      }
    },
    [step, lang, data, addBot, addUser]
  );

  const handleLeafResult = useCallback((result: string) => {
    addBot(result);
    setTimeout(() => {
      addBot(T.npk[lang], [T.yes[lang], T.no[lang]]);
      setStep("npk");
    }, 600);
  }, [addBot, lang]);

  const handleLeafClose = useCallback(() => {
    setShowLeafAnalysis(false);
    // If no result was provided, still move to npk
    setTimeout(() => {
      addBot(T.npk[lang], [T.yes[lang], T.no[lang]]);
      setStep("npk");
    }, 400);
  }, [addBot, lang]);

  const handleOptionClick = (option: string) => {
    processInput(option);
  };

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    processInput(text);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div
          className="fixed bottom-5 right-5 z-50 flex w-[340px] sm:w-[380px] flex-col rounded-2xl border border-border bg-card shadow-2xl animate-in slide-in-from-bottom-4 duration-300"
          style={{ height: "min(520px, 80vh)" }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border rounded-t-2xl bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" />
            <span className="font-display font-bold text-sm flex-1">AgriVision AI</span>
            <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-primary-foreground/20 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i}>
                <div className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none [&_p]:m-0 [&_ul]:my-1 [&_li]:my-0">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : (
                      m.content
                    )}
                  </div>
                </div>
                {/* Quick-reply buttons */}
                {m.role === "assistant" && m.options && i === messages.length - 1 && (
                  <div className="flex flex-wrap gap-2 mt-2 ml-1">
                    {m.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleOptionClick(opt)}
                        className="px-3 py-1.5 text-xs font-medium rounded-full border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex items-center gap-2 px-3 py-3 border-t border-border"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                step === "lang"
                  ? "Choose a language..."
                  : lang === "HI"
                  ? "यहाँ टाइप करें..."
                  : lang === "OD"
                  ? "ଏଠାରେ ଟାଇପ କରନ୍ତୁ..."
                  : "Type here..."
              }
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40 transition-opacity"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      <LeafAnalysis
        open={showLeafAnalysis}
        onClose={handleLeafClose}
        onResult={(result) => {
          setShowLeafAnalysis(false);
          handleLeafResult(result);
        }}
        lang={lang}
      />
    </>
  );
}
