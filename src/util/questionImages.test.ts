import { describe, it, expect } from "vitest";
import { getOrderedQuestionImages, getQuestionImageBySlot } from "./questionImages";
import type { Question } from "../types";

describe("getOrderedQuestionImages", () => {
  it("retorna vazio quando não há imagens", () => {
    expect(getOrderedQuestionImages({})).toEqual([]);
  });

  it("respeita a ordem definida em imagesOrder", () => {
    const question: Partial<Question> = {
      imageUrl: "url.png",
      imageOneUrl: "one.png",
      imageTwoUrl: "two.png",
      imagesOrder: "IMAGE_1,URL,IMAGE_2",
    };
    expect(getOrderedQuestionImages(question)).toEqual(["one.png", "url.png", "two.png"]);
  });

  it("acrescenta slots ausentes de imagesOrder ao final (na ordem padrão)", () => {
    const question: Partial<Question> = {
      imageUrl: "url.png",
      imageOneUrl: "one.png",
      imagesOrder: "IMAGE_1", // só menciona IMAGE_1
    };
    // IMAGE_1 primeiro (da ordem) e depois URL (slot ausente); IMAGE_2 não existe.
    expect(getOrderedQuestionImages(question)).toEqual(["one.png", "url.png"]);
  });

  it("ignora imagens vazias/ausentes", () => {
    const question: Partial<Question> = {
      imageUrl: "url.png",
      imageOneUrl: "",
      imagesOrder: "URL,IMAGE_1",
    };
    expect(getOrderedQuestionImages(question)).toEqual(["url.png"]);
  });
});

describe("getQuestionImageBySlot", () => {
  it("mapeia cada slot para o campo correto", () => {
    const question: Partial<Question> = {
      imageUrl: "a",
      imageOneUrl: "b",
      imageTwoUrl: "c",
    };
    expect(getQuestionImageBySlot(question, "URL")).toBe("a");
    expect(getQuestionImageBySlot(question, "IMAGE_1")).toBe("b");
    expect(getQuestionImageBySlot(question, "IMAGE_2")).toBe("c");
  });
});
