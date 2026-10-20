import { Fragment, useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send } from 'lucide-react';

// Minimal markdown: ``` code blocks, `inline code`, **bold**, # headings, - bullets, ---
function renderInline(text) {
    return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, i) => {
        if (part.length > 2 && part.startsWith('`') && part.endsWith('`')) {
            return <code key={i} className="px-1 rounded bg-base-300 font-mono text-[0.85em]">{part.slice(1, -1)}</code>;
        }
        if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
    });
}

function MessageText({ text }) {
    return text.split('```').map((segment, i) => {
        if (i % 2 === 1) {
            const nl = segment.indexOf('\n');
            const hasLang = nl > -1 && /^[\w+#-]*$/.test(segment.slice(0, nl).trim());
            const body = (hasLang ? segment.slice(nl + 1) : segment).replace(/\n$/, '');
            return (
                <pre key={i} className="my-2 p-3 rounded bg-black/60 overflow-x-auto text-xs font-mono">
                    <code>{body}</code>
                </pre>
            );
        }
        return (
            <Fragment key={i}>
                {segment.split('\n').map((line, j) => {
                    const heading = line.match(/^#{1,6}\s+(.*)/);
                    if (heading) return <div key={j} className="font-semibold mt-2">{renderInline(heading[1])}</div>;
                    if (/^\s*---+\s*$/.test(line)) return <hr key={j} className="my-2 border-base-300" />;
                    const bullet = line.match(/^\s*[-*]\s+(.*)/);
                    if (bullet) return <div key={j} className="pl-4">• {renderInline(bullet[1])}</div>;
                    return <div key={j} className="min-h-[1em]">{renderInline(line)}</div>;
                })}
            </Fragment>
        );
    });
}

function ChatAi({ problem }) {
    // Only real conversation lives here; the greeting below is just UI.
    const [messages, setMessages] = useState([]);
    const [sending, setSending] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, sending]);

    const onSubmit = async (data) => {
        const userMessage = { role: 'user', parts: [{ text: data.message }] };
        const updated = [...messages, userMessage]; // include the new message in what we send
        setMessages(updated);
        setSending(true);
        reset();

        try {
            const response = await axiosClient.post("/ai/chat", {
                messages: updated,
                title: problem.title,
                description: problem.description,
                testCases: problem.visibleTestCases,
                startCode: problem.startCode
            });

            setMessages(prev => [...prev, { role: 'model', parts: [{ text: response.data.message }] }]);
        } catch (error) {
            console.error("API Error:", error);
            setMessages(prev => [...prev, { role: 'model', parts: [{ text: "Error from AI Chatbot" }] }]);
        } finally {
            setSending(false);
        }
    };

    // Enter sends, Shift+Enter adds a new line (so pasted code keeps its line breaks)
    const onKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!sending) handleSubmit(onSubmit)();
        }
    };

    return (
        <div className="flex flex-col h-screen max-h-[80vh] min-h-[500px]">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="chat chat-start">
                    <div className="chat-bubble bg-base-200 text-base-content">
                        Hi! Ask me for a hint, paste your code for a review, or ask about the approach.
                    </div>
                </div>

                {messages.map((msg, index) => (
                    <div key={index} className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}>
                        <div className="chat-bubble bg-base-200 text-base-content max-w-[90%] break-words">
                            {msg.role === 'user'
                                ? <div className="whitespace-pre-wrap font-mono text-xs">{msg.parts[0].text}</div>
                                : <MessageText text={msg.parts[0].text} />}
                        </div>
                    </div>
                ))}

                {sending && (
                    <div className="chat chat-start">
                        <div className="chat-bubble bg-base-200 text-base-content">
                            <span className="loading loading-dots loading-sm"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="sticky bottom-0 p-4 bg-base-100 border-t">
                <div className="flex items-end">
                    <textarea
                        rows={2}
                        placeholder="Ask me anything (Shift+Enter for a new line)"
                        className="textarea textarea-bordered flex-1 resize-none max-h-40"
                        onKeyDown={onKeyDown}
                        {...register("message", { required: true, minLength: 2 })}
                    />
                    <button
                        type="submit"
                        className="btn btn-ghost ml-2"
                        disabled={errors.message || sending}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ChatAi;