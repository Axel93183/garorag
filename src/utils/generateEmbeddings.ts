require("dotenv").config(); // 🔥 Charge les variables d’environnement depuis `.env`

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY; // 🔥 Récupère la clé API depuis `.env`

const MODEL_URL =
  "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2";

async function getEmbedding(text: string): Promise<number[] | undefined> {
  if (!HUGGINGFACE_API_KEY) {
    console.error("❌ Erreur : Clé API Hugging Face non définie !");
    return;
  }

  const response = await fetch(MODEL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: text }), // ✅ Envoi correct du texte
  });

  const data = await response.json();
  console.log("🔍 Réponse API Hugging Face :", JSON.stringify(data, null, 2));

  // ✅ Correction : Vérifier si la réponse est bien un tableau d'embeddings
  if (!Array.isArray(data)) {
    console.error("❌ Erreur : Format de réponse inattendu !");
    return;
  }

  return data; // ✅ Retourne directement les embeddings
}

// Exemple de test avec du texte extrait du PDF
async function testEmbeddings() {
  const text = "Exemple de texte extrait d'un PDF"; // Remplace par du vrai texte extrait
  const embedding = await getEmbedding(text);
  console.log("✅ Embedding généré :", embedding);
}

testEmbeddings();
