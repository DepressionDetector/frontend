import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import bgImage from "../Assets/bgI.png";
import {
  ClassifierResult,
  getClassifierResult,
  savePHQ9LevelResult,
  getDepressionLevel,
} from "../services/DetectionService";
import { AuthContext, Message } from "../context/AuthContext";
import {
  createNewSession,
  fetchAllSummaries,
  fetchChatHistory,
  saveMessage,
} from "../services/ChatMessageService";
import { getCurrentTime } from "../helpers/Time";
import { savePHQ9Answer, fetchAllPHQ9Answers } from "../services/Phq9Service";
import { chatBotService } from "../services/ChatBotService";

/** badge colors for centered card */
const levelColor = (lvl?: string) => {
  switch ((lvl || "").toLowerCase()) {
    case "minimal":
      return "bg-green-500";
    case "mild":
      return "bg-yellow-400";
    case "moderate":
      return "bg-orange-400";
    case "moderately severe":
      return "bg-red-500";
    case "severe":
      return "bg-red-600";
    default:
      return "bg-slate-400";
  }
};
const levelTextColor = (lvl?: string) => {
  switch ((lvl || "").toLowerCase()) {
    case "minimal":
      return "text-green-700";
    case "mild":
      return "text-yellow-700";
    case "moderate":
      return "text-orange-700";
    case "moderately severe":
      return "text-red-700";
    case "severe":
      return "text-red-700";
    default:
      return "text-slate-600";
  }
};
const defaultMessage: Message = {
  sender: "popo",
  text: "Hi there. How are you feeling today?",
  time: getCurrentTime(),
};

const Chatbox = () => {
  const [input, setInput] = useState("");
  const viewportRef = useRef<HTMLDivElement>(null);
  const { sessionID, setSessionID, setMessages, setChatHistory, messages } =
    useContext(AuthContext);

  const [sessionSummaries, setSessionSummaries] = useState<string[]>([]);
  const [classifier, setClassifier] = useState<ClassifierResult | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastPhq9, setLastPhq9] = useState<{
    id: number;
    question: string;
  } | null>(null);
  const [askedPhq9Ids, setAskedPhq9Ids] = useState<number[]>([]);
  const [isPhq9, setIsPhq9] = useState(false);
  const [levelResult, setLevelResult] = useState<any>(null); // if you use getDepressionLevel
  const [levelOpen, setLevelOpen] = useState(false); // if you use getDepressionLevel modal
  const [showLevelCard, setShowLevelCard] = useState(false); // CENTERED CARD VISIBILITY

  useEffect(() => {
    (async () => {
      const session = await createNewSession();
      setSessionID(session);

      const allSummaries = await fetchAllSummaries();
      setSessionSummaries(allSummaries);
    })();
  }, [setSessionID]);

  useEffect(() => {
    viewportRef.current?.scrollTo({
      top: viewportRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  const canSend = useMemo(() => input.trim().length > 0, [input]);

  const send = async () => {
    if (!canSend) return;

    const userMsg: Message = {
      sender: "user",
      text: input.trim(),
      time: getCurrentTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    await saveMessage(input, sessionID, "user");

    if (lastPhq9) {
      await savePHQ9Answer(sessionID, lastPhq9.id, lastPhq9.question, input);
      setLastPhq9(null);
      setIsPhq9(false);
    }

    setInput("");

    const updatedHistory = await fetchChatHistory(sessionID);
    const formattedHistory = Array.isArray(updatedHistory)
      ? updatedHistory.map((msg: any) => ({
          sender: msg.sender,
          text: msg.message,
          time: getCurrentTime(),
        }))
      : [];

    const context = formattedHistory
      .map((m) => `${m.sender}: ${m.text}`)
      .join("\n");

    // use the *current* input you just sent
    const botReply = await chatBotService(
      context,
      userMsg.text,
      sessionSummaries,
      askedPhq9Ids
    );

    const finalBotMsg: Message = {
      sender: "bot",
      text: botReply.response,
      time: getCurrentTime(),
    };

    if (
      typeof botReply.phq9_questionID === "number" &&
      typeof botReply.phq9_question === "string"
    ) {
      const questionID = botReply.phq9_questionID as number;
      const question = botReply.phq9_question as string;

      setAskedPhq9Ids((prev) => [...prev, questionID]);
      setLastPhq9({ id: questionID, question });
      setIsPhq9(true);
    }

    await saveMessage(finalBotMsg.text, sessionID, "bot");

    const finalMessages = [...formattedHistory, finalBotMsg];
    setMessages(finalMessages);
    setChatHistory(finalMessages);
    setLoading(false);
  };

  const handlePhqAnswer = async (answer: string) => {
    if (!lastPhq9) return;
    setIsPhq9(false);
    setLoading(true);

    await savePHQ9Answer(sessionID, lastPhq9.id, lastPhq9.question, answer);
    setLastPhq9(null);

    await saveMessage(answer, sessionID, "user");

    const updatedHistory = await fetchChatHistory(sessionID);
    const formattedHistory = Array.isArray(updatedHistory)
      ? updatedHistory.map((msg: any) => ({
          sender: msg.sender,
          text: msg.message,
          time: getCurrentTime(),
        }))
      : [];

    const context = formattedHistory
      .map((m) => `${m.sender}: ${m.text}`)
      .join("\n");

    const botReply = await chatBotService(
      context,
      answer,
      sessionSummaries,
      askedPhq9Ids
    );
    const finalBotMsg: Message = {
      sender: "bot",
      text: botReply.response,
      time: getCurrentTime(),
    };

    if (
      typeof botReply.phq9_questionID === "number" &&
      typeof botReply.phq9_question === "string"
    ) {
      const questionID = botReply.phq9_questionID as number;
      const question = botReply.phq9_question as string;

      setAskedPhq9Ids((prev) => [...prev, questionID]);
      setLastPhq9({ id: questionID, question });
      setIsPhq9(true);
    }

    await saveMessage(finalBotMsg.text, sessionID, "bot");

    const finalMessages = [...formattedHistory, finalBotMsg];
    setMessages(finalMessages);
    setChatHistory(finalMessages);
    setLoading(false);
  };

  async function ClassifierResult() {
    if (!sessionID) return;
    setDetecting(true);
    try {
      const phq9Raw = await fetchAllPHQ9Answers();

      // normalize to array
      const records: any[] = Array.isArray(phq9Raw)
        ? phq9Raw
        : Array.isArray(phq9Raw?.answers)
        ? phq9Raw.answers
        : Array.isArray(phq9Raw?.data)
        ? phq9Raw.data
        : Array.isArray(phq9Raw?.result)
        ? phq9Raw.result
        : [];

      // sort by question id
      records.sort(
        (a, b) =>
          Number(a.questionID ?? a.questionId ?? a.question_id ?? 0) -
          Number(b.questionID ?? b.questionId ?? b.question_id ?? 0)
      );

      // numbered strings "1. <answer>"
      const phq9Answers = records.map((item: any) => {
        const qid =
          Number(item.questionID ?? item.questionId ?? item.question_id ?? 0) ||
          0;
        const ans = String(item.answer ?? "").trim();
        return `${qid}. ${ans}`;
      });

      const res = await getClassifierResult(phq9Answers);
      console.log("i",res)
      setClassifier(res);

      // persist (optional)
      await savePHQ9LevelResult(Number(sessionID), res);

      // open the CENTERED CARD
      setShowLevelCard(true);
    } catch (e) {
      console.error("getClassifierResult failed:", e);
    } finally {
      setDetecting(false);
    }
  }

  async function runLevelDetection() {
    try {
      await ClassifierResult();
      const resp = await getDepressionLevel();
      if (!resp?.success) throw new Error("level API failed");
      setLevelResult(resp.data);
      setLevelOpen(true);
    } catch (e) {
      console.error(e);
    }
  }

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
                onClick={async () => {
                  // Reset messages to default
                  setMessages([defaultMessage]);
                  setChatHistory([]);
                  setAskedPhq9Ids([]);
                  setLastPhq9(null);
                  setIsPhq9(false);
                  setLevelResult(null);

                  // Create a new session
                  const newSession = await createNewSession();
                  setSessionID(newSession);

                  // Fetch summaries again
                  const allSummaries = await fetchAllSummaries();
                  setSessionSummaries(allSummaries);
                }}
                className="w-full rounded-2xl px-4 py-2 bg-white/80 neo-in text-sm font-medium hover:translate-y-[1px] transition"
              >
                ➕ New Chat
              </button>

              <button
                onClick={() => ClassifierResult()}
                disabled={detecting}
                className="w-full rounded-2xl px-4 py-2 bg-red-200/80 text-red-800 font-medium neo-out text-sm hover:translate-y-[1px] transition disabled:opacity-60"
              >
                ⏹ Level Detection
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
                <MessageBubble key={m.time + m.text} message={m} />
              ))}
              {loading && (
                <div className="flex w-full justify-start">
                  <div className="flex items-end gap-2 flex-row">
                    <div className="h-9 w-9 rounded-full bg-white/90 neo-in flex items-center justify-center overflow-hidden">
                      <span className="text-sm">😊</span>
                    </div>
                    <div className="px-5 py-3 rounded-3xl bg-white/90 text-slate-700 text-sm max-w-[75%] neo-in flex items-center gap-2">
                      <span className="animate-think font-medium">
                        Thinking
                      </span>
                      <span className="dots flex gap-1">
                        <span className="dot animate-dot delay-0">.</span>
                        <span className="dot animate-dot delay-200">.</span>
                        <span className="dot animate-dot delay-400">.</span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
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

      {/* CENTERED OVERLAY CARD */}
      {showLevelCard && classifier && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowLevelCard(false)} // click backdrop to close
        >
          <div
            className="w-full max-w-md rounded-3xl p-6 bg-white/95 neo-in shadow-lg"
            onClick={(e) => e.stopPropagation()} // prevent close when clicking card
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Depression Level</div>
              <button
                onClick={() => setShowLevelCard(false)}
                className="text-xs opacity-60 hover:opacity-100"
                aria-label="Close level card"
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2 justify-center">
              <span
                className={`text-2xl font-bold ${levelTextColor(
                  classifier.level
                )}`}
              >
                {classifier.level}
              </span>
              <span
                className={`inline-block h-3 w-3 rounded-full ${levelColor(
                  classifier.level
                )}`}
              />
            </div>

            <div className="mt-3 text-center text-sm">
              PHQ-9 Score:&nbsp;
              <span className="font-semibold">{classifier.phq9_score}</span>
              <span className="opacity-60"> / 27</span>
            </div>

            <div className="mt-4 h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${levelColor(classifier.level)}`}
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(100, (classifier.phq9_score / 27) * 100)
                  )}%`,
                }}
              />
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => setShowLevelCard(false)}
                className="rounded-full px-6 py-2 text-sm font-semibold
               bg-gradient-to-r from-pink-300 via-red-300 to-orange-300
               text-white shadow-lg hover:shadow-xl hover:scale-105
               transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.sender === "user";
  return (
    <div
      className={"flex w-full " + (isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={"flex items-end gap-2 " + (isUser ? "flex-row" : "flex-row")}
      >
        {/* Bot avatar */}
        {!isUser && (
          <div className="h-9 w-9 rounded-full bg-white/90 neo-in flex items-center justify-center overflow-hidden">
            <span className="text-sm">😊</span>
          </div>
        )}

        {/* Bubble */}
        <div
          className={[
            "px-5 py-3 rounded-3xl relative",
            "text-sm leading-relaxed",
            isUser
              ? "bg-[#9fdde2]/90 text-slate-700 bubble-tail-right neo-out"
              : "bg-white/90 text-slate-700 bubble-tail-left neo-in",
          ].join(" ")}
        >
          <div className="flex items-start gap-2">
            <span className="flex-1 whitespace-pre-wrap">{message.text}</span>
          </div>
          <div className="mt-1 text-[10px] opacity-60 text-right">
            {message.time}
          </div>
        </div>

        {/* User heart avatar */}
        {isUser && (
          <div className="h-9 w-9 rounded-full bg-white/90 neo-in flex items-center justify-center overflow-hidden">
            <span className="text-sm">❤️</span>
          </div>
        )}
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
