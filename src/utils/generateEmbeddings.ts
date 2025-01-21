require("dotenv").config(); // 🔥 Charge les variables d’environnement depuis `.env`
import { config } from "../config";

export async function getEmbedding(
  text: string,
): Promise<number[] | undefined> {
  console.log(`🚀 Début de la génération d'embeddings pour : "${text}"`);
  let MODEL_URL = config.huggingFace.modelUrl; // ✅ Par défaut, Hugging Face
  let API_KEY = config.huggingFace.apiKey;
  console.log("🔍 Clé API Hugging Face :", process.env.HUGGINGFACE_API_KEY);
  console.log("🔍 Clé API depuis config :", config.huggingFace.apiKey);

  let requestBody: any;

  if (config.embeddingProvider === "openai") {
    console.log("🚀 Utilisation d'OpenAI pour les embeddings");
    MODEL_URL = config.openAI.modelUrl;
    API_KEY = config.openAI.apiKey;
    requestBody = { model: "text-embedding-ada-002", input: text }; // 🔥 Modèle OpenAI
  } else if (config.embeddingProvider === "google") {
    console.log("🚀 Utilisation de Google Generative AI pour les embeddings");
    MODEL_URL = config.googleAI.modelUrl;
    API_KEY = config.googleAI.apiKey;
    requestBody = { content: text }; // 🔥 Format attendu par Google
  } else {
    console.log("🚀 Utilisation de Hugging Face pour les embeddings");
    requestBody = { inputs: text }; // 🔥 Format Hugging Face
  }

  if (!API_KEY) {
    console.error(
      `❌ Erreur : Clé API manquante pour ${config.embeddingProvider}`,
    );
    return;
  }

  const response = await fetch(MODEL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();
  console.log("🔍 Réponse API :", JSON.stringify(data, null, 2));

  if (!Array.isArray(data)) {
    console.error("❌ Erreur : Format de réponse inattendu !");
    return;
  }

  return data; // ✅ Retourne directement les embeddings
}

// Exemple de test avec du texte extrait du PDF
// async function testEmbeddings() {
//   const text = "Exemple de texte extrait d'un PDF"; // Remplace par du vrai texte extrait
//   const embedding = await getEmbedding(text);
//   console.log("✅ Embedding généré :", embedding);
// }

// testEmbeddings();
