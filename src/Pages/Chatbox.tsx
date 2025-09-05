import React, { useEffect, useMemo, useRef, useState } from "react";
// Drop this file in a React + TypeScript project (e.g., Vite).
// TailwindCSS recommended. If you use Tailwind, ensure your index.css includes the base/utilities.
// Usage: <Chatbox />

type KeyboardEventHandler = (event: KeyboardEvent) => void;

export type Message = {
    id: string;
    role: "assistant" | "user";
    text: string;
    time: string; // e.g., "12:03"
};

const formatTime = () => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const sample: Message[] = [
    {
        id: crypto.randomUUID(),
        role: "assistant",
        text: "Hi, I'm here to listen. How are you feeling today?",
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
    const [messages, setMessages] = useState(sample);
    const [input, setInput] = useState("");
    const viewportRef = useRef<HTMLDivElement>(null);

    // Smooth auto-scroll to latest message
    useEffect(() => {
        const el = viewportRef.current;
        if (!el) return;
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
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

        // Simulated assistant response
        setTimeout(() => {
            const reply: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                text: "Thanks for sharing. Can you tell me what seems to trigger the anxiety today?",
                time: formatTime(),
            };
            setMessages((m) => [...m, reply]);
        }, 700);
    };
    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 text-white">
            {/* Top bar */}
            <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-blue-900/40 bg-blue-900/70 border-b border-white/10">
                <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">💬</span>
                        <h1 className="text-lg font-semibold tracking-wide">CalmChatbox</h1>
                    </div>
                    <div className="text-xs text-blue-100/80">secure • private • supportive</div>
                </div>
            </header>

            {/* Layout */}
            <main className="mx-auto max-w-7xl px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Sidebar */}
                <aside className="lg:col-span-3 order-2 lg:order-1">
                    <div className="rounded-2xl bg-white/5 border border-white/10 shadow-xl p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-medium text-blue-50">Conversations</h2>
                            <button
                                className="px-3 py-1.5 rounded-xl text-xs bg-blue-500/80 hover:bg-blue-500 transition border border-white/10"
                                onClick={() => {
                                    setMessages(sample);
                                }}
                            >
                                New Chatbox
                            </button>
                        </div>
                        <ul className="space-y-2 text-sm">
                            <li className="group flex items-center justify-between rounded-xl p-3 bg-white/5 border border-white/10">
                                <span className="truncate">Today • Support session</span>
                                <span className="text-blue-200/70 text-xs">active</span>
                            </li>
                            <li className="flex items-center justify-between rounded-xl p-3 hover:bg-white/5 border border-transparent hover:border-white/10 transition">
                                <span className="truncate">Earlier • Reflection</span>
                                <span className="text-blue-200/60 text-xs">archived</span>
                            </li>
                        </ul>
                        <div className="mt-4 text-xs text-blue-100/60">
                            Tip: This space is for you. Short messages are totally okay.
                        </div>
                    </div>
                </aside>

                {/* Chatbox panel */}
                <section className="lg:col-span-9 order-1 lg:order-2">
                    <div className="rounded-2xl bg-white/5 border border-white/10 shadow-xl flex flex-col h-[78vh]">
                        {/* Chatbox header */}
                        <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-400/20 flex items-center justify-center">🫶</div>
                            <div>
                                <div className="font-semibold">Thera</div>
                                <div className="text-xs text-blue-100/70">Compassionate AI listener</div>
                            </div>
                        </div>

                        {/* Messages viewport */}
                        <div ref={viewportRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                            {messages.map((m) => (
                                <div key={m.id}>
                                    <MessageBubble message={m} />
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-white/10">
                            <div className="flex items-end gap-2">
                                <input
                                    className="flex-1 rounded-xl bg-white/10 border border-white/10 px-4 py-3 outline-none placeholder:text-blue-100/50 text-blue-50 focus:ring-2 focus:ring-blue-400/50"
                                    placeholder="Write what’s on your mind…"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={onKeyDown}
                                />
                                <button
                                    onClick={send}
                                    disabled={!canSend}
                                    className="rounded-xl px-4 py-3 bg-blue-500/90 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition border border-white/10"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Subtle radial highlights */}
            <div className="pointer-events-none fixed inset-0 -z-10">
                <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
                <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
            </div>
        </div>
    );
}

function MessageBubble({ message }: { message: Message }) {
    const isUser = message.role === "user";
    return (
        <div className={"flex w-full " + (isUser ? "justify-end" : "justify-start")}>
            <div
                className={[
                    "max-w-[78%] rounded-2xl px-4 py-3 text-sm shadow-lg",
                    isUser
                        ? "bg-blue-500 text-white rounded-br-sm"
                        : "bg-white/10 text-blue-50 border border-white/10 rounded-bl-sm",
                ].join(" ")}
            >
                <div className="whitespace-pre-wrap leading-relaxed">{message.text}</div>
                <div className="mt-1 text-[10px] opacity-70 text-right">{message.time}</div>
            </div>
        </div>
    );
}

export default Chatbox;