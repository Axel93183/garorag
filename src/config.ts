require("dotenv").config();

export const config = {
  pdfDirectory: "data/PDF", // 📂 Dossier où sont stockés les PDF

  embeddingProvider: "huggingface", // Choix entre "huggingface", "openai", "google" ...

  chromaDB: {
    collectionName: "documents",
    path: "http://localhost:8000",
  },

  huggingFace: {
    apiKey: process.env.HUGGINGFACE_API_KEY || "",
    modelUrl:
      "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
  },

  // 🔒 Configuration OpenAI (Désactivé par défaut)
  openAI: {
    apiKey: process.env.OPENAI_API_KEY || "",
    modelUrl: "https://api.openai.com/v1/embeddings", // ⬅️ Modèle OpenAI
  },

  // 🔒 Configuration Google Generative AI (Désactivé par défaut)
  googleAI: {
    apiKey: process.env.GOOGLE_API_KEY || "",
    modelUrl:
      "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-001:embedText", // ⬅️ Modèle Google
  },
};
