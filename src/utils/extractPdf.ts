import * as fs from "fs";
import * as path from "path";
import { config } from "../config"; // 🔥 Import depuis config.ts

const pdfDirectory = path.resolve(process.cwd(), config.pdfDirectory);

export async function extractTextFromPDF(pdfPath: string): Promise<string> {
  console.log("📜 Lecture du fichier :", pdfPath);

  if (!fs.existsSync(pdfPath)) {
    console.error("❌ Erreur : Le fichier PDF n'existe pas :", pdfPath);
    return "";
  }

  const buffer = fs.readFileSync(pdfPath);
  const data = await require("pdf-parse")(buffer);
  return data.text;
}

// 🔥 Lire uniquement les fichiers PDF dans `config.pdfDirectory`
async function processAllPDFs() {
  if (!fs.existsSync(pdfDirectory)) {
    console.log("❌ Le dossier PDF n'existe pas :", pdfDirectory);
    return;
  }

  const files: string[] = fs.readdirSync(pdfDirectory);
  const pdfFiles: string[] = files.filter((file: string) =>
    file.toLowerCase().endsWith(".pdf"),
  );

  if (pdfFiles.length === 0) {
    console.log("❌ Aucun fichier PDF trouvé dans", pdfDirectory);
    return;
  }

  console.log(
    `📂 Trouvé ${pdfFiles.length} fichiers PDF. Début du traitement...`,
  );

  for (const file of pdfFiles) {
    const filePath: string = path.join(pdfDirectory, file);
    const text: string = await extractTextFromPDF(filePath);
    console.log(`✅ Texte extrait de ${file} :\n${text.substring(0, 500)}\n`);
  }
}

// Exécuter l'extraction pour tous les PDF dans `config.pdfDirectory`
processAllPDFs();
