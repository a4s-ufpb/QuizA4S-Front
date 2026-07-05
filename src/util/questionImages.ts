import type { Question } from "../types";

export type ImageSlotKey = "URL" | "IMAGE_1" | "IMAGE_2";

export const ALL_IMAGE_SLOTS: ImageSlotKey[] = ["URL", "IMAGE_1", "IMAGE_2"];

export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
export const MAX_TOTAL_IMAGES_SIZE_BYTES = 4 * 1024 * 1024;
export const MAX_UPLOAD_IMAGES = 2;

export function getQuestionImageBySlot(
  question: Partial<Question>,
  slot: ImageSlotKey
): string | undefined {
  if (slot === "URL") return question.imageUrl || undefined;
  if (slot === "IMAGE_1") return question.imageOneUrl || undefined;
  return question.imageTwoUrl || undefined;
}

/** Monta a lista de imagens (URL + uploads) na ordem definida por `imagesOrder`. */
export function getOrderedQuestionImages(question: Partial<Question>): string[] {
  const orderFromField = (question.imagesOrder ?? "")
    .split(",")
    .map((slot) => slot.trim())
    .filter((slot): slot is ImageSlotKey =>
      ALL_IMAGE_SLOTS.includes(slot as ImageSlotKey)
    );

  const missingSlots = ALL_IMAGE_SLOTS.filter(
    (slot) => !orderFromField.includes(slot)
  );

  return [...orderFromField, ...missingSlots]
    .map((slot) => getQuestionImageBySlot(question, slot))
    .filter((src): src is string => Boolean(src));
}
