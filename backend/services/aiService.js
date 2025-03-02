const { OpenAI } = require("openai");
const { PLAYWRIGHT_PROMPT } = require("../prompts");

class AIService {
  async generatePlaywrightCode(apiKey, step, htmlSummary) {
    try {
      const openai = new OpenAI({ apiKey });
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: PLAYWRIGHT_PROMPT },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Current step: "${step}"\nHTML Summary:\n${htmlSummary}`,
              },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.2,
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      throw new Error(`OpenAI API Error: ${error.message}`);
    }
  }
}

module.exports = new AIService();
