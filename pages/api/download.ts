import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {

    const currentDate = new Date().toISOString().slice(0, 10);
    const currentMinutes = new Date().getMinutes();
    const filename = `output_${currentDate}_${currentMinutes}.xlsx`;

    const filePath = path.join(process.cwd(), "public", "downloads", filename); // Сохраняем файл в папке "public/downloads"

    const fileData = req.body;

    // Записываем обработанный файл на сервер в бинарном формате
    fs.writeFileSync(filePath, fileData, { encoding: "binary" });

    // Отправляем ответ с именем файла, чтобы клиент мог скачать его
    res.status(200).json({ filename });
  } catch (error) {

    console.error("Ошибка при обработке скачивания файла:", error);
    res.status(500).json({ error: "Ошибка при обработке скачивания файла." });
  }
}
