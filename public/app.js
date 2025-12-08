// app.js

const form = document.getElementById("generator-form");
const generateBtn = document.getElementById("generate-btn");

// Inputs
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");
const telephoneInput = document.getElementById("telephone");
const emailInput = document.getElementById("email");

const whatsappInput = document.getElementById("whatsapp");
const telegramInput = document.getElementById("telegram");
const snapchatInput = document.getElementById("snapchat");
const pinterestInput = document.getElementById("pinterest");
const githubInput = document.getElementById("github");

const websiteInput = document.getElementById("website");
const addressInput = document.getElementById("address");
const facebookInput = document.getElementById("facebook");
const youtubeInput = document.getElementById("youtube");
const linkedinInput = document.getElementById("linkedin");
const instagramInput = document.getElementById("instagram");
const twitterInput = document.getElementById("twitter");

// vCard UI elements
const vcardResult = document.getElementById("result");
const vcardLinkOutput = document.getElementById("link-output");
const vcardCopyBtn = document.getElementById("copy-btn");
const vcardOpenLink = document.getElementById("test-link");

const outputsNote = document.getElementById("outputs-note");
const multiOutput = document.getElementById("multi-output");

// ---------- Output configs ----------
const linkConfigs = {
  phone: {
    label: "Mobile",
    icon: "📱",
    input: () => phoneInput.value.trim(),
    build: (value) => {
      if (!value) return "";
      let digits = value.replace(/[^\d]/g, "");
      if (digits.length < 8) return "";
      if (!value.startsWith("+")) digits = "1" + digits; // default country, change to "91" if you want
      return `tel:+${digits}`;
    },
  },
  telephone: {
    label: "Landline",
    icon: "☎",
    input: () => telephoneInput.value.trim(),
    build: (value) => {
      if (!value) return "";
      let digits = value.replace(/[^\d]/g, "");
      if (digits.length < 6) return "";
      if (!value.startsWith("+")) digits = "1" + digits; // default country
      return `tel:+${digits}`;
    },
  },
  email: {
    label: "Email",
    icon: "@",
    input: () => emailInput.value.trim(),
    build: (v) => (v ? `mailto:${v}` : ""),
  },
  whatsapp: {
    label: "WhatsApp",
    icon: "WA",
    input: () => whatsappInput.value.trim(),
    build: (v) => {
      const d = v.replace(/[^\d]/g, "");
      return d ? `https://wa.me/${d}` : "";
    },
  },
  telegram: {
    label: "Telegram",
    icon: "TG",
    input: () => telegramInput.value.trim(),
    build: (v) => (v ? `https://t.me/${v}` : ""),
  },
  snapchat: {
    label: "Snapchat",
    icon: "SC",
    input: () => snapchatInput.value.trim(),
    build: (v) => (v ? `https://www.snapchat.com/add/${v}` : ""),
  },
  pinterest: {
    label: "Pinterest",
    icon: "P",
    input: () => pinterestInput.value.trim(),
    build: (v) => (v ? `https://www.pinterest.com/${v}` : ""),
  },
  github: {
    label: "GitHub",
    icon: "GH",
    input: () => githubInput.value.trim(),
    build: (v) => (v ? `https://github.com/${v}` : ""),
  },
  website: {
    label: "Website",
    icon: "www",
    input: () => websiteInput.value.trim(),
    build: (v) => {
      if (!v) return "";
      if (/^https?:\/\//i.test(v)) return v;
      return `https://${v}`;
    },
  },
  address: {
    label: "Maps",
    icon: "📍",
    input: () => addressInput.value.trim(),
    build: (v) =>
      v
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            v
          )}`
        : "",
  },
  facebook: {
    label: "Facebook",
    icon: "f",
    input: () => facebookInput.value.trim(),
    build: (v) => (v ? `https://www.facebook.com/${v}` : ""),
  },
  youtube: {
    label: "YouTube",
    icon: "▶",
    input: () => youtubeInput.value.trim(),
    build: (v) => (v ? `https://www.youtube.com/${v}` : ""),
  },
  linkedin: {
    label: "LinkedIn",
    icon: "in",
    input: () => linkedinInput.value.trim(),
    build: (v) => (v ? `https://www.linkedin.com/in/${v}` : ""),
  },
  instagram: {
    label: "Instagram",
    icon: "IG",
    input: () => instagramInput.value.trim(),
    build: (v) => (v ? `https://www.instagram.com/${v}` : ""),
  },
  twitter: {
    label: "Twitter / X",
    icon: "X",
    input: () => twitterInput.value.trim(),
    build: (v) => (v ? `https://twitter.com/${v}` : ""),
  },
};

// ---------- Submit handler ----------
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    generateBtn.disabled = true;
    generateBtn.textContent = "Generating…";

    const any =
      name ||
      phone ||
      telephoneInput.value ||
      emailInput.value ||
      whatsappInput.value ||
      telegramInput.value ||
      snapchatInput.value ||
      pinterestInput.value ||
      githubInput.value ||
      websiteInput.value ||
      addressInput.value ||
      facebookInput.value ||
      youtubeInput.value ||
      linkedinInput.value ||
      instagramInput.value ||
      twitterInput.value;

    if (!any) {
      alert("Please fill at least one field.");
      generateBtn.disabled = false;
      generateBtn.textContent = "Generate";
      return;
    }

    let hasVcard = false;

    // vCard only if phone exists
    if (phone) {
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone }),
        });

        if (res.ok) {
          const data = await res.json();
          vcardLinkOutput.value = data.link;
          vcardOpenLink.href = data.link;
          vcardResult.classList.remove("hidden");
          hasVcard = true;
        } else {
          vcardResult.classList.add("hidden");
          vcardLinkOutput.value = "";
        }
      } catch {
        vcardResult.classList.add("hidden");
        vcardLinkOutput.value = "";
      }
    } else {
      vcardResult.classList.add("hidden");
      vcardLinkOutput.value = "";
    }

    // Dynamic rows
    multiOutput.innerHTML = "";
    let anyOutput = false;

    Object.entries(linkConfigs).forEach(([key, cfg]) => {
      const raw = cfg.input();
      if (!raw) return;

      const link = cfg.build(raw);
      if (!link) return;

      anyOutput = true;

      const row = document.createElement("div");
      row.className = "output-row";

      row.innerHTML = `
        <div class="output-label">
          <span class="small-circle">${cfg.icon}</span>
          <span>${cfg.label}</span>
        </div>
        <input class="link-output" value="${link}" readonly />
        <button class="copy-link-btn">Copy</button>
      `;

      multiOutput.appendChild(row);
    });

    outputsNote.textContent =
      anyOutput || hasVcard
        ? "Output generated. Copy any link or download the vCard."
        : "No valid outputs yet. Try entering more fields.";

    generateBtn.disabled = false;
    generateBtn.textContent = "Generate";
  });
}

// Copy vCard link
vcardCopyBtn.addEventListener("click", async () => {
  if (!vcardLinkOutput.value) return;
  await navigator.clipboard.writeText(vcardLinkOutput.value);
  const old = vcardCopyBtn.textContent;
  vcardCopyBtn.textContent = "Copied!";
  setTimeout(() => (vcardCopyBtn.textContent = old), 1400);
});

// Copy dynamic links
multiOutput.addEventListener("click", async (e) => {
  const btn = e.target.closest(".copy-link-btn");
  if (!btn) return;
  const row = btn.closest(".output-row");
  const input = row.querySelector(".link-output");
  if (!input || !input.value) return;

  await navigator.clipboard.writeText(input.value);
  const old = btn.textContent;
  btn.textContent = "Copied!";
  setTimeout(() => (btn.textContent = old), 1400);
});
