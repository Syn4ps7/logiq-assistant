import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, Copy, Check, Building2, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

type Msg = { role: "user" | "assistant"; content: string };
type ClientType = "pro" | "particulier" | null;

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

async function streamChat({
  messages,
  clientType,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  clientType: ClientType;
  onDelta: (t: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, clientType }),
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    onError(body.error || "Une erreur est survenue.");
    return;
  }

  if (!resp.body) {
    onError("Pas de réponse du serveur.");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") {
        onDone();
        return;
      }
      try {
        const parsed = JSON.parse(json);
        const c = parsed.choices?.[0]?.delta?.content;
        if (c) onDelta(c);
      } catch {
        buf = line + "\n" + buf;
        break;
      }
    }
  }
  onDone();
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={copy}
      className="absolute top-1.5 right-1.5 h-6 w-6 rounded-md bg-background/80 border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      aria-label="Copier"
    >
      {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
    </button>
  );
}

function ClientTypeSelector({ onSelect }: { onSelect: (type: ClientType) => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground mb-1">{t("chatbot.clientTypeQuestion")}</p>
      <div className="flex gap-2">
        <button
          onClick={() => onSelect("particulier")}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border bg-card hover:bg-accent transition-colors text-sm font-medium text-foreground"
        >
          <User className="h-4 w-4" />
          {t("chatbot.particulier")}
        </button>
        <button
          onClick={() => onSelect("pro")}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border bg-card hover:bg-accent transition-colors text-sm font-medium text-foreground"
        >
          <Building2 className="h-4 w-4" />
          {t("chatbot.professionnel")}
        </button>
      </div>
    </div>
  );
}

export function ChatbotWidget() {
  const [isActive, setIsActive] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showProactive, setShowProactive] = useState(false);
  const [clientType, setClientType] = useState<ClientType>(null);
  const proactiveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  // Draggable bubble state
  const [bubblePos, setBubblePos] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number; moved: boolean } | null>(null);
  const bubbleRef = useRef<HTMLButtonElement>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const el = bubbleRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: rect.left,
      origY: rect.top,
      moved: false,
    };
    el.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true;
    if (!d.moved) return;
    const newX = Math.max(0, Math.min(window.innerWidth - 56, d.origX + dx));
    const newY = Math.max(0, Math.min(window.innerHeight - 56, d.origY + dy));
    setBubblePos({ x: newX, y: newY });
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    if (!d.moved) setIsActive((v) => !v);
    dragRef.current = null;
    bubbleRef.current?.releasePointerCapture(e.pointerId);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, clientType]);

  useEffect(() => {
    if (isActive) {
      inputRef.current?.focus();
      setShowProactive(false);
      if (proactiveTimerRef.current) clearTimeout(proactiveTimerRef.current);
    }
  }, [isActive]);

  // Proactive message after 8 seconds if chat not opened
  useEffect(() => {
    proactiveTimerRef.current = setTimeout(() => {
      if (!isActive) setShowProactive(true);
    }, 8000);
    return () => {
      if (proactiveTimerRef.current) clearTimeout(proactiveTimerRef.current);
    };
  }, []);

  const quickKeys = clientType === "pro"
    ? (["quickPro1", "quickPro2", "quickPro3"] as const)
    : (["quick1", "quick2", "quick3"] as const);

  const handleClientTypeSelect = (type: ClientType) => {
    setClientType(type);
    // Add a system-like greeting based on type
    const greetingKey = type === "pro" ? "chatbot.greetingPro" : "chatbot.greetingParticulier";
    setMessages([{ role: "assistant", content: t(greetingKey) }]);
  };

  const sendText = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setInput("");

    let assistantSoFar = "";
    const allMessages = [...messages, userMsg];

    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: allMessages,
        clientType,
        onDelta: upsert,
        onDone: () => setIsLoading(false),
        onError: (msg) => {
          setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ ${msg}` }]);
          setIsLoading(false);
        },
      });
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Erreur de connexion." }]);
      setIsLoading(false);
    }
  }, [isLoading, messages, clientType]);

  const send = useCallback(() => sendText(input), [input, sendText]);

  return (
    <div
      id="logiq-chatbot"
      className="fixed z-50"
      style={bubblePos ? { left: bubblePos.x, top: bubblePos.y, right: "auto", bottom: "auto" } : { bottom: 24, right: 24 }}
    >
      {isActive && (
        <div className="mb-4 w-80 sm:w-96 bg-card rounded-xl shadow-2xl border overflow-hidden animate-fade-in-up flex flex-col" style={{ maxHeight: "min(500px, 70vh)" }}>
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between shrink-0">
            <div>
              <h3 className="font-semibold text-sm">{t("chatbot.title")}</h3>
              <p className="text-xs opacity-80">
                {clientType ? (clientType === "pro" ? t("chatbot.modePro") : t("chatbot.modeParticulier")) : t("chatbot.online")}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {clientType && (
                <button
                  onClick={() => { setClientType(null); setMessages([]); }}
                  className="px-2 py-1 rounded-md text-xs hover:bg-primary-foreground/10 transition-colors"
                  aria-label="Changer de profil"
                >
                  ↩
                </button>
              )}
              <button onClick={() => setIsActive(false)} className="p-1 rounded-full hover:bg-primary-foreground/10 transition-colors" aria-label="Fermer">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-muted/30">
            {!clientType ? (
              <>
                <div className="bg-muted rounded-lg p-3 text-sm max-w-[85%]">
                  <p className="text-foreground">{t("chatbot.greeting")}</p>
                </div>
                <ClientTypeSelector onSelect={handleClientTypeSelect} />
              </>
            ) : (
              <>
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`group relative rounded-lg p-3 text-sm max-w-[85%] ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground whitespace-pre-wrap"
                        : "bg-muted text-foreground prose prose-sm prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-1 max-w-[85%]"
                    }`}>
                      {m.role === "assistant" ? (
                        <>
                          <ReactMarkdown>{m.content}</ReactMarkdown>
                          <CopyButton text={m.content} />
                        </>
                      ) : (
                        m.content
                      )}
                    </div>
                  </div>
                ))}
                {messages.length === 1 && messages[0].role === "assistant" && !isLoading && (
                  <div className="flex flex-wrap gap-2">
                    {quickKeys.map((key) => (
                      <button
                        key={key}
                        onClick={() => sendText(t(`chatbot.${key}`))}
                        className="text-xs px-3 py-1.5 rounded-full border bg-card hover:bg-accent transition-colors text-foreground"
                      >
                        {t(`chatbot.${key}`)}
                      </button>
                    ))}
                  </div>
                )}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Input */}
          {clientType && (
            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="p-3 border-t flex gap-2 shrink-0"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("chatbot.placeholder")}
                className="flex-1 px-3 py-2 text-sm bg-muted rounded-md border-0 focus:ring-2 focus:ring-primary focus:outline-none"
                disabled={isLoading}
              />
              <Button variant="petrol" size="icon" type="submit" disabled={isLoading || !input.trim()} aria-label="Envoyer">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>
      )}
      {/* Proactive bubble */}
      {showProactive && !isActive && (
        <button
          onClick={() => { setShowProactive(false); setIsActive(true); }}
          className="mb-3 bg-card border shadow-lg rounded-xl px-4 py-3 text-sm text-foreground max-w-[260px] text-left animate-fade-in-up hover:shadow-xl transition-shadow relative"
        >
          <button
            onClick={(e) => { e.stopPropagation(); setShowProactive(false); }}
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-muted border flex items-center justify-center hover:bg-muted-foreground/10"
            aria-label="Fermer"
          >
            <X className="h-3 w-3" />
          </button>
          <p className="font-medium text-xs text-primary mb-0.5">LogIQ Assistant</p>
          <p>{t("chatbot.proactive")}</p>
        </button>
      )}
      <button
        ref={bubbleRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="h-14 w-14 rounded-full bg-accent text-accent-foreground shadow-lg hover:shadow-xl flex items-center justify-center transition-shadow touch-none select-none cursor-grab active:cursor-grabbing"
        aria-label={isActive ? "Fermer le chat" : "Ouvrir le chat"}
      >
        {isActive ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
