export const AVIATOR_REFERENCE_URLS = {
  pattern: "https://woolet.co/__l5e/assets-v1/994249af-3c8e-447c-9df2-4641c0eab41e/aviator-reference.jpg",
  front: "https://woolet.co/__l5e/assets-v1/05b14e16-9fd8-40c8-aac8-aa93d27c1b8e/aviator-front.jpg",
  threeQuarter: "https://woolet.co/__l5e/assets-v1/74aaba9a-37e7-4a65-a7c8-dcc641d69fc5/aviator-three-quarter.jpg",
  temples: "https://woolet.co/__l5e/assets-v1/d19b92b7-e19f-4dd7-8e67-a1347512c597/aviator-temples.jpg",
  hardware: "https://woolet.co/__l5e/assets-v1/dad89919-f2a0-445c-82a0-09d96cb84215/aviator-hardware.jpg",
  bridgeDetail: "https://woolet.co/__l5e/assets-v1/2c47d830-7fb6-445d-9f8b-02b16666a5bf/aviator-bridge-detail.jpg",
  angles: "https://woolet.co/__l5e/assets-v1/70f0c285-e3ec-49db-9573-3be1f10ec143/aviator-angles.jpg",
} as const;

export const AVIATOR_CONSTRUCTION_REFERENCES = [
  AVIATOR_REFERENCE_URLS.front,
  AVIATOR_REFERENCE_URLS.threeQuarter,
  AVIATOR_REFERENCE_URLS.temples,
  AVIATOR_REFERENCE_URLS.hardware,
  AVIATOR_REFERENCE_URLS.bridgeDetail,
  AVIATOR_REFERENCE_URLS.angles,
] as const;

export const isAviatorShape = (shape: string | null | undefined): boolean =>
  /aviator/i.test(shape ?? "");
