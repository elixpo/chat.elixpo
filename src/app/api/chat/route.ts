import { createOpenAI } from "@ai-sdk/openai";
import { streamText, convertToModelMessages } from "ai";
import {
  POLLINATIONS_API_KEY,
  POLLINATIONS_BASE_URL,
  DEFAULT_MODEL,
} from "@/lib/pollinations";
import {
  saveMessage,
  createConversation,
  getMessages,
  getConversation,
} from "@/lib/chat/db";
import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/get-user";

const pollinations = createOpenAI({
  apiKey: POLLINATIONS_API_KEY,
  baseURL: `${POLLINATIONS_BASE_URL}/v1`,

  headers: {
    Authorization: `Bearer ${POLLINATIONS_API_KEY}`,
  },

  fetch: async (input, init) => {
    console.log("========== SDK REQUEST ==========");
    console.log("URL:", input);
    console.log("HEADERS:", init?.headers);

    if (init?.body) {
      console.log(
        "BODY:",
        typeof init.body === "string" ? init.body : String(init.body),
      );
    }

    console.log("================================");

    return fetch(input, init);
  },
});

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req.headers.get("cookie"));

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const userId = user.id;
  try {
    const body = (await req.json()) as any;

    const { messages, model = DEFAULT_MODEL, id: conversationId } = body;
    if (!messages) {
      return new Response(
        JSON.stringify({
          error: "messages missing from request body",
        }),
        { status: 400 },
      );
    }
    const modelMessages = messages.map((msg: any) => ({
      role: msg.role,
      content:
        msg.content ??
        msg.parts
          ?.filter((p: any) => p.type === "text")
          ?.map((p: any) => p.text)
          ?.join("") ??
        "",
    }));
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      currentConversationId = await createConversation(
        userId,
        "New Chat",
        model,
      );

      console.log("Created new conversation:", currentConversationId);
    }
    if (currentConversationId) {
      const existing = await getConversation(currentConversationId);

      if (!existing) {
        console.log(
          "Conversation does not exist, creating a new one:",
          currentConversationId,
        );

        currentConversationId = await createConversation(
          userId,
          "New Chat",
          model,
        );

        console.log("Created replacement conversation:", currentConversationId);
      }
    }

    const lastMessage = messages[messages.length - 1];

    if (lastMessage?.role === "user") {
      const content =
        lastMessage.content ??
        lastMessage.parts
          ?.filter((p: any) => p.type === "text")
          ?.map((p: any) => p.text)
          ?.join("") ??
        "";
      console.log("Saving message to conversation:", currentConversationId);

      await saveMessage({
        conversationId: currentConversationId,
        role: "user",
        content, // <-- IMPORTANT
        model,
      });
    }

    const systemPrompt = `You are Elixpo Chat, an advanced AI assistant. You are capable of text, voice, and image analysis.
You are powered by Pollinations AI and run on optimized CPU inference.
Be helpful, concise, and do not use emojis unless specifically requested. Keep your design clean.`;

    const response = await fetch(
      "https://gen.pollinations.ai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${POLLINATIONS_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: modelMessages,
          stream: false,
        }),
      },
    );

    const data: any = await response.json();

    if (!response.ok) {
      console.error(data);
      return new Response(JSON.stringify(data), { status: response.status });
    }

    const assistantText = data?.choices?.[0]?.message?.content ?? "No response";

    await saveMessage({
      conversationId: currentConversationId,
      role: "assistant",
      content: assistantText,
      model,
    });

    return new Response(assistantText, {
      headers: {
        "x-conversation-id": currentConversationId,
      },
    });
  } catch (error: any) {
    console.error("API Chat Error:", error);

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req.headers.get("cookie"));

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing id" }), {
      status: 400,
    });
  }

  const conversation = await getConversation(id);

  if (!conversation) {
    return new Response(JSON.stringify({ error: "Conversation not found" }), {
      status: 404,
    });
  }

  if (conversation.user_id !== user.id) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
    });
  }

  const messages = await getMessages(id);

  return new Response(JSON.stringify(messages), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
