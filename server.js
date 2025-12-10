// GET /vcard/:id -> download VCF file
app.get("/vcard/:id", (req, res) => {
  const data = store.get(req.params.id);

  if (!data) {
    return res.status(404).send("vCard not found or expired.");
  }

  const { phone, name } = data;

  // Simple vCard (VCF) content
  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${name}`,
    `TEL;TYPE=CELL:${phone}`,
    "END:VCARD",
    "",
  ].join("\r\n");

  // Build safe filename from the stored name
  let safeName = (name || "").toString().trim();
  if (safeName) {
    safeName = safeName
      .replace(/\s+/g, "")      // remove spaces
      .replace(/[^\w\-]/g, ""); // remove weird chars
  }
  if (!safeName) {
    safeName = "contact";
  }
  const fileName = `${safeName}.vcf`;

  // 👇 LOG so we can see what the server thinks
  console.log("VCARD DOWNLOAD → name:", name, "| safeName:", safeName, "| fileName:", fileName);

  res.setHeader("Content-Type", "text/vcard; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  return res.send(vcard);
});
