/**
 * Экспорт резюме в настоящий .docx (OOXML).
 *
 * Почему не exportToDocxLazy: он собирает документ через buildDocxDocument,
 * а тот добавляет headers/footers из design-токена. Во всех трёх
 * токенах (classic/minimal/brand) wordmark жёстко равен "Dogovor.expert" и
 * рядом tagline — то есть в документ кандидата уезжала бы шапка нашего сайта
 * с рекламным слоганом. Проверено пробой: в сборке всегда присутствуют
 * word/header1.xml и word/footer1.xml.
 *
 * Поэтому здесь переиспользуются ТОЛЬКО разбор HTML и дизайн-токены
 * (parseHtmlToDocx / getDesign), а Document собирается нами — без
 * headers/footers. Файлы общей библиотеки не меняются.
 */
import { parseHtmlToDocx } from "@/lib/exportDocx";
import { getDesign, type DesignId } from "@/lib/docDesign";
import { saveAs } from "file-saver";

/** Поля страницы A4 в мм. Совпадают с PDF-экспортом резюме. */
const MARGIN_MM = 17;
/** 1 мм → twips (1 twip = 1/1440 дюйма, 1 дюйм = 25.4 мм). */
const mmToTwips = (mm: number) => Math.round((mm / 25.4) * 1440);

/**
 * Собирает .docx из HTML резюме. Возвращает Blob, а не сохраняет файл —
 * так байты можно проверить в тесте (сигнатура ZIP-заголовка PK).
 */
export async function buildResumeDocxBlob(
  html: string,
  design: DesignId = "classic"
): Promise<Blob> {
  const [{ Document, Packer }] = await Promise.all([import("docx")]);
  const tokens = getDesign(design);
  const children = parseHtmlToDocx(html, tokens);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: mmToTwips(MARGIN_MM),
              right: mmToTwips(MARGIN_MM),
              bottom: mmToTwips(MARGIN_MM),
              left: mmToTwips(MARGIN_MM),
            },
          },
        },
        // headers/footers намеренно отсутствуют: документ идёт работодателю.
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

/** Сборка + сохранение на диск под именем filename (без расширения). */
export async function downloadResumeDocx(
  html: string,
  filename: string,
  design: DesignId = "classic"
): Promise<void> {
  const blob = await buildResumeDocxBlob(html, design);
  saveAs(blob, `${filename}.docx`);
}
