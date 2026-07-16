import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `You are "Siddhar Agathiyar AI Counselor", an elite, trustworthy, traditional Siddha healthcare consultant. You represent an ancient system of organic Indian healing (Siddha Medicine/Ayush).
Your role is to guide people seeking natural medicine and organic herbal products.
Provide rich historical backgrounds from Tamil Siddhar literature if relevant, and answer questions detailedly about traditional ingredients (Kabasura Kudineer, Amukkara Chooranam, Nalangu Maavu, Bhringraj hair oil, Inji Chooranam).
Recommend relevant catalog products when mentioned by the user - relate your suggestions to our inventory categories: [Immunity Boosters, Digestive Care, Skin Care, Hair Care].
CRITICAL RULE: Always format output in elegant Markdown. Include a tiny friendly professional medical disclaimer at the bottom of every message: '*Disclaimer: Siddha AI insights are instructional. For acute ailments, please book a personal web consultation with our certified BSMS doctor*'.`;

export function getFallbackResponse(query) {
  const q = query.toLowerCase();

  if (q.includes("immunity") || q.includes("fever") || q.includes("kabasura") || q.includes("covid") || q.includes("cough")) {
    return `**Immunity & Respiratory Health (Kabasura Kudineer & Thuthuvalai Chooranam)**

In Siddha tradition, Kabasura Kudineer is the preeminent formulation to combat respiratory issues and activate vital defenses (Khabam balancing). It consists of 15 divine dry herbs.
- **Remedy**: Boil 5g of Kabasura Kudineer Coarse Powder in 240ml of water until it evaporates to 60ml. Drink warm.
- **Product Suggestion**: You can purchase our *Premium Kabasura Kudineer Coarse Powder* in the store!
- **Siddha Advice**: Please avoid cold-refrigerated drinks, milk-sweets, and sleep early.

*Disclaimer: Traditional Siddha advice is for wellness support and does not substitute professional medical guidance.*`;
  }

  if (q.includes("sleep") || q.includes("insomnia") || q.includes("stress") || q.includes("anxiety") || q.includes("amukkara")) {
    return `**Nervous Calm & Stress Management (Amukkara - Siddha Ashwagandha)**

Amukkara Chooranam is celebrated as a 'Karpam' (rejuvenator) in Siddha. It relaxes deep neurological pathways, balances Vatham (wind energy), and aids muscle growth.
- **Remedy**: Consuming 1-2 tablets of Amukkara with cozy warm milk or pure honey before bedtime restores normal sleep architectures.
- **Product Suggestion**: Search our *Amukkara Chooranam Tablets* for genuine quality.
- **Daily Practice**: Massage soles of feet with warm sesame oil before sleeping.

*Disclaimer: Traditional Siddha advice is for wellness support and does not substitute professional medical guidance.*`;
  }

  if (q.includes("digest") || q.includes("gas") || q.includes("bloat") || q.includes("stomach") || q.includes("constip")) {
    return `**Gastric Integrity & Smooth Digestion (Inji Chooranam & Herbo-digestive aids)**

Siddha asserts that sluggish digestive fire (*Mandham*) breeds toxins (*Amam*).
- **Remedy**: Dry ginger formulation Inji Chooranam taken with hot water immediately clears post-meal bloating and stomach flatulence.
- **Product Suggestion**: Buy our *Traditional Inji Chooranam Digestive Powder* from our categories.
- **Practice**: Sip warm cumin-seed infused water throughout the day. Avoid eating fruits at night.

*Disclaimer: Traditional Siddha advice is for wellness support and does not substitute professional medical guidance.*`;
  }

  if (q.includes("hair") || q.includes("dandruff") || q.includes("bhringraj") || q.includes("bald")) {
    return `**Lush Hair Growth & Scalp Detox (Bhringraj & Vetiver Cooling)**

Excess body thermal index ('Pitham') dries locks and destabilizes root nutrition.
- **Remedy**: Massage cooling Karisalankanni (Bhringraj) and Vetiver oil deep into the skull hair pads.
- **Product Suggestion**: Try our *Bhringraj & Vetiver Cooling Herbal Hair Oil* which contains pure floating vetiver root.
- **Advice**: Wash with hibiscus leaves or shikakai instead of sulfate chemical washes.

*Disclaimer: Traditional Siddha advice is for wellness support and does not substitute professional medical guidance.*`;
  }

  if (q.includes("skin") || q.includes("acne") || q.includes("glow") || q.includes("sandal") || q.includes("turmeric")) {
    return `**Eczema & Glowing Skincare (Golden Nalangu Maavu Scrub)**

Siddha skincare is built upon purifying blood (*Ratham*) and treating the body's envelope naturally.
- **Remedy**: Apply Kasthuri Manjal (wild turmeric) and Vetiver paste. It acts as an organic anti-microbial shield.
- **Product Suggestion**: Use our *Golden Glow Nalangu Maavu Herbal Bath Powder* instead of normal soap.

*Disclaimer: Traditional Siddha advice is for wellness support and does not substitute professional medical guidance.*`;
  }

  return `**Greeting from Ayush Siddha Wellness Center!** 

I am your traditional AI Siddha Wellness Doctor trained on the holy teachings of Sage Agathiyar and the Pathinen Siddhargal (18 Siddhar Masters). 

You can ask me questions about:
1. **Immunity Booster Herbs** (like Kabasura Kudineer & Amukkara/Ashwagandha)
2. **Skin & Face Complexion** (Nalangu Maavu benefits)
3. **Digestive Sluggishness** (Inji Chooranam recipes)
4. **Hair Fall & Nervous Debility** (Karisalankanni & Vetiver)

*How can I help you restore your life's three-vital-humors (Vatham, Pitham, Kabham) today?*

*Disclaimer: AI consultations are strictly educational. If you have severe symptoms, please book an online appointment with our chief MS/BSMS doctor.*`;
}

export async function getGeminiResponse(message, chatHistory) {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  const chat = ai.chats.create({
    model: "gemini-3.5-flash",
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.7,
    }
  });

  const fullHistoryStr = (chatHistory || []).map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join("\n");
  const userMessage = `${fullHistoryStr}\nUser: ${message}`;

  const response = await chat.sendMessage({
    message: userMessage
  });

  return response.text;
}
