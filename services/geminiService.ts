import { GoogleGenAI } from "@google/genai";
import { Document, Project } from "../types";

// NOTE: in a real production app, this would likely be a backend call to protect the API key.
// Since this is a client-side MVP, we assume the environment variable is available.
const apiKey = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey });

export const askUCOAssistant = async (
  question: string,
  contextDocs: Document[],
  contextProjects: Project[]
): Promise<string> => {
  if (!apiKey) {
    return "La API Key de Gemini no está configurada. Por favor configura process.env.API_KEY.";
  }

  try {
    // Construct a context-aware prompt
    const docSummary = contextDocs.map(d => 
      `- [${d.status}] ${d.title} (Proyecto: ${contextProjects.find(p => p.id === d.projectId)?.name}, Vence: ${d.dueDate})`
    ).join('\n');

    const systemInstruction = `
      Eres el asistente virtual de la Dirección de Proyectos de la Universidad Católica de Oriente (UCO).
      Tu tono es profesional, amable y eficiente.
      Tienes acceso a los metadatos de los documentos y proyectos actuales.
      Ayuda al usuario a encontrar información, resumir estados o detectar vencimientos.
      
      Datos actuales:
      ${docSummary}
    `;

    const model = 'gemini-2.5-flash';
    
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [{ text: question }]
        }
      ],
      config: {
        systemInstruction,
        temperature: 0.3, // Low temperature for factual accuracy regarding the list
      }
    });

    return response.text || "No pude generar una respuesta.";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Lo siento, hubo un error al consultar con el asistente inteligente.";
  }
};