import sharp from "sharp";
for (const size of [192, 512])
  await sharp("public/logo.svg")
    .resize(size, size)
    .png()
    .toFile(`public/icon-${size}.png`);
// Maskable artwork has explicit safe padding so Android launchers cannot clip the mark.
await sharp("public/logo.svg")
  .resize(352, 352)
  .extend({ top: 80, bottom: 80, left: 80, right: 80, background: "#102b3f" })
  .png()
  .toFile("public/icon-maskable.png");
