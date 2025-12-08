// server.js
const express = require("express");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

// When running behind a proxy (Render, etc.) this lets req.protocol be "https"
app.set("trust proxy", true);

// In-memory store: id → { phone, name }
const store = new Map();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Helper to create a random id
function generateId() {
  return crypto.randomBytes(8).toString("hex");
}

// POST /api/generate -> create unique link for given phone (and optional name)
app.post("/api/generate", (req, res) => {
  const { phone, name } = req.body || {};

  if (!phone || typeof phone !== "string" || !phone.trim()) {
    return res.status(400).json({ error: "Phone number is required." });
  }

  const id = generateId();
  const cleanPhone = phone.trim();
  const displayName = (name || "").trim() || "My Contact";

  store.set(id, {
    phone: cleanPhone,
    name: displayName,
  });

  // Base URL works both locally and on Render
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const link = `${baseUrl}/vcard/${id}`;

  return res.json({ id, link });
});

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

  res.setHeader("Content-Type", 'text/vcard; charset=utf-8');
  res.setHeader("Content-Disposition", 'attachment; filename="contact.vcf"');
  return res.send(vcard);
});

app.listen(PORT, () => {
  console.log(`VCF generator running on port ${PORT}`);
});
