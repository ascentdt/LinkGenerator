// Grab form and output containers
const form = document.getElementById("generator-form");
const outputsNote = document.getElementById("outputs-note");
const multiOutput = document.getElementById("multi-output");

// vCard elements
const vcardResult = document.getElementById("vcardResult");
const vcardStatus = document.getElementById("vcardStatus");
const copyVcardUrl = document.getElementById("copyVcardUrl");
const downloadVcard = document.getElementById("downloadVcard");

// Helper: normalize username-style values (remove leading @, spaces)
function cleanHandle(value) {
  return value.replace(/^@/, "").trim();
}

// Helper: ensure URL has protocol
function normalizeUrl(url) {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return "https://" + trimmed;
}

// Create one output row
function addRow(iconText, labelText, link) {
  const row = document.createElement("div");
  row.className = "output-row";

  const label = document.createElement("div");
  label.className = "output-label";
  label.innerHTML = `
    <span class="small-circle">${iconText}</span>
    <span>${labelText}</span>
  `;

  const linkBox = document.createElement("div");
  linkBox.className = "link-output";
  linkBox.textContent = link;

  const copyBtn = document.createElement("button");
  copyBtn.className = "copy-btn";
  copyBtn.textContent = "Copy";
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(link);
  });

  row.appendChild(label);
  row.appendChild(linkBox);
  row.appendChild(copyBtn);
  multiOutput.appendChild(row);
}

// Call backend to generate vCard link (only if mobile phone present)
async function generateVcardLink(name, phone) {
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone })
    });

    if (!res.ok) throw new Error("Failed to generate vCard");
    const data = await res.json();
    const link = data.link;

    vcardStatus.textContent = "Link ready";
    vcardResult.classList.remove("hidden");

    copyVcardUrl.onclick = () => {
      navigator.clipboard.writeText(link);
    };

    downloadVcard.onclick = () => {
      window.open(link, "_blank");
    };
  } catch (err) {
    vcardStatus.textContent = "Error creating vCard";
    vcardResult.classList.remove("hidden");
    copyVcardUrl.onclick = null;
    downloadVcard.onclick = null;
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Read all fields
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const telephone = document.getElementById("telephone").value.trim();
  const email = document.getElementById("email").value.trim();

  const whatsapp = document.getElementById("whatsapp").value.trim();
  const telegram = cleanHandle(document.getElementById("telegram").value);
  const snapchat = cleanHandle(document.getElementById("snapchat").value);
  const pinterest = cleanHandle(document.getElementById("pinterest").value);
  const github = cleanHandle(document.getElementById("github").value);
  const website = normalizeUrl(document.getElementById("website").value);
  const address = document.getElementById("address").value.trim();
  const facebook = document.getElementById("facebook").value.trim();
  const youtube = cleanHandle(document.getElementById("youtube").value);
  const linkedin = document.getElementById("linkedin").value.trim();
  const instagram = cleanHandle(document.getElementById("instagram").value);
  const twitter = cleanHandle(document.getElementById("twitter").value);

  // Clear previous outputs
  multiOutput.innerHTML = "";

  let anyOutput = false;

  // Mobile phone
  if (phone) {
    const telLink = phone.startsWith("tel:") ? phone : `tel:${phone}`;
    addRow("📱", "Mobile", telLink);
    anyOutput = true;
  }

  // Landline
  if (telephone) {
    const telLink = telephone.startsWith("tel:") ? telephone : `tel:${telephone}`;
    addRow("☎", "Landline", telLink);
    anyOutput = true;
  }

  // Email
  if (email) {
    const mailLink = `mailto:${email}`;
    addRow("✉", "Email", mailLink);
    anyOutput = true;
  }

  // WhatsApp
  if (whatsapp) {
    const wa = whatsapp.replace(/\D/g, "");
    if (wa) {
      const waLink = `https://wa.me/${wa}`;
      addRow("WA", "WhatsApp", waLink);
      anyOutput = true;
    }
  }

  // Telegram
  if (telegram) {
    const tgLink = `https://t.me/${telegram}`;
    addRow("TG", "Telegram", tgLink);
    anyOutput = true;
  }

  // Snapchat
  if (snapchat) {
    const scLink = `https://www.snapchat.com/add/${snapchat}`;
    addRow("SC", "Snapchat", scLink);
    anyOutput = true;
  }

  // Pinterest
  if (pinterest) {
    const pLink = `https://www.pinterest.com/${pinterest}/`;
    addRow("P", "Pinterest", pLink);
    anyOutput = true;
  }

  // GitHub
  if (github) {
    const ghLink = `https://github.com/${github}`;
    addRow("GH", "GitHub", ghLink);
    anyOutput = true;
  }

  // Website
  if (website) {
    addRow("www", "Website", website);
    anyOutput = true;
  }

  // Maps
  if (address) {
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      address
    )}`;
    addRow("📍", "Maps", mapsLink);
    anyOutput = true;
  }

  // Facebook
  if (facebook) {
    const fbLink = /^https?:\/\//i.test(facebook)
      ? facebook
      : `https://www.facebook.com/${facebook}`;
    addRow("f", "Facebook", fbLink);
    anyOutput = true;
  }

  // YouTube
  if (youtube) {
    const ytLink = `https://www.youtube.com/${youtube.startsWith("@") ? "" : "@"}${youtube}`;
    addRow("YT", "YouTube", ytLink);
    anyOutput = true;
  }

  // LinkedIn
  if (linkedin) {
    const liLink = /^https?:\/\//i.test(linkedin)
      ? linkedin
      : `https://www.linkedin.com/in/${linkedin}`;
    addRow("in", "LinkedIn", liLink);
    anyOutput = true;
  }

  // Instagram
  if (instagram) {
    const igLink = `https://www.instagram.com/${instagram}`;
    addRow("IG", "Instagram", igLink);
    anyOutput = true;
  }

  // Twitter / X
  if (twitter) {
    const twLink = `https://twitter.com/${twitter}`;
    addRow("X", "Twitter / X", twLink);
    anyOutput = true;
  }

  // vCard: only if phone present
  if (phone) {
    await generateVcardLink(name, phone);
    anyOutput = true;
  } else {
    vcardResult.classList.add("hidden");
  }

  // Update note
  outputsNote.textContent = anyOutput
    ? "Output generated. Copy any link or download the vCard."
    : "Fill some fields above and click “Generate”.";
});
