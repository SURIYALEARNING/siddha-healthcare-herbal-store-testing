import { describe, it, expect } from "vitest";
import { formatCurrency, formatDate, slugify, truncate } from "../../../utils/format";

describe("formatCurrency", () => {
  it("formats whole number amount correctly", () => {
    expect(formatCurrency(1234)).toBe("₹1,234");
  });

  it("formats decimal amount with two decimal places", () => {
    const result = formatCurrency(1234.56);
    expect(result).toBe("₹1,234.56");
  });

  it("formats zero as ₹0", () => {
    expect(formatCurrency(0)).toBe("₹0");
  });

  it("formats large numbers with commas", () => {
    expect(formatCurrency(100000)).toBe("₹1,00,000");
  });

  it("formats negative amounts", () => {
    const result = formatCurrency(-500);
    expect(result).toBe("₹-500");
  });
});

describe("formatDate", () => {
  it("formats a valid date string", () => {
    const result = formatDate("2024-01-15");
    expect(result).toContain("January");
    expect(result).toContain("15");
    expect(result).toContain("2024");
  });

  it("handles ISO date strings", () => {
    const result = formatDate("2024-06-01T12:00:00.000Z");
    expect(result).toContain("June");
    expect(result).toContain("1");
    expect(result).toContain("2024");
  });

  it("handles invalid date string gracefully", () => {
    const result = formatDate("not-a-date");
    expect(result).toBe("Invalid Date");
  });

  it("handles empty string", () => {
    const result = formatDate("");
    expect(result).toBe("Invalid Date");
  });
});

describe("slugify", () => {
  it("converts text to lowercase slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(slugify("Ayurvedic Oil! @ # $%")).toBe("ayurvedic-oil-");
  });

  it("replaces multiple spaces with single hyphen", () => {
    expect(slugify("a   b")).toBe("a-b");
  });

  it("handles multiple hyphens", () => {
    expect(slugify("a---b")).toBe("a-b");
  });

  it("trims leading and trailing whitespace", () => {
    expect(slugify("  hello world  ")).toBe("-hello-world-");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });

  it("handles strings with only special characters", () => {
    expect(slugify("!@#$%")).toBe("");
  });

  it("preserves numbers", () => {
    expect(slugify("Product 100mg")).toBe("product-100mg");
  });
});

describe("truncate", () => {
  it("returns the original string when shorter than maxLength", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("returns the original string when equal to maxLength", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });

  it("truncates and appends ellipsis when longer than maxLength", () => {
    expect(truncate("hello world", 5)).toBe("hello...");
  });

  it("trims trailing whitespace before ellipsis", () => {
    expect(truncate("hello world foo", 11)).toBe("hello world...");
  });

  it("handles empty string", () => {
    expect(truncate("", 5)).toBe("");
  });

  it("handles very long strings", () => {
    const longStr = "a".repeat(1000);
    const result = truncate(longStr, 10);
    expect(result).toBe("a".repeat(10) + "...");
    expect(result.length).toBe(13);
  });

  it("handles maxLength of 0", () => {
    expect(truncate("hello", 0)).toBe("...");
  });

  it("handles strings with special characters", () => {
    expect(truncate("héllo wörld", 5)).toBe("héllo...");
  });
});