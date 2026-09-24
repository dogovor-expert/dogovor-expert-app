import { describe, it, expect } from "vitest";
import { BLOG_POSTS } from "@/data/blog/posts";
import { LEGAL_TEMPLATES } from "@/data/templates";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/blog";

const templateIds = new Set(LEGAL_TEMPLATES.map((t) => t.id));
const slugSet = new Set(BLOG_POSTS.map((p) => p.slug));

describe("blog: целостность и SEO", () => {
  it("slug уникальны", () => {
    const seen = new Set<string>();
    const dups: string[] = [];
    for (const p of BLOG_POSTS) {
      if (seen.has(p.slug)) dups.push(p.slug);
      seen.add(p.slug);
    }
    expect(dups).toEqual([]);
  });

  it("заголовки уникальны", () => {
    const seen = new Set<string>();
    const dups: string[] = [];
    for (const p of BLOG_POSTS) {
      if (seen.has(p.title)) dups.push(p.title);
      seen.add(p.title);
    }
    expect(dups).toEqual([]);
  });

  it("категории зарегистрированы в CATEGORY_LABELS и CATEGORY_ORDER", () => {
    const bad = BLOG_POSTS.filter(
      (p) => !CATEGORY_LABELS[p.category] || !CATEGORY_ORDER.includes(p.category)
    ).map((p) => `${p.slug}:${p.category}`);
    expect(bad).toEqual([]);
  });

  it("relatedDocs ссылаются на существующие шаблоны", () => {
    const bad: string[] = [];
    for (const p of BLOG_POSTS) {
      for (const id of p.relatedDocs) if (!templateIds.has(id)) bad.push(`${p.slug}->${id}`);
    }
    expect(bad).toEqual([]);
  });

  it("relatedPosts ссылаются на существующие статьи и не ссылаются на себя", () => {
    const bad: string[] = [];
    for (const p of BLOG_POSTS) {
      for (const s of p.relatedPosts ?? []) {
        if (!slugSet.has(s)) bad.push(`${p.slug}->${s}`);
        if (s === p.slug) bad.push(`${p.slug}->self`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("структура: не менее 5 разделов и 5 вопросов FAQ в каждой статье", () => {
    const bad: string[] = [];
    for (const p of BLOG_POSTS) {
      if (p.sections.length < 5) bad.push(`${p.slug}:sections=${p.sections.length}`);
      if (p.faq.length < 5) bad.push(`${p.slug}:faq=${p.faq.length}`);
    }
    expect(bad).toEqual([]);
  });

  it("SEO-длины: metaTitle ≤ 70, description ≤ 200", () => {
    const bad: string[] = [];
    for (const p of BLOG_POSTS) {
      if (p.metaTitle.length > 70) bad.push(`${p.slug}:metaTitle=${p.metaTitle.length}`);
      if (p.description.length > 200) bad.push(`${p.slug}:desc=${p.description.length}`);
    }
    expect(bad).toEqual([]);
  });

  it("каждая статья имеет дату и updatedAt в формате ISO", () => {
    const iso = /^\d{4}-\d{2}-\d{2}$/;
    const bad = BLOG_POSTS.filter((p) => !iso.test(p.date) || !iso.test(p.updatedAt)).map((p) => p.slug);
    expect(bad).toEqual([]);
  });
});