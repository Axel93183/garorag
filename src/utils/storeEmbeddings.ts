import { ChromaClient } from "chromadb";
import * as fs from "fs";
import * as path from "path";
import { config } from "../config";
import { extractTextFromPDF } from "./extractPdf";
import { getEmbedding } from "./generateEmbeddings"; // Utilise Hugging Face

const chroma = new ChromaClient({
  path: config.chromaDB.path, // Connexion au serveur Docker
});

// ✅ Fonction d'embedding pour ChromaDB (utilisant Hugging Face)
const huggingFaceEmbeddingFunction = {
  generate: async (texts: string[]) => {
    try {
      return await Promise.all(
        texts.map(async (text) => await getEmbedding(text)),
      );
    } catch (error) {
      console.error("❌ Erreur lors de la génération des embeddings :", error);
      return [];
    }
  },
};

async function storeAllEmbeddings() {
  console.log("📂 Vérification de la collection...");

  let collection;
  try {
    collection = await chroma.getOrCreateCollection({
      name: config.chromaDB.collectionName, // Nom de la collection
      embeddingFunction: huggingFaceEmbeddingFunction, // Embedding avec Hugging Face
    });
    console.log("✅ Collection existante trouvée.");
  } catch (error) {
    console.error("❌ Erreur lors de l'accès à la collection :", error);
    return;
  }

  const dataDirectory = path.resolve(process.cwd(), config.pdfDirectory);

  const pdfFiles = fs
    .readdirSync(dataDirectory, { withFileTypes: true })
    .filter((file) => file.isFile() && file.name.toLowerCase().endsWith(".pdf"))
    .map((file) => ({
      path: path.join(dataDirectory, file.name),
      name: file.name,
      modifiedTime: fs
        .statSync(path.join(dataDirectory, file.name))
        .mtime.getTime(),
    }));

  if (pdfFiles.length === 0) {
    console.log("❌ Aucun fichier PDF trouvé !");
    return;
  }

  console.log(
    `📂 ${pdfFiles.length} fichiers PDF trouvés. Début du traitement...`,
  );

  for (const file of pdfFiles) {
    const filePath = file.path;
    const fileName = path.basename(filePath);
    console.log(`🔍 Traitement de : ${filePath}`);

    const text = await extractTextFromPDF(filePath);
    if (!text.trim()) {
      console.warn(`⚠️ Aucun texte extrait de ${fileName}`);
      continue;
    }

    const embedding = await getEmbedding(text);
    if (!embedding) {
      console.error(`❌ Impossible de générer les embeddings pour ${fileName}`);
      continue;
    }

    // Vérifier si le document existe déjà dans ChromaDB
    const existingDocs = await collection.get({ ids: [fileName] });

    if (existingDocs.documents.length > 0) {
      const storedModifiedTime = existingDocs.metadatas[0]?.modifiedTime || 0;

      if (storedModifiedTime >= file.modifiedTime) {
        console.log(
          `⚠️ Le document ${fileName} n'a pas changé, il ne sera pas mis à jour.`,
        );
        continue; // Ignore ce fichier s'il n'a pas été modifié
      } else {
        console.log(
          `🗑️ Suppression de l'ancienne version de ${fileName} avant mise à jour.`,
        );
        await collection.delete({ ids: [fileName] });
      }
    }

    // Extraire le texte du PDF
    const newText = await extractTextFromPDF(filePath);
    if (!newText.trim()) {
      console.warn(`⚠️ Aucun texte extrait de ${fileName}`);
      continue;
    }

    // Générer les embeddings
    const newEmbedding = await getEmbedding(newText);
    if (!newEmbedding) {
      console.error(`❌ Impossible de générer les embeddings pour ${fileName}`);
      continue;
    }

    // Ajouter le document avec sa date de modification
    await collection.add({
      ids: [fileName],
      embeddings: [newEmbedding],
      metadatas: [{ source: filePath, modifiedTime: file.modifiedTime }],
      documents: [newText],
    });

    console.log(`✅ Embedding stocké pour ${fileName}`);
  }
}

// 🔥 Lancer le traitement
storeAllEmbeddings();
