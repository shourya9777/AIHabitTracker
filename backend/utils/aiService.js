import { GoogleGenAI } from "@google/genai";

let client = null;
const getClient = () =>{
    if(client) return client;
    const key= process.env.GEMINI_API_KEY;
    if(!key)
        return null;
    client = new GoogleGenAI({apiKey: key });
    return client;
};

const MODEL= process.env.GEMINI_MODEL || "gemini-2.5-flash";

export const isAIEnabled = () => !!process.env.GEMINI_API_KEY;

export const parseJSON = (text) => {
    let cleaned = (text || "").trim();
    if(cleaned.startsWith("```json")){
        cleaned= cleaned.replace(/```json\n?/g,"").replace(/```\n?$/g,"");
    } 
    else if(cleaned.startsWith("```")){
        cleaned= cleaned.replace(/```\n?/g,"");
    }
    return JSON.parse(cleaned.trim());
};

export const chatCompletion = async ({
    system,
    user,
    temperature = 0.7,
}) => {
    const c = getClient();

    if (!c) {
        return {
            ok:false,
            content: 
            "AI features are disabled - set GEMINI_API_KEY in the backend .env to enable real AI responses.",
        };
    }
    try{
        const res = await c.models.generateContent({
            model: MODEL,
            contents: user,
            config: {
                systemInstruction: system,
                temperature,
            }
        });
        return { ok:true, content : (res.text || "").trim()};
    }catch(err){
        console.error("AI error: ", err.message);
        return {ok:false, content: "AI request failed. Please try again later."};
    }
};

export const SYSTEM_PROMPTS = {
    weekly: "Generate a 120-180 word personalized weekly habit report using the user's actual habit names and provided data. Cover wins, struggles, meaningful patterns, and end with encouraging guidance for the next week. Use plain prose with line breaks only; do not use markdown headers, bullet points, or other markdown formatting. Base everything strictly on the user's actual data.",

    suggestion: "Suggest one personalized habit based strictly on the user's provided data. Return valid JSON only in exactly this shape: {\"name\":\"string\",\"description\":\"string\",\"frequency\":\"string\",\"category\":\"string\",\"icon\":\"string\",\"reason\":\"string\"}. The category must be exactly one of the valid values: \"Health\", \"Fitness\", \"Learning\", \"Productivity\", \"Mindfulness\", \"Personal\", \"Other\". Do not add extra fields, markdown, explanations, or categories outside the allowed values.",

    recovery: "Help the user recover after missed habits or a broken streak with empathy and encouragement. Begin with a warm, empathetic opening, then provide Day 1, Day 2, and Day 3 sections with exactly one concrete, realistic action for each day, followed by a closing line of encouragement. Use the user's actual habit data and names when provided, avoid judgment or shame, and keep the guidance practical and achievable.",

    chat: "Answer the user's question using only the provided habit data and conversation context. Ground every response in the user's actual habit names, days, streaks, completion percentages, and other provided numbers whenever relevant. Do not invent habits, statistics, progress, or assumptions, and avoid generic advice when specific data is available. Be helpful, clear, and conversational.",

    morning: "Generate a short, energetic morning habit insight of 30-60 words using the user's actual habit names and current streaks. Mention specific habits and relevant streak information from the provided data. Keep the tone warm, motivating, and natural but not cheesy. Use no more than one emoji and avoid generic motivational statements."
};