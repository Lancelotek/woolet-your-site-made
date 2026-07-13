import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const INK = "#080807";
const CREAM = "#EDE7D9";
const GOLD = "#CAA449";
const DIM_GOLD = "#8A6E2C";

const captions = [
  { at: [0.0, 0.2], text: "Closed, it says one thing.", gold: false },
  { at: [0.2, 0.55], text: "Open, it says the rest.", gold: false },
  { at: [0.55, 0.8], text: "MADE FOR WIDE FACES.", gold: true },
  { at: [0.8, 1.0], text: "158 mm. The number the rest of the industry skipped.", gold: false },
] as const;

const smoothstep = (p: number) => {
  const k = Math.min(Math.max(p, 0), 1);
  return k * k * (3 - 2 * k);
};

const prefersReducedMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// ---------- Texture helpers ----------
const loadTextureOrFallback = (
  loader: THREE.TextureLoader,
  url: string,
  fallbackColor: string,
): Promise<THREE.Texture | null> =>
  new Promise((resolve) => {
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        resolve(tex);
      },
      undefined,
      () => resolve(null),
    );
    void fallbackColor;
  });

const matWithMap = (map: THREE.Texture | null, fallback: string, roughness = 0.85) =>
  new THREE.MeshStandardMaterial({
    map: map ?? null,
    color: map ? 0xffffff : new THREE.Color(fallback),
    roughness,
    metalness: 0.05,
  });

const flatMat = (color: string, roughness = 0.9) =>
  new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness, metalness: 0.05 });

// BoxGeometry face order: [+x, -x, +y, -y, +z, -z]

const BoxStage = () => {
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const [captionIndex, setCaptionIndex] = useState(0);
  const [reduced] = useState(prefersReducedMotion);
  const [ctxLost, setCtxLost] = useState(false);

  useEffect(() => {
    if (reduced || ctxLost) return;
    const host = canvasHostRef.current;
    const track = trackRef.current;
    if (!host || !track) return;

    const isMobile = window.innerWidth < 768;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 1, 5000);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.shadowMap.enabled = !isMobile;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.setAttribute("role", "img");
    renderer.domElement.setAttribute(
      "aria-label",
      "3D model of the Woolet box: a black rigid magnetic case that opens to reveal a cream lining reading 'Made for wide faces'.",
    );

    const onContextLost = () => setCtxLost(true);
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);

    // Lights
    scene.add(new THREE.HemisphereLight(0xffffff, 0xd9d2c6, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 0.95);
    key.position.set(-220, 320, 240);
    key.castShadow = !isMobile;
    if (!isMobile) {
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.left = -400;
      key.shadow.camera.right = 400;
      key.shadow.camera.top = 400;
      key.shadow.camera.bottom = -400;
    }
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.3);
    fill.position.set(260, 140, -180);
    scene.add(fill);

    // Ground shadow
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.18 });
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), shadowMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Box group
    const boxGroup = new THREE.Group();
    scene.add(boxGroup);

    const L = 180;
    const W = 80;
    const H = 55;
    const TH = 2.5;

    const loader = new THREE.TextureLoader();
    const mats: THREE.Material[] = [];
    const geoms: THREE.BufferGeometry[] = [];
    const texs: THREE.Texture[] = [];

    Promise.all([
      loadTextureOrFallback(loader, "/box/panel-front.png", CREAM),
      loadTextureOrFallback(loader, "/box/panel-back.png", INK),
      loadTextureOrFallback(loader, "/box/panel-spine.png", INK),
      loadTextureOrFallback(loader, "/box/panel-flap.png", INK),
      loadTextureOrFallback(loader, "/box/panel-inner-lid.png", CREAM),
    ]).then(([front, back, spine, flap, inner]) => {
      [front, back, spine, flap, inner].forEach((t) => t && texs.push(t));

      // Base tray -------------------------------------------------
      // Bottom slab: +Y = inner cream, -Y = panel-back
      const bottomMats = [
        flatMat(INK),
        flatMat(INK),
        matWithMap(null, CREAM, 0.75), // top (inner)
        matWithMap(back, INK, 0.9), // bottom (outer)
        flatMat(INK),
        flatMat(INK),
      ];
      bottomMats.forEach((m) => mats.push(m));
      const bottomGeo = new THREE.BoxGeometry(L, TH, W);
      geoms.push(bottomGeo);
      const bottom = new THREE.Mesh(bottomGeo, bottomMats);
      bottom.position.set(0, TH / 2, 0);
      bottom.receiveShadow = true;
      bottom.castShadow = true;
      boxGroup.add(bottom);

      // Back wall: outer -Z face = spine
      const backMats = [
        flatMat(INK),
        flatMat(INK),
        flatMat(INK),
        flatMat(INK),
        matWithMap(null, CREAM, 0.85), // +Z inner
        matWithMap(spine, INK, 0.85), // -Z outer
      ];
      backMats.forEach((m) => mats.push(m));
      const backGeo = new THREE.BoxGeometry(L, H, TH);
      geoms.push(backGeo);
      const backWall = new THREE.Mesh(backGeo, backMats);
      backWall.position.set(0, H / 2, -W / 2 + TH / 2);
      backWall.castShadow = true;
      boxGroup.add(backWall);

      // Front wall (short)
      const frontWall = new THREE.Mesh(
        (() => { const g = new THREE.BoxGeometry(L, H - 6, TH); geoms.push(g); return g; })(),
        flatMat(INK, 0.85),
      );
      mats.push(frontWall.material as THREE.Material);
      frontWall.position.set(0, (H - 6) / 2, W / 2 - TH / 2);
      frontWall.castShadow = true;
      boxGroup.add(frontWall);

      // Side walls
      const sideGeo = new THREE.BoxGeometry(TH, H, W - 2 * TH);
      geoms.push(sideGeo);
      const sideMats = [
        matWithMap(null, INK, 0.9), // +x outer (varies)
        matWithMap(null, CREAM, 0.8), // -x inner
        flatMat(INK),
        flatMat(INK),
        flatMat(INK),
        flatMat(INK),
      ];
      sideMats.forEach((m) => mats.push(m));
      const leftSide = new THREE.Mesh(sideGeo, [
        flatMat(CREAM, 0.8),
        flatMat(INK, 0.9),
        flatMat(INK), flatMat(INK), flatMat(INK), flatMat(INK),
      ]);
      leftSide.position.set(-(L / 2 - TH / 2), H / 2, 0);
      leftSide.castShadow = true;
      boxGroup.add(leftSide);

      const rightSide = new THREE.Mesh(sideGeo, [
        flatMat(INK, 0.9),
        flatMat(CREAM, 0.8),
        flatMat(INK), flatMat(INK), flatMat(INK), flatMat(INK),
      ]);
      rightSide.position.set(L / 2 - TH / 2, H / 2, 0);
      rightSide.castShadow = true;
      boxGroup.add(rightSide);

      // Lid hinge --------------------------------------------------
      const hinge = new THREE.Group();
      hinge.position.set(0, H, -W / 2);
      boxGroup.add(hinge);

      const lidMats = [
        flatMat(INK, 0.85),
        flatMat(INK, 0.85),
        matWithMap(front, INK, 0.7), // +Y top (lid face — gold w)
        matWithMap(inner, CREAM, 0.75), // -Y underside (inner lid, "MADE FOR WIDE FACES")
        flatMat(INK, 0.85),
        flatMat(INK, 0.85),
      ];
      lidMats.forEach((m) => mats.push(m));
      const lidGeo = new THREE.BoxGeometry(L, TH, W);
      geoms.push(lidGeo);
      const lid = new THREE.Mesh(lidGeo, lidMats);
      lid.position.set(0, TH / 2, W / 2);
      lid.castShadow = true;
      hinge.add(lid);

      const flapPivot = new THREE.Group();
      flapPivot.position.set(0, 0, W);
      hinge.add(flapPivot);

      const flapMats = [
        flatMat(INK, 0.85),
        flatMat(INK, 0.85),
        flatMat(INK, 0.85),
        flatMat(INK, 0.85),
        matWithMap(flap, INK, 0.75), // +Z
        flatMat(INK, 0.85),
      ];
      flapMats.forEach((m) => mats.push(m));
      const flapGeo = new THREE.BoxGeometry(L, H, TH);
      geoms.push(flapGeo);
      const flapMesh = new THREE.Mesh(flapGeo, flapMats);
      flapMesh.position.set(0, -H / 2, TH / 2);
      flapMesh.castShadow = true;
      flapPivot.add(flapMesh);

      // Save refs on box group userData for animation loop
      boxGroup.userData = { hinge, flapPivot };
    });

    // Camera state
    const cam = { yaw: -0.62, pitch: 0.42, dist: 520, target: new THREE.Vector3(0, 25, 0) };
    let manualOrbit = false;

    const applyCamera = () => {
      const x = cam.dist * Math.cos(cam.pitch) * Math.sin(cam.yaw);
      const z = cam.dist * Math.cos(cam.pitch) * Math.cos(cam.yaw);
      const y = cam.dist * Math.sin(cam.pitch);
      camera.position.set(x, y, z).add(cam.target);
      camera.lookAt(cam.target);
    };

    // Sizing
    const resize = () => {
      const rect = host.getBoundingClientRect();
      const w = rect.width || window.innerWidth;
      const h = rect.height || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    // Scroll progress
    let progress = 0;
    const updateProgress = () => {
      const rect = track.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = track.offsetHeight - vh;
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      progress = total > 0 ? scrolled / total : 0;
    };

    // Interaction: pointer drag orbit + wheel zoom
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const el = renderer.domElement;
    el.style.touchAction = "pan-y";

    const onDown = (e: PointerEvent) => {
      dragging = true;
      manualOrbit = true;
      lastX = e.clientX;
      lastY = e.clientY;
      el.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      cam.yaw -= dx * 0.006;
      cam.pitch = Math.min(1.45, Math.max(-0.25, cam.pitch + dy * 0.005));
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      try { el.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
    };
    const onWheel = (e: WheelEvent) => {
      if (!manualOrbit) return;
      e.preventDefault();
      cam.dist = Math.min(1000, Math.max(220, cam.dist + e.deltaY * 0.5));
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("wheel", onWheel, { passive: false });

    // Perf watchdog
    let lastFrame = performance.now();
    let slowFrames = 0;
    let degraded = false;

    // Caption index tracking
    let lastCaptionIdx = -1;

    let rafId = 0;
    const animate = () => {
      const now = performance.now();
      const dt = now - lastFrame;
      lastFrame = now;
      if (dt > 33) slowFrames++;
      else slowFrames = Math.max(0, slowFrames - 1);
      if (slowFrames > 120 && !degraded) {
        degraded = true;
        renderer.shadowMap.enabled = false;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
      }

      updateProgress();
      const p = progress;
      const k = smoothstep(p);

      // Choreograph camera + lid unless user is orbiting manually
      if (!manualOrbit) {
        // 0.00–0.20 idle drift
        if (p < 0.2) {
          const t = smoothstep(p / 0.2);
          cam.yaw = -0.62 + (-0.45 - -0.62) * t;
          cam.pitch = 0.42;
          cam.dist = 520;
        } else if (p < 0.55) {
          const t = smoothstep((p - 0.2) / 0.35);
          cam.yaw = -0.45;
          cam.pitch = 0.42 + (0.4 - 0.42) * t;
          cam.dist = 520 + (560 - 520) * t;
        } else if (p < 0.8) {
          const t = smoothstep((p - 0.55) / 0.25);
          cam.yaw = -0.45 + (-0.3 - -0.45) * t;
          cam.pitch = 0.4 + (0.55 - 0.4) * t;
          cam.dist = 560 + (400 - 560) * t;
        } else {
          const t = smoothstep((p - 0.8) / 0.2);
          cam.yaw = -0.3;
          cam.pitch = 0.55 + (0.45 - 0.55) * t;
          cam.dist = 400 + (520 - 400) * t;
        }
      }

      // Lid animation from p (independent of camera manual override)
      const ud = boxGroup.userData as { hinge?: THREE.Group; flapPivot?: THREE.Group };
      if (ud.hinge && ud.flapPivot) {
        const openP = Math.min(Math.max((p - 0.2) / 0.35, 0), 1);
        const openK = smoothstep(openP);
        ud.hinge.rotation.x = -openK * Math.PI * 0.42;
        ud.flapPivot.rotation.x = -openK * Math.PI * 0.06;
      }

      applyCamera();
      renderer.render(scene, camera);

      // Captions
      const idx = captions.findIndex((c) => p >= c.at[0] && p < c.at[1]);
      const bounded = idx === -1 ? captions.length - 1 : idx;
      if (bounded !== lastCaptionIdx) {
        lastCaptionIdx = bounded;
        setCaptionIndex(bounded);
      }

      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    // Reset view
    const resetHandler = () => {
      manualOrbit = false;
      cam.yaw = -0.62;
      cam.pitch = 0.42;
      cam.dist = 520;
    };
    (host as unknown as { __resetView?: () => void }).__resetView = resetHandler;

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("webglcontextlost", onContextLost);
      renderer.dispose();
      geoms.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      texs.forEach((t) => t.dispose());
      if (el.parentNode) el.parentNode.removeChild(el);
    };
  }, [reduced, ctxLost]);

  if (reduced || ctxLost) {
    return (
      <section style={{ padding: "80px 6vw", background: INK }}>
        <div style={{ maxWidth: 960, margin: "0 auto", textAlign: "center" }}>
          <img
            src="/box/woolet-box-3D-closed.png"
            alt="Woolet magnetic case, closed. 180 × 80 × 55 mm."
            style={{ maxWidth: "100%", height: "auto" }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0"; }}
          />
          <div style={{ marginTop: 40, display: "grid", gap: 24 }}>
            {captions.map((c) => (
              <p
                key={c.text}
                style={{
                  fontFamily: "'Archivo', system-ui, sans-serif",
                  fontSize: 20,
                  lineHeight: 1.45,
                  color: c.gold ? GOLD : CREAM,
                  fontWeight: 300,
                  letterSpacing: "-0.005em",
                  margin: 0,
                }}
              >
                {c.text}
              </p>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const trackHeight = isMobile ? "300vh" : "400vh";
  const canvasHeight = isMobile ? "70vh" : "100vh";

  return (
    <section
      ref={trackRef}
      style={{ position: "relative", height: trackHeight, background: INK }}
      aria-label="Woolet box, 3D scroll animation"
    >
      {/* Visually-hidden narrative for a11y/SEO */}
      <div
        style={{
          position: "absolute",
          width: 1, height: 1, padding: 0, margin: -1,
          overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0,
        }}
      >
        {captions.map((c) => <p key={c.text}>{c.text}</p>)}
      </div>

      <div
        style={{
          position: "sticky",
          top: 0,
          height: canvasHeight,
          width: "100%",
          overflow: "hidden",
        }}
      >
        <div ref={canvasHostRef} style={{ position: "absolute", inset: 0 }} />

        {/* Captions overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            paddingLeft: isMobile ? 0 : "8vw",
            paddingRight: isMobile ? 0 : "8vw",
            justifyContent: isMobile ? "center" : "flex-start",
          }}
        >
          <div style={{ maxWidth: 460, textAlign: isMobile ? "center" : "left", padding: "0 24px" }}>
            {captions.map((c, i) => {
              const active = i === captionIndex;
              return (
                <p
                  key={c.text}
                  aria-hidden={!active}
                  style={{
                    position: active ? "static" : "absolute",
                    opacity: active ? 1 : 0,
                    transform: active ? "translateY(0)" : "translateY(12px)",
                    transition: "opacity 400ms ease, transform 400ms ease",
                    margin: 0,
                    fontFamily: "'Archivo', system-ui, sans-serif",
                    fontWeight: 300,
                    fontSize: "clamp(22px, 2.8vw, 34px)",
                    lineHeight: 1.2,
                    letterSpacing: "-0.01em",
                    color: c.gold ? GOLD : CREAM,
                    pointerEvents: "none",
                  }}
                >
                  {c.text}
                </p>
              );
            })}
          </div>
        </div>

        {/* Reset view */}
        <button
          type="button"
          onClick={() => {
            const host = canvasHostRef.current as unknown as { __resetView?: () => void } | null;
            host?.__resetView?.();
          }}
          style={{
            position: "absolute",
            right: 20,
            bottom: 20,
            background: "transparent",
            color: DIM_GOLD,
            border: `1px solid ${DIM_GOLD}55`,
            padding: "8px 14px",
            fontFamily: "'Archivo', system-ui, sans-serif",
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            cursor: "pointer",
            borderRadius: 2,
          }}
          aria-label="Reset 3D view"
        >
          Reset view
        </button>
      </div>
    </section>
  );
};

export default BoxStage;
