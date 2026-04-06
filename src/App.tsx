import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Settings as SettingsIcon, 
  Download, 
  Copy, 
  RefreshCw, 
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  History,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Plus
} from "lucide-react";
import { NeoButton } from "./components/NeoButton";
import { NeoTextarea } from "./components/NeoInput";
import { SettingsModal } from "./components/SettingsModal";
import { cn } from "./lib/utils";

interface HistoryItem {
  id: string;
  prompt: string;
  imageUrl: string;
  timestamp: number;
}

const DEFAULT_MODEL = "stabilityai/stable-diffusion-xl-base-1.0";

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hfToken, setHfToken] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Load token and history from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("hf_token");
    if (savedToken) setHfToken(savedToken);

    const savedHistory = localStorage.getItem("hf_history");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("hf_history", JSON.stringify(history));
  }, [history]);

  const saveToken = (token: string) => {
    setHfToken(token);
    localStorage.setItem("hf_token", token);
  };

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt first.");
      return;
    }
    if (!hfToken) {
      setError("Hugging Face token is missing. Please add it in settings.");
      setIsSettingsOpen(true);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(
        "https://router.huggingface.co/nscale/v1/images/generations",
        {
          headers: {
            Authorization: `Bearer ${hfToken}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            prompt: prompt,
            model: DEFAULT_MODEL,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }

      const blob = await response.blob();
      
      let imageUrl: string;
      
      // Check if the blob is actually JSON (OpenAI-compatible APIs often return JSON)
      if (blob.type.includes('json')) {
        const text = await blob.text();
        const result = JSON.parse(text);
        if (result.data && result.data[0]?.b64_json) {
          imageUrl = `data:image/png;base64,${result.data[0].b64_json}`;
        } else if (result.data && result.data[0]?.url) {
          imageUrl = result.data[0].url;
        } else {
          throw new Error("Unexpected JSON response format");
        }
      } else {
        // It's a raw image blob
        imageUrl = await blobToBase64(blob);
      }
      
      setGeneratedImage(imageUrl);
      
      // Add to history
      const newItem: HistoryItem = {
        id: Math.random().toString(36).substring(7),
        prompt: prompt,
        imageUrl: imageUrl,
        timestamp: Date.now(),
      };
      setHistory(prev => [newItem, ...prev]);

    } catch (err: any) {
      console.error("Generation failed:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (imgUrl: string) => {
    const link = document.createElement("a");
    link.href = imgUrl;
    link.download = `generated-${Date.now()}.png`;
    link.click();
  };

  const handleCopy = async (imgUrl: string) => {
    try {
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    if (generatedImage && history.find(item => item.id === id)?.imageUrl === generatedImage) {
      setGeneratedImage(null);
    }
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear all history?")) {
      setHistory([]);
      setGeneratedImage(null);
    }
  };

  const selectHistoryItem = (item: HistoryItem) => {
    setGeneratedImage(item.imageUrl);
    setPrompt(item.prompt);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F0F0F0] font-sans text-black selection:bg-[#00FF00] selection:text-black">
      {/* Sidebar - History */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 320 : 0 }}
        className={cn(
          "relative flex flex-col border-r-4 border-black bg-white transition-all overflow-hidden",
          !isSidebarOpen && "border-r-0"
        )}
      >
        <div className="flex h-full w-[320px] flex-col">
          <div className="flex items-center justify-between border-b-4 border-black p-4">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5" />
              <h2 className="text-lg font-black uppercase tracking-tight">History</h2>
            </div>
            <button 
              onClick={clearHistory}
              className="rounded-none border-2 border-black p-1 hover:bg-red-100 transition-colors"
              title="Clear History"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
                <History className="h-10 w-10 mb-2" />
                <p className="text-xs font-bold uppercase">No history yet</p>
              </div>
            ) : (
              history.map((item) => (
                <motion.div
                  layout
                  key={item.id}
                  onClick={() => selectHistoryItem(item)}
                  className={cn(
                    "group relative cursor-pointer border-2 border-black bg-white p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]",
                    generatedImage === item.imageUrl && "bg-[#00FF00]/10 border-[#00FF00]"
                  )}
                >
                  <div className="aspect-square w-full overflow-hidden border-2 border-black mb-2">
                    <img src={item.imageUrl} alt={item.prompt} className="h-full w-full object-cover" />
                  </div>
                  <p className="line-clamp-2 text-[10px] font-bold uppercase leading-tight text-gray-600">
                    {item.prompt}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteHistoryItem(item.id);
                    }}
                    className="absolute -right-2 -top-2 hidden rounded-none border-2 border-black bg-white p-1 hover:bg-red-500 hover:text-white group-hover:block"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </motion.div>
              ))
            )}
          </div>

          <div className="border-t-4 border-black p-4">
            <NeoButton 
              variant="ghost" 
              className="w-full" 
              onClick={() => {
                setGeneratedImage(null);
                setPrompt("");
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> NEW GENERATION
            </NeoButton>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b-4 border-black bg-white px-6 py-4 shadow-[0_4px_0_0_rgba(0,0,0,1)]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="border-2 border-black p-1 hover:bg-gray-100 transition-colors"
            >
              {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
            </button>
            <div className="flex items-center gap-3">
              <div className="border-2 border-black bg-[#00FF00] p-2 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                <Sparkles className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tighter">
                NEO<span className="text-[#FF00FF]">STUDIO</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <NeoButton 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2"
            >
              <SettingsIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </NeoButton>
          </div>
        </header>

        {/* Workspace */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_350px]">
            {/* Preview Area */}
            <div className="space-y-6">
              <div className="relative aspect-square w-full border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm"
                    >
                      <div className="relative h-24 w-24">
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 border-8 border-black border-t-[#00FF00]"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <RefreshCw className="h-8 w-8 animate-spin" />
                        </div>
                      </div>
                      <p className="mt-6 text-xl font-black uppercase tracking-widest">Dreaming...</p>
                    </motion.div>
                  ) : generatedImage ? (
                    <motion.div
                      key="image"
                      initial={{ scale: 1.1, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="h-full w-full"
                    >
                      <img 
                        src={generatedImage} 
                        alt="Generated" 
                        className="h-full w-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-6 right-6 flex gap-3">
                        <NeoButton size="sm" variant="ghost" onClick={() => handleCopy(generatedImage)}>
                          {copySuccess ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        </NeoButton>
                        <NeoButton size="sm" variant="ghost" onClick={() => handleDownload(generatedImage)}>
                          <Download className="h-4 w-4" />
                        </NeoButton>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="empty"
                      className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center"
                    >
                      <div className="mb-6 border-4 border-black bg-[#F0F0F0] p-6 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                        <ImageIcon className="h-16 w-16 text-gray-400" />
                      </div>
                      <h3 className="text-2xl font-black uppercase tracking-tight">Ready to Generate</h3>
                      <p className="mt-2 max-w-xs font-bold text-gray-500">
                        Enter your prompt and let the AI create something unique.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {error && (
                <motion.div 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="flex items-center gap-3 border-4 border-black bg-[#FF0000]/10 p-4 font-bold text-[#FF0000] shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                >
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}
            </div>

            {/* Controls Area */}
            <div className="flex flex-col gap-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-black uppercase tracking-widest text-gray-500">
                    Prompt
                  </label>
                </div>
                <NeoTextarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your vision..."
                  className="h-48"
                />
              </div>

              <NeoButton
                variant="primary"
                size="lg"
                className="w-full py-6 text-xl"
                onClick={generateImage}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-3">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                    RUNNING...
                  </span>
                ) : (
                  "RUN"
                )}
              </NeoButton>

              <div className="mt-auto pt-6 border-t-2 border-black/10">
                <p className="text-[10px] font-bold uppercase text-gray-400 leading-relaxed">
                  This studio uses Stable Diffusion XL to generate high-quality images from text. 
                  All generations are saved to your local history.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        hfToken={hfToken}
        onSave={saveToken}
      />
    </div>
  );
}
