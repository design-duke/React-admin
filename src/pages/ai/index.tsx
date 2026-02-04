import React, { useState, useRef } from "react";
import MarkdownIt from "markdown-it";
import DOMPurify from "dompurify";
import { Input, Button } from "antd";

const md = new MarkdownIt({
  linkify: true,
  breaks: true,
});

type Message = {
  role: "user" | "assistant";
  content: string;
};
const { TextArea } = Input;
const AiChat: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  /** 滚动到底部 */
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const renderMarkdown = (text: string) => {
    const html = md.render(text || "");
    return { __html: DOMPurify.sanitize(html) };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    // 用户消息
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);

    setPrompt("");
    setLoading(() => true);

    try {
      const res = await fetch("/dev/ai/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let aiContent = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        aiContent += decoder.decode(value, { stream: true });

        // 🔥 流式更新 assistant 消息
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];

          if (last?.role === "assistant") {
            last.content = aiContent;
          } else {
            copy.push({ role: "assistant", content: aiContent });
          }

          return [...copy];
        });

        scrollToBottom();
      }
    } catch (err) {
      console.error("AI 请求失败", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ 请求失败，请稍后重试" },
      ]);
    } finally {
      console.log("AI 请求结束");
      setLoading(() => false);
      scrollToBottom();
    }
  };

  return (
    <div className="w-full p-4">
      <h2 style={{ marginBottom: 12 }}>千问大模型聊天</h2>

      {/* 消息区 */}
      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 12,
          height: 680,
          overflowY: "auto",
        }}
      >
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              marginBottom: 12,
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "80%",
                padding: "8px 12px",
                borderRadius: 8,
                background: m.role === "user" ? "#dbeafe" : "#fff",
                border: m.role === "assistant" ? "1px solid #eee" : "none",
              }}
              className="markdown-content"
              dangerouslySetInnerHTML={renderMarkdown(m.content)}
            />
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <TextArea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={2}
          placeholder="输入你的问题"
          disabled={loading}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 6,
            border: "1px solid #ccc",
            resize: "none",
          }}
        />
        <Button
          type="primary"
          disabled={loading}
          className="curor-pointer"
          onClick={handleSubmit}
        >
          {loading ? "生成中..." : "发送"}
        </Button>
      </form>
    </div>
  );
};

export default AiChat;
