import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function ChatbotWidget() {
  const [isActive, setIsActive] = useState(false);
  const [isProactive, setIsProactive] = useState(false);
  const { t } = useTranslation();

  return (
    <div
      id="logiq-chatbot"
      className={`logiq-chatbot--widget fixed bottom-6 right-6 z-50 ${isActive ? "logiq-chatbot--active" : ""} ${isProactive ? "logiq-chatbot--proactive" : ""}`}
    >
      {isActive && (
        <div className="mb-4 w-80 sm:w-96 bg-card rounded-xl shadow-2xl border overflow-hidden animate-fade-in-up">
          <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm">{t("chatbot.title")}</h3>
              <p className="text-xs opacity-80">{t("chatbot.online")}</p>
            </div>
            <button onClick={() => setIsActive(false)} className="p-1 rounded-full hover:bg-primary-foreground/10 transition-colors" aria-label="Fermer le chat">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="h-72 p-4 overflow-y-auto bg-muted/30">
            <div className="bg-muted rounded-lg p-3 text-sm max-w-[80%]">
              <p className="text-foreground">{t("chatbot.greeting")}</p>
            </div>
          </div>
          <div className="p-3 border-t flex gap-2">
            <input type="text" placeholder={t("chatbot.placeholder")} className="flex-1 px-3 py-2 text-sm bg-muted rounded-md border-0 focus:ring-2 focus:ring-primary focus:outline-none" disabled />
            <Button variant="petrol" size="icon" disabled aria-label="Envoyer"><Send className="h-4 w-4" /></Button>
          </div>
          <div className="px-3 pb-2">
            <p className="text-[10px] text-muted-foreground text-center">{t("chatbot.integrating")}</p>
          </div>
        </div>
      )}
      <button onClick={() => setIsActive(!isActive)} className="h-14 w-14 rounded-full bg-accent text-accent-foreground shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-105" aria-label={isActive ? "Fermer le chat" : "Ouvrir le chat"}>
        {isActive ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
