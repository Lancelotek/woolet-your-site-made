import { describe, expect, it } from "vitest";
import {
  WORKSHOP_TOKEN_RE,
  classifyWorkshopFile,
  containsHevcMarker,
  customerVisibleFiles,
  defaultShowToCustomer,
  describeFiles,
  isAppleNativeFormat,
  newWorkshopToken,
  safeWorkshopFileName,
  workshopBrief,
  workshopStoredName,
  workshopUploadUrl,
} from "../../supabase/functions/_shared/bespoke-workshop";

describe("workshop upload files", () => {
  it("classifies the files Warren sends", () => {
    expect(classifyWorkshopFile("Brian West v2.MP4")).toBe("video");
    expect(classifyWorkshopFile("render.webm")).toBe("video");
    expect(classifyWorkshopFile("front.JPG")).toBe("image");
    expect(classifyWorkshopFile("drawing.pdf")).toBe("document");
    expect(classifyWorkshopFile("crown-panto.step")).toBe("cad");
    expect(classifyWorkshopFile("front.dxf")).toBe("cad");
    expect(classifyWorkshopFile("all.zip")).toBe("archive");
    expect(classifyWorkshopFile("run.exe")).toBeNull();
    expect(classifyWorkshopFile("noextension")).toBeNull();
    expect(classifyWorkshopFile("page.html")).toBeNull();
  });

  it("refuses native iPhone formats", () => {
    for (const n of ["IMG_0001.HEIC", "photo.heif", "IMG_0002.MOV", "clip.m4v"]) {
      expect(isAppleNativeFormat(n)).toBe(true);
      expect(classifyWorkshopFile(n)).toBeNull();
    }
    expect(isAppleNativeFormat("render.mp4")).toBe(false);
    const enc = (t: string) => new TextEncoder().encode(t);
    expect(containsHevcMarker(enc("....ftypisom....stsd....hvc1...."))).toBe(true);
    expect(containsHevcMarker(enc("....stsd....hev1...."))).toBe(true);
    expect(containsHevcMarker(enc("....ftypisom....stsd....avc1...."))).toBe(false);
  });

  it("puts the order number at the start of every stored name", () => {
    expect(workshopStoredName("WLT-BSP-2026-0010", "render v2.mp4")).toBe("WLT-BSP-2026-0010_render v2.mp4");
    expect(workshopStoredName("WLT-BSP-2026-0010", "wlt-bsp-2026-0010 front.jpg")).toBe("wlt-bsp-2026-0010 front.jpg");
  });

  it("builds the workshop email with the order number everywhere", () => {
    const b = workshopBrief(
      {
        id: "11111111-2222-3333-4444-555555555555",
        case_no: "WLT-BSP-2026-0010",
        frame_name: "Crown Panto",
        front_code: "Classic Honey & Dark Havana (P605 0527)",
        temple_code: "Classic Honey & Dark Havana (P605 0527)",
        reading_strength_mode: "confirm_later",
      },
      "https://woolet.co/en/bespoke/workshop?t=abc",
      { briefUrl: "https://x/brief.pdf", message: "Lens 50.22 x 42.45, bridge 22 at the contact point." },
    );
    expect(b.subject).toContain("WLT-BSP-2026-0010");
    expect(b.heading).toContain("WLT-BSP-2026-0010");
    expect(b.rows[0]).toEqual({ label: "Order", value: "WLT-BSP-2026-0010" });
    expect(b.ctaLabel).toContain("WLT-BSP-2026-0010");
    expect(b.text).toContain("Upload link for WLT-BSP-2026-0010: https://woolet.co/en/bespoke/workshop?t=abc");
    expect(b.text).toContain("Lens 50.22 x 42.45");
    expect(b.text).toContain("No native iPhone formats");
    expect(b.text).toContain("https://x/brief.pdf");
    expect(b.rows.find((r) => r.label === "Reading strength")?.value).toMatch(/to be confirmed/);
    // Without a case number the short id stands in.
    expect(workshopBrief({ id: "abcdef12-0000-0000-0000-000000000000" }, "u").orderRef).toBe("WLT-ABCDEF12");
  });

  it("shows videos, images and drawings to the customer, keeps CAD internal", () => {
    expect(defaultShowToCustomer("video")).toBe(true);
    expect(defaultShowToCustomer("image")).toBe(true);
    expect(defaultShowToCustomer("document")).toBe(true);
    expect(defaultShowToCustomer("cad")).toBe(false);
    expect(defaultShowToCustomer("archive")).toBe(false);
  });

  it("makes storage-safe names and keeps the extension", () => {
    expect(safeWorkshopFileName("Brian West v2 (final).MP4")).toBe("Brian West v2 _final_.MP4");
    expect(safeWorkshopFileName("../../etc/passwd.pdf")).toBe("passwd.pdf");
    expect(safeWorkshopFileName("C:\\Users\\k\\Ώθηση.mov")).toBe("_____.mov");
    expect(safeWorkshopFileName(".mp4")).toBe("file.mp4");
    expect(safeWorkshopFileName(`${"a".repeat(300)}.stl`)).toBe(`${"a".repeat(100)}.stl`);
  });

  it("makes long random tokens", () => {
    const a = newWorkshopToken();
    const b = newWorkshopToken();
    expect(a).not.toBe(b);
    expect(a).toHaveLength(43);
    expect(WORKSHOP_TOKEN_RE.test(a)).toBe(true);
    expect(WORKSHOP_TOKEN_RE.test("short")).toBe(false);
    expect(workshopUploadUrl("https://woolet.co", a)).toBe(`https://woolet.co/en/bespoke/workshop?t=${a}`);
  });

  it("publishes files to the customer only up to the last Model sent", () => {
    const files = [
      { id: "1", kind: "video", show_to_customer: true, created_at: "2026-11-20T10:00:00Z" },
      { id: "2", kind: "cad", show_to_customer: false, created_at: "2026-11-20T10:00:00Z" },
      { id: "3", kind: "image", show_to_customer: true, created_at: "2026-11-20T10:00:00Z", removed_at: "2026-11-20T11:00:00Z" },
      { id: "4", kind: "video", show_to_customer: true, created_at: "2026-11-21T10:00:00Z" },
    ];
    expect(customerVisibleFiles(files, null)).toEqual([]);
    expect(customerVisibleFiles(files, "2026-11-20T16:20:00Z").map((f) => f.id)).toEqual(["1"]);
    expect(customerVisibleFiles(files, "2026-11-21T12:00:00Z").map((f) => f.id)).toEqual(["1", "4"]);
  });

  it("describes a batch in words", () => {
    expect(describeFiles([{ kind: "video" }, { kind: "video" }, { kind: "document" }])).toBe("2 videos, 1 drawing");
    expect(describeFiles([{ kind: "cad" }])).toBe("1 CAD file");
    expect(describeFiles([])).toBe("");
  });
});
