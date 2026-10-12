# Crown Panto geometry audit - 2026-10-12

Inspected all 20 cached Crown Panto images across all prompt versions against the Crown Panto outline.
- 19 legacy images retain a flattened crown/brow rather than a fully circular Round silhouette; no shape-error regeneration flag.
- 1 image was clearly Round-shaped: c620cae9, cache row 9aeccb0f-296a-4348-8f70-fdc0664ac352 (angle-v2). Flagged for shape regeneration and replaced individually with 1e687b22 (angle-v3).
- No remaining round-shaped Crown Panto cache rows identified. No bulk regeneration performed.
- Original c620cae9 storage object remains immutable for existing URLs; its cache record now serves the corrected render.
- First replacement attempt passed visual inspection: both lens tops are visibly flattened, deep rounded bottoms and keyhole bridge; no retries needed.
- Featured selection key is unchanged, so its pinned card now resolves to the replacement automatically.

| Cache row | Inspected file | Version before audit | Shape audit / action |
| --- | --- | --- | --- |
| ab01b5fc-aa80-4655-9db3-876bf100acef | 50baf6e3.png | v1-backfill | Crown/panto silhouette: no round-shape flag |
| 6ccac3d0-58a2-40b1-bf9f-0a9fc8732990 | ef3dde09.png | v1-backfill | Crown/panto silhouette: no round-shape flag |
| d18e2ebf-7605-49df-8be3-4c37bc1d28b3 | e7709b1c.png | v1-backfill | Crown/panto silhouette: no round-shape flag |
| 0d9477bb-2355-43b1-928a-ba725f684122 | 5ce24b57.png | v1-backfill | Crown/panto silhouette: no round-shape flag |
| 6165c365-bc89-4120-857f-3e5837b9f593 | 85b27dd6.png | v1-backfill | Crown/panto silhouette: no round-shape flag |
| ca6f5b21-2bf2-4add-93f6-946a4245a464 | c921767b.png | v1-backfill | Crown/panto silhouette: no round-shape flag |
| 4693c702-6d54-40bf-855a-64bc479a59e2 | dbed9c71.png | v1-backfill | Crown/panto silhouette: no round-shape flag |
| c10113bc-aaef-4725-b634-28b09755946c | 47f37feb.png | v1-backfill | Crown/panto silhouette: no round-shape flag |
| 6b9c6973-c441-4e8e-99a1-0e5a37cc410a | da56bab7.png | v1-backfill | Crown/panto silhouette: no round-shape flag |
| 8db3368b-d2cf-4843-8369-7feacd6f92f1 | 9f41e7b9.png | v1-backfill | Crown/panto silhouette: no round-shape flag |
| 76254973-d656-4c1a-a386-003c43fe529d | 84d1ac3b.png | v1-backfill | Crown/panto silhouette: no round-shape flag |
| 6037187d-cd96-42d6-b545-c1d443e6ccf1 | a5757b17.png | v1-backfill | Crown/panto silhouette: no round-shape flag |
| 51317895-dd17-437d-8128-6e58d6e564e3 | 132f5ffb.png | v1-backfill | Crown/panto silhouette: no round-shape flag |
| 23d9b3c5-0e86-4b40-a88c-10970dea9662 | e3c65432.png | v1-backfill | Crown/panto silhouette: no round-shape flag |
| 39861968-398e-43af-b22e-397de30fec6d | d27dde04.png | v1-backfill | Crown/panto silhouette: no round-shape flag |
| b7568a25-9fcb-427c-84af-7ddae1a01e9d | 6092e4e3.png | v1-backfill | Crown/panto silhouette: no round-shape flag |
| 55833c7c-4ca9-4118-9169-b59b537a4c08 | 64b13366.png | v1-backfill | Crown/panto silhouette: no round-shape flag |
| fb643b43-88b9-4d59-a344-75eb433b8491 | 0574eccf.png | v1-backfill | Crown/panto silhouette: no round-shape flag |
| de2aa6e0-0999-4292-acc1-5d3a089caad1 | 7e5a9ad1.png | v1-backfill | Crown/panto silhouette: no round-shape flag |
| 9aeccb0f-296a-4348-8f70-fdc0664ac352 | c620cae9.png | angle-v2 | Round-shaped: flagged and individually regenerated to 1e687b22 |
