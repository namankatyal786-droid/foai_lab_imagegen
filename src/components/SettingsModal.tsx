import { motion, AnimatePresence } from "motion/react";
import { X, Settings, Key, Info } from "lucide-react";
import { NeoButton } from "./NeoButton";
import { NeoInput } from "./NeoInput";
import { useState, useEffect } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hfToken: string;
  onSave: (token: string) => void;
}

export function SettingsModal({ isOpen, onClose, hfToken, onSave }: SettingsModalProps) {
  const [tempToken, setTempToken] = useState(hfToken);

  useEffect(() => {
    setTempToken(hfToken);
  }, [hfToken, isOpen]);

  const handleSave = () => {
    onSave(tempToken);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md border-4 border-black bg-white p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-6 w-6" />
                <h2 className="text-2xl font-black uppercase tracking-tight">Settings</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-none border-2 border-black p-1 hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
                  Hugging Face Token
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <NeoInput
                    type="password"
                    value={tempToken}
                    onChange={(e) => setTempToken(e.target.value)}
                    placeholder="hf_..."
                    className="pl-10"
                  />
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-[10px] font-bold uppercase text-gray-400">
                  <Info className="h-3 w-3" />
                  Your token is stored locally in your browser.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <NeoButton
                  variant="ghost"
                  className="flex-1"
                  onClick={onClose}
                >
                  Cancel
                </NeoButton>
                <NeoButton
                  variant="primary"
                  className="flex-1"
                  onClick={handleSave}
                >
                  Save Changes
                </NeoButton>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
