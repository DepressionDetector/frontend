import React, { useEffect, useMemo, useRef, useState } from "react";
import bgImage from "../Assets/bgI.png";

type Message = {
  id: string;
  role: "assistant" | "user";
  text: string;
  time: string;
};

const formatTime = () =>
  new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const sample: Message[] = [
  {
    id: crypto.randomUUID(),
    role: "assistant",
    text: "Hi, I’m here to listen. How are you feeling today?",
    time: formatTime(),
  },
  {
    id: crypto.randomUUID(),
    role: "user",
    text: "A bit anxious. Just want a calm space to talk.",
    time: formatTime(),
  },
];

const Chatbox = () => {
  const [messages, setMessages] = useState<Message[]>(sample);
  const [input, setInput] = useState("");
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    viewportRef.current?.scrollTo({
      top: viewportRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  const canSend = useMemo(() => input.trim().length > 0, [input]);

  const send = () => {
    if (!canSend) return;
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: input.trim(),
      time: formatTime(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    setTimeout(() => {
      const reply: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: "Thanks for sharing. What seems to be triggering the anxiety today?",
        time: formatTime(),
      };
      setMessages((m) => [...m, reply]);
    }, 650);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div
      className="min-h-screen w-full relative text-slate-700"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(900px 700px at 85% 10%, rgba(255,200,170,0.7), rgba(255,200,170,0) 60%), linear-gradient(180deg, #9ad7df 0%, #7fc8d2 40%, #7bbfd0 60%, #7ab9ce 100%)",
        }}
      />
      <Sparkles />

      <header className="sticky top-0 z-10 backdrop-blur bg-white/20 border-b border-white/40">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-white/70 neo-in flex items-center justify-center">
              💬
            </div>
            <h1 className="text-base font-semibold text-slate-700/90">
              CalmChatbox
            </h1>
          </div>
          <div className="text-xs text-slate-600/70">
            supportive • private • gentle
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-4 order-2 lg:order-1">
          <div className="rounded-3xl p-4 bg-white/55 neo-out">
            <h2 className="font-medium mb-3">Session Controls</h2>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setMessages(sample)}
                className="w-full rounded-2xl px-4 py-2 bg-white/80 neo-in text-sm font-medium hover:translate-y-[1px] transition"
              >
                ➕ New Chat
              </button>
              <button
                onClick={() => setMessages([])}
                className="w-full rounded-2xl px-4 py-2 bg-red-200/80 text-red-800 font-medium neo-out text-sm hover:translate-y-[1px] transition"
              >
                ⏹ End Session
              </button>
            </div>
            <div className="mt-4 text-xs text-slate-600/80">
              You can start fresh anytime or end your session when done.
            </div>
          </div>
        </aside>

        {/* Chat panel */}
        <section className="lg:col-span-8 order-1 lg:order-2">
          <div className="rounded-3xl bg-white/55 neo-out flex flex-col h-[78vh]">
            <div className="px-4 py-3 border-b border-white/60 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full neo-in bg-white/90 flex items-center justify-center">
                🫶
              </div>
              <div>
                <div className="font-semibold">Tellme</div>
                <div className="text-xs text-slate-600/80">
                  Compassionate AI listener
                </div>
              </div>
            </div>

            <div
              ref={viewportRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
            >
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
            </div>

            <div className="p-3 border-t border-white/60">
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 rounded-full bg-white/90 neo-in px-5 py-3 outline-none placeholder:text-slate-400"
                  placeholder="Write what’s on your mind…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                />
                <button
                  onClick={send}
                  disabled={!canSend}
                  className="rounded-full px-5 py-3 bg-[#ffb8b8] font-bold text-blue-900 neo-in hover:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={"flex w-full " + (isUser ? "justify-end" : "justify-start")}>
      <div
        className={
          "flex items-end gap-2 " + (isUser ? "flex-row-reverse" : "flex-row")
        }
      >
        {!isUser && (
          <div className="h-9 w-9 rounded-full bg-white/90 neo-in flex items-center justify-center overflow-hidden">
            <span className="text-sm">😊</span>
          </div>
        )}
        <div
          className={[
            "max-w-[78%] px-5 py-3 rounded-3xl relative",
            "text-sm leading-relaxed",
            isUser
              ? "bg-[#9fdde2]/90 text-slate-700 bubble-tail-right neo-out"
              : "bg-white/90 text-slate-700 bubble-tail-left neo-in",
          ].join(" ")}
        >
          <div className="flex items-start gap-2">
            <span className="flex-1 whitespace-pre-wrap">{message.text}</span>
            {/* show ❤️ only for user messages */}
            {isUser && <span className="shrink-0 opacity-60">❤️</span>}
          </div>
          <div className="mt-1 text-[10px] opacity-60 text-right">
            {message.time}
          </div>
        </div>
      </div>
    </div>
  );
}

function Sparkles() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      {[
        { x: "12%", y: "28%" },
        { x: "24%", y: "62%" },
        { x: "66%", y: "22%" },
        { x: "78%", y: "44%" },
      ].map((s, i) => (
        <div
          key={i}
          className="absolute animate-pulse"
          style={{
            left: s.x,
            top: s.y,
            width: 10,
            height: 10,
            background:
              "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.95), rgba(255,255,255,0) 70%)",
            transform: "rotate(45deg)",
            borderRadius: 4,
            filter: "drop-shadow(0 1px 4px rgba(255,255,255,0.7))",
          }}
        />
      ))}
    </div>
  );
}

export default Chatbox;
