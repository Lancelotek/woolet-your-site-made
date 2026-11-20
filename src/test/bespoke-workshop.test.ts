import { describe, expect, it } from "vitest";
import {
  WORKSHOP_TOKEN_RE,
  classifyWorkshopFile,
  customerVisibleFiles,
  defaultShowToCustomer,
  describeFiles,
  newWorkshopToken,
  safeWorkshopFileName,
  workshopUploadUrl,
} from "../../supabase/functions/_shared/bespoke-workshop";

describe("workshop upload files", () => {
  it("classifies the files Warren sends", () => {
    expect(classifyWorkshopFile("Brian West v2.MP4")).toBe("video");
    expect(classifyWorkshopFile("render.mov")).toBe("video");
    expect(classifyWorkshopFile("front.JPG")).toBe("image");
    expect(classifyWorkshopFile("drawing.pdf")).toBe("document");
    expect(classifyWorkshopFile("crown-panto.step")).toBe("cad");
    expect(classifyWorkshopFile("front.dxf")).toBe("cad");
    expect(classifyWorkshopFile("all.zip")).toBe("archive");
    expect(classifyWorkshopFile("run.exe")).toBeNull();
    expect(classifyWorkshopFile("noextension")).toBeNull();
    expect(classifyWorkshopFile("page.html")).toBeNull();
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
