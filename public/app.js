// app.js

// --------- DOM REFERENCES ---------
const form = document.getElementById("generator-form");
const multiOutput = document.getElementById("multi-output");

const vcardRow = document.getElementById("result");
const vcardStatusEl = document.getElementById("vcard-status");
const vcardLinkHidden = document.getElementById("link-output");
const vcardCopyBtn = document.getElementById("copy-btn");
const vcardDownloadBtn = document.getElementById("download-vcard-btn");

const pdfBtn = document.getElementById("download-pdf");

// state for PDF naming + links
let currentNameForFiles = "";
let currentOutputs = [];   // { label, value, link }
let currentVcardUrl = "";

// --------- HELPERS ---------

function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

function buildTelLink(num) {
  let n = num.trim();
  // If already starts with tel: leave as-is
  if (n.toLowerCase().startsWith("tel:")) return n;
  // If starts with + keep it
  if (!n.startsWith("+")) {
    n = "+".concat(n.replace(/\s+/g, ""));
  }
  return `tel:${n}`;
}

function ensureHttp(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return "https://" + url;
}

function stripAt(text) {
  return text.replace(/^@+/, "");
}

/**
 * Adds a visual row + stores for PDF.
 * label: "Mobile"
 * iconText: short label inside circle ("📱" or "WA" etc.)
 * display: text to show in UI (usually the link)
 * linkToCopy: what is copied to clipboard (defaults to display)
 */
function addOutputRow(label, iconText, display, linkToCopy) {
  if (!display) return;

  const row = document.createElement("div");
  row.className = "output-row";

  const left = document.createElement("div");
  left.className = "output-left";

  const circle = document.createElement("div");
  circle.className = "small-circle";
  circle.textContent = iconText;

  const textWrap = document.createElement("div");

  const titleEl = document.createElement("div");
  titleEl.className = "output-label-text";
  titleEl.textContent = label;

  const valueEl = document.createElement("div");
  valueEl.className = "output-value";
  valueEl.textContent = display;

  textWrap.appendChild(titleEl);
  textWrap.appendChild(valueEl);

  left.appendChild(circle);
  left.appendChild(textWrap);

  const actions = document.createElement("div");
  actions.className = "output-actions";

  const copyBtn = document.createElement("button");
  copyBtn.className = "copy-btn";
  copyBtn.textContent = "Copy";
  copyBtn.addEventListener("click", () => {
    navigator.clipboard
      .writeText(linkToCopy || display)
      .catch((err) => console.error("Copy failed", err));
  });

  actions.appendChild(copyBtn);

  row.appendChild(left);
  row.appendChild(actions);

  multiOutput.appendChild(row);

  currentOutputs.push({
    label,
    value: display,
    link: linkToCopy || display,
  });
}

/**
 * Call backend to generate vCard URL.
 */
async function generateVcardLink(name, phone) {
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });

    if (!res.ok) {
      throw new Error("Failed to generate vCard");
    }

    const data = await res.json();
    const link = data.link;

    currentVcardUrl = link;
    vcardLinkHidden.value = link;
    vcardStatusEl.textContent = "Link ready";
    vcardRow.classList.remove("hidden");
  } catch (err) {
    console.error(err);
    currentVcardUrl = "";
    vcardLinkHidden.value = "";
    vcardStatusEl.textContent = "Error generating vCard";
    vcardRow.classList.remove("hidden");
  }
}

// --------- EVENT: FORM SUBMIT ---------

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // read values
  const name = getValue("name");
  const phone = getValue("phone");
  const telephone = getValue("telephone");
  const email = getValue("email");

  const whatsapp = getValue("whatsapp");
  const telegram = getValue("telegram");
  const snapchat = getValue("snapchat");
  const pinterest = getValue("pinterest");
  const github = getValue("github");
  const website = getValue("website");
  const address = getValue("address");
  const facebook = getValue("facebook");
  const youtube = getValue("youtube");
  const linkedin = getValue("linkedin");
  const instagram = getValue("instagram");
  const twitter = getValue("twitter");

  currentNameForFiles = name || "Contact";
  currentOutputs = [];
  multiOutput.innerHTML = "";

  // ------- PHONE / CALLS -------
  if (phone) {
    const telLink = buildTelLink(phone);
    addOutputRow("Mobile", "📱", telLink, telLink);
  }

  if (telephone) {
    const telLandline = buildTelLink(telephone);
    addOutputRow("Landline", "☎", telLandline, telLandline);
  }

  // ------- EMAIL -------
  if (email) {
    const mailLink = `mailto:${email}`;
    addOutputRow("Email", "✉", mailLink, mailLink);
  }

  // ------- WHATSAPP -------
  if (whatsapp) {
    const digits = whatsapp.replace(/[^\d]/g, "");
    if (digits) {
      const waLink = `https://wa.me/${digits}`;
      addOutputRow("WhatsApp", "WA", waLink, waLink);
    }
  }

  // ------- TELEGRAM -------
  if (telegram) {
    const user = stripAt(telegram);
    const tgLink = `https://t.me/${user}`;
    addOutputRow("Telegram", "TG", tgLink, tgLink);
  }

  // ------- SNAPCHAT -------
  if (snapchat) {
    const scUser = stripAt(snapchat);
    const scLink = `https://www.snapchat.com/add/${scUser}`;
    addOutputRow("Snapchat", "SC", scLink, scLink);
  }

  // ------- PINTEREST -------
  if (pinterest) {
    const pUser = stripAt(pinterest);
    const pLink = `https://www.pinterest.com/${pUser}`;
    addOutputRow("Pinterest", "P", pLink, pLink);
  }

  // ------- GITHUB -------
  if (github) {
    const ghUser = stripAt(github);
    const ghLink = `https://github.com/${ghUser}`;
    addOutputRow("GitHub", "GH", ghLink, ghLink);
  }

  // ------- WEBSITE -------
  if (website) {
    const siteLink = ensureHttp(website);
    addOutputRow("Website", "🌐", siteLink, siteLink);
  }

  // ------- MAPS / ADDRESS -------
  if (address) {
    const mapsLink =
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent(address);
    addOutputRow("Maps", "📍", mapsLink, mapsLink);
  }

  // ------- FACEBOOK -------
  if (facebook) {
    let fb = facebook.trim();
    if (!/^https?:\/\//i.test(fb)) {
      fb = `https://www.facebook.com/${fb}`;
    }
    addOutputRow("Facebook", "f", fb, fb);
  }

  // ------- YOUTUBE -------
  if (youtube) {
    let yt = youtube.trim();
    if (!/^https?:\/\//i.test(yt)) {
      yt = `https://www.youtube.com/${yt}`;
    }
    addOutputRow("YouTube", "YT", yt, yt);
  }

  // ------- LINKEDIN -------
  if (linkedin) {
    let li = linkedin.trim();
    if (!/^https?:\/\//i.test(li)) {
      li = `https://www.linkedin.com/in/${li}`;
    }
    addOutputRow("LinkedIn", "in", li, li);
  }

  // ------- INSTAGRAM -------
  if (instagram) {
    const igUser = stripAt(instagram);
    const igLink = `https://www.instagram.com/${igUser}/`;
    addOutputRow("Instagram", "IG", igLink, igLink);
  }

  // ------- TWITTER / X -------
  if (twitter) {
    const twUser = stripAt(twitter);
    const twLink = `https://twitter.com/${twUser}`;
    addOutputRow("Twitter / X", "X", twLink, twLink);
  }

  // ------- vCard (server) -------
    // ------- vCard (server) -------
  if (phone) {
    await generateVcardLink(name, phone);
  } else {
    // hide vCard row if no phone
    vcardRow.classList.add("hidden");
    currentVcardUrl = "";
    vcardLinkHidden.value = "";
  }

  // ------- Show / hide PDF button based on outputs -------
  if (pdfBtn) {
    if (currentOutputs.length || currentVcardUrl) {
      pdfBtn.classList.remove("hidden");
    } else {
      pdfBtn.classList.add("hidden");
    }
  }
});



// --------- vCard buttons (Copy / Download) ---------

vcardCopyBtn.addEventListener("click", () => {
  const link = vcardLinkHidden.value;
  if (!link) return;
  navigator.clipboard
    .writeText(link)
    .catch((err) => console.error("Copy vCard failed", err));
});

vcardDownloadBtn.addEventListener("click", () => {
  const link = vcardLinkHidden.value;
  if (!link) return;
  window.open(link, "_blank");
});

// --------- PDF DOWNLOAD ---------

if (pdfBtn) {
  pdfBtn.addEventListener("click", () => {
    if (!currentOutputs.length && !currentVcardUrl) {
      alert("Generate at least one link first.");
      return;
    }

    const jspdfGlobal = window.jspdf;
    if (!jspdfGlobal || !jspdfGlobal.jsPDF) {
      alert("PDF library not loaded.");
      return;
    }

    const { jsPDF } = jspdfGlobal;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const safeName = (currentNameForFiles || "Contact")
      .toString()
      .trim()
      .replace(/\s+/g, "") || "Contact";

    // Title
    let y = 60;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`${currentNameForFiles || "Contact"} – Contact Links`, 40, y);
    y += 24;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Generated by Contact Link Studio", 40, y);
    y += 30;

    // Table header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Field", 40, y);
    doc.text("Value / Link", 160, y);
    y += 8;
    doc.setLineWidth(0.5);
    doc.line(40, y, 555, y);
    y += 16;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    // Build rows: include vCard (if present) at top
    const rows = [];
    if (currentVcardUrl) {
      rows.push({ label: "vCard file", value: currentVcardUrl });
    }
    currentOutputs.forEach((row) => {
      rows.push({ label: row.label, value: row.value });
    });

    const maxWidth = 380;

    rows.forEach((row) => {
      if (y > 760) {
        doc.addPage();
        y = 60;
      }

      doc.setFont("helvetica", "bold");
      doc.text(row.label, 40, y);

      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(row.value, maxWidth);
      doc.text(lines, 160, y);

      y += 18 + (lines.length - 1) * 14;
    });

    doc.save(`${safeName}_links.pdf`);
  });
}
