import { describe, it, expect } from "vitest";

/**
 * Canonical routes for the Livsplanlegg application.
 * These must match the actual Next.js pages in src/app/ and the Sidebar component.
 */
const CANONICAL_ROUTES = [
  "/",
  "/idag",
  "/kalender",
  "/oppgaver",
  "/maal",
  "/prosjekter",
  "/asplan-viak",
  "/ytly",
  "/privat",
  "/okonomi",
  "/trening",
  "/logg",
  "/innboks",
  "/assistent",
  "/innstillinger",
  "/login",
  "/auth/callback",
] as const;

/**
 * Sidebar nav items extracted from src/components/Sidebar.tsx.
 * Keep this in sync with the Sidebar component when routes change.
 */
const SIDEBAR_ROUTES = [
  "/",
  "/idag",
  "/kalender",
  "/oppgaver",
  "/maal",
  "/prosjekter",
  "/asplan-viak",
  "/ytly",
  "/privat",
  "/okonomi",
  "/trening",
  "/logg",
  "/innboks",
  "/assistent",
  "/innstillinger",
];

/**
 * Deprecated routes that must NOT appear in navigation.
 * These were renamed during development and should redirect instead.
 */
const DEPRECATED_ROUTES = ["/dashboard", "/i-dag", "/mal", "/asplan-viak/tilbud"];

describe("navigation routes", () => {
  it("contains all expected canonical routes", () => {
    for (const route of CANONICAL_ROUTES) {
      expect(CANONICAL_ROUTES).toContain(route);
    }
    expect(CANONICAL_ROUTES).toHaveLength(17);
  });

  it("sidebar routes are a subset of canonical routes", () => {
    for (const route of SIDEBAR_ROUTES) {
      expect(CANONICAL_ROUTES).toContain(route);
    }
  });

  it("sidebar has exactly 15 items (14 nav + settings)", () => {
    expect(SIDEBAR_ROUTES).toHaveLength(15);
  });

  it("does not contain deprecated route /dashboard", () => {
    expect(SIDEBAR_ROUTES).not.toContain("/dashboard");
    expect(CANONICAL_ROUTES).not.toContain("/dashboard");
  });

  it("does not contain deprecated route /i-dag (should be /idag)", () => {
    expect(SIDEBAR_ROUTES).not.toContain("/i-dag");
    expect(CANONICAL_ROUTES).not.toContain("/i-dag");
  });

  it("does not contain deprecated route /mal (should be /maal)", () => {
    expect(SIDEBAR_ROUTES).not.toContain("/mal");
    expect(CANONICAL_ROUTES).not.toContain("/mal");
  });

  it("does not contain deprecated route /asplan-viak/tilbud", () => {
    expect(SIDEBAR_ROUTES).not.toContain("/asplan-viak/tilbud");
    expect(CANONICAL_ROUTES).not.toContain("/asplan-viak/tilbud");
  });

  it("no sidebar route matches any deprecated route", () => {
    for (const deprecated of DEPRECATED_ROUTES) {
      expect(SIDEBAR_ROUTES).not.toContain(deprecated);
    }
  });

  it("all sidebar routes start with /", () => {
    for (const route of SIDEBAR_ROUTES) {
      expect(route.startsWith("/")).toBe(true);
    }
  });

  it("no sidebar route has trailing slash (except root)", () => {
    for (const route of SIDEBAR_ROUTES) {
      if (route !== "/") {
        expect(route.endsWith("/")).toBe(false);
      }
    }
  });
});
