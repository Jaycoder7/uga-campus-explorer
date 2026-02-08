// backend/services/geminiService.js
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

/**
 * Generate a magical story based on user preferences
 */
export async function generateStory({ name, location, mood, length }) {
  const twistIdeas = [
    "finds a hidden portal to another world",
    "befriends a talking dragon",
    "discovers a magical potion that grants wishes"
  ];
  const twist = twistIdeas[Math.floor(Math.random() * twistIdeas.length)];

const prompt = `
Write a magical and adventurous story set on the University of Georgia campus for a student named ${name}. 
Today's location is: ${location}. 
In this story, something unusual or challenging has happened at this location—a problem, mystery, or magical obstacle—and ${name} must save the day. 
Describe the location in a fantastical but recognizable way. Include suspense, excitement, and imaginative elements, but ensure it remains clear to someone familiar with UGA. 
The story should be interactive-feeling, making the reader feel like they are participating in the adventure. 
Keep the story ${length} words long, and maintain an inspiring, playful, and heroic tone.
`;


  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate story");
  }
}
