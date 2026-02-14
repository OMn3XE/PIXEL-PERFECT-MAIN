import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, X, RotateCcw, Leaf, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeafAnalysisProps {
  open: boolean;
  onClose: () => void;
  onResult: (result: string) => void;
  lang: "EN" | "HI" | "OD";
}

const DISEASES = [
  {
    name: { EN: "Early Blight", HI: "अगेती झुलसा", OD: "ଆଗୁଆ ଝଳସା" },
    desc: {
      EN: "Dark brown spots with concentric rings found on leaves. Apply copper-based fungicide and remove affected leaves.",
      HI: "पत्तियों पर गहरे भूरे धब्बे दिखाई दे रहे हैं। तांबा आधारित फफूंदनाशक लगाएं और प्रभावित पत्तियों को हटा दें।",
      OD: "ପତ୍ରରେ ଗାଢ଼ ବାଦାମୀ ଦାଗ ଦେଖାଯାଉଛି। ତମ୍ବା ଆଧାରିତ କବକନାଶକ ପ୍ରୟୋଗ କରନ୍ତୁ ଏବଂ ପ୍ରଭାବିତ ପତ୍ରଗୁଡ଼ିକ ଅପସାରଣ କରନ୍ତୁ।",
    },
    confidence: 87,
  },
  {
    name: { EN: "Leaf Curl", HI: "पत्ता मोड़ रोग", OD: "ପତ୍ର ମୋଡ଼ ରୋଗ" },
    desc: {
      EN: "Leaves are curling and turning yellow. This is likely caused by whitefly. Use neem oil spray every 7 days.",
      HI: "पत्तियाँ मुड़ रही हैं और पीली हो रही हैं। यह सफेद मक्खी के कारण है। हर 7 दिन नीम का तेल छिड़कें।",
      OD: "ପତ୍ରଗୁଡ଼ିକ ମୋଡ଼ି ହୋଇ ହଳଦିଆ ପଡ଼ୁଛି। ଏହା ଧଳା ମାଛି ଦ୍ୱାରା ହୋଇଥାଏ। ପ୍ରତି 7 ଦିନରେ ନିମ୍ବ ତେଲ ସ୍ପ୍ରେ କରନ୍ତୁ।",
    },
    confidence: 92,
  },
  {
    name: { EN: "Healthy Leaf", HI: "स्वस्थ पत्ती", OD: "ସୁସ୍ଥ ପତ୍ର" },
    desc: {
      EN: "Great news! Your leaf looks healthy. Keep up the good farming practices! 🌿",
      HI: "अच्छी खबर! आपकी पत्ती स्वस्थ दिख रही है। अच्छी खेती जारी रखें! 🌿",
      OD: "ଭଲ ଖବର! ଆପଣଙ୍କ ପତ୍ର ସୁସ୍ଥ ଦେଖାଯାଉଛି। ଭଲ ଚାଷ ଜାରି ରଖନ୍ତୁ! 🌿",
    },
    confidence: 95,
  },
];

const T_LEAF: Record<string, Record<string, string>> = {
  title: { EN: "Leaf Analysis 🍃", HI: "पत्ती विश्लेषण 🍃", OD: "ପତ୍ର ବିଶ୍ଳେଷଣ 🍃" },
  instruction: {
    EN: "Point your camera at the leaf and tap Capture",
    HI: "पत्ती की ओर कैमरा रखें और कैप्चर दबाएं",
    OD: "ପତ୍ର ଆଡ଼କୁ କ୍ୟାମେରା ରଖନ୍ତୁ ଏବଂ କ୍ୟାପଚର ଦବାନ୍ତୁ",
  },
  capture: { EN: "Capture", HI: "कैप्चर", OD: "କ୍ୟାପଚର" },
  analyzing: { EN: "Analyzing leaf...", HI: "पत्ती का विश्लेषण हो रहा है...", OD: "ପତ୍ର ବିଶ୍ଳେଷଣ ହେଉଛି..." },
  result: { EN: "Analysis Result", HI: "विश्लेषण परिणाम", OD: "ବିଶ୍ଳେଷଣ ଫଳାଫଳ" },
  confidence: { EN: "Confidence", HI: "विश्वास", OD: "ବିଶ୍ୱାସ" },
  retake: { EN: "Scan Again", HI: "फिर से स्कैन", OD: "ପୁନର୍ବାର ସ୍କାନ" },
  done: { EN: "Done", HI: "पूर्ण", OD: "ସମ୍ପୂର୍ଣ୍ଣ" },
  cam_error: {
    EN: "Could not access camera. Please allow camera permission.",
    HI: "कैमरा एक्सेस नहीं हो सका। कृपया कैमरा अनुमति दें।",
    OD: "କ୍ୟାମେରା ଆକ୍ସେସ ହୋଇପାରିଲା ନାହିଁ। ଦୟାକରି କ୍ୟାମେରା ଅନୁମତି ଦିଅନ୍ତୁ।",
  },
};

export function LeafAnalysis({ open, onClose, onResult, lang }: LeafAnalysisProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<"camera" | "analyzing" | "result">("camera");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [disease, setDisease] = useState<(typeof DISEASES)[0] | null>(null);
  const [camError, setCamError] = useState(false);

  const startCamera = useCallback(async () => {
    setCamError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCamError(true);
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (open && phase === "camera") {
      startCamera();
    }
    return () => stopCamera();
  }, [open, phase, startCamera, stopCamera]);

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(dataUrl);
    stopCamera();
    setPhase("analyzing");

    // Simulate AI analysis
    setTimeout(() => {
      const result = DISEASES[Math.floor(Math.random() * DISEASES.length)];
      setDisease(result);
      setPhase("result");
    }, 2500);
  };

  const retake = () => {
    setCapturedImage(null);
    setDisease(null);
    setPhase("camera");
  };

  const handleDone = () => {
    if (disease) {
      const resultText = `🍃 **${disease.name[lang]}** (${disease.confidence}%)\n\n${disease.desc[lang]}`;
      onResult(resultText);
    }
    stopCamera();
    setCapturedImage(null);
    setDisease(null);
    setPhase("camera");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overlay-blur animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-sm rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-primary text-primary-foreground">
          <div className="flex items-center gap-2">
            <Leaf className="h-5 w-5" />
            <span className="font-display font-bold text-sm">{T_LEAF.title[lang]}</span>
          </div>
          <button onClick={handleDone} className="rounded-full p-1 hover:bg-primary-foreground/20 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4">
          {phase === "camera" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground text-center">{T_LEAF.instruction[lang]}</p>
              <div className="relative rounded-xl overflow-hidden bg-muted aspect-[4/3]">
                {camError ? (
                  <div className="flex items-center justify-center h-full p-4 text-sm text-destructive text-center">
                    {T_LEAF.cam_error[lang]}
                  </div>
                ) : (
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                )}
                {/* Scan overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-lg" />
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-lg" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-lg" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-lg" />
                </div>
              </div>
              <Button onClick={capture} className="w-full gap-2" disabled={camError}>
                <Camera className="h-4 w-4" />
                {T_LEAF.capture[lang]}
              </Button>
            </div>
          )}

          {phase === "analyzing" && (
            <div className="space-y-3">
              {capturedImage && (
                <div className="rounded-xl overflow-hidden">
                  <img src={capturedImage} alt="Captured leaf" className="w-full aspect-[4/3] object-cover" />
                </div>
              )}
              <div className="flex items-center justify-center gap-2 py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm font-medium text-foreground">{T_LEAF.analyzing[lang]}</span>
              </div>
            </div>
          )}

          {phase === "result" && disease && (
            <div className="space-y-3">
              {capturedImage && (
                <div className="rounded-xl overflow-hidden">
                  <img src={capturedImage} alt="Analyzed leaf" className="w-full aspect-[4/3] object-cover" />
                </div>
              )}
              <div className="rounded-xl border border-border bg-card p-3 space-y-2">
                <p className="font-display font-bold text-foreground">{T_LEAF.result[lang]}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary">{disease.name[lang]}</span>
                  <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                    {T_LEAF.confidence[lang]}: {disease.confidence}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{disease.desc[lang]}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 gap-2" onClick={retake}>
                  <RotateCcw className="h-4 w-4" />
                  {T_LEAF.retake[lang]}
                </Button>
                <Button className="flex-1" onClick={handleDone}>
                  {T_LEAF.done[lang]}
                </Button>
              </div>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
