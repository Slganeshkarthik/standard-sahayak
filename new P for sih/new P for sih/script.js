const API_BASE = window.location.origin || "http://localhost:5000";
let apiKey = localStorage.getItem("gemini_api_key") || "";
let selectedId = null;
let compareIds = [];
let currentResults = null;
let catFilter = "all";
let auditLog = [];
let notifLog = [];

// ── RBAC User State ───────────────────────────────────────────
let currentUser = {
  name: "Er. Priya Sharma",
  email: "priya.sharma@gem.gov.in",
  org: "Central Public Works Department (CPWD)",
  role: "Procurement Officer",
  avatar: "PO"
};

let systemUsers = [
  { id: "U101", name: "Er. Priya Sharma", email: "priya.sharma@gem.gov.in", org: "CPWD / Urban Infrastructure", role: "Procurement Officer", status: "Active" },
  { id: "U202", name: "Dr. Anil Sharma", email: "anil.sharma@bis.gov.in", org: "Bureau of Indian Standards (BIS)", role: "Standards Administrator", status: "Active" },
  { id: "U404", name: "System Administrator", email: "admin@nic.in", org: "NIC / Ministry of Heavy Industries", role: "System Administrator", status: "Active" }
];

let currentProjectStage = "ai_analysis";

function qs(s) { return document.querySelector(s); }

// ── Toast Notifications ────────────────────────────────────────
function toast(msg, type="info") {
  const icons = {info:"ℹ️", success:"✅", warn:"⚠️", error:"❌"};
  const t = document.createElement("div");
  t.className = `toast ${type}`;
  t.innerHTML = `<span class="toast-icon">${icons[type]||"ℹ️"}</span><span class="toast-body">${escHtml(msg)}</span><button class="toast-close" onclick="this.parentElement.remove()">✕</button>`;
  qs("#toastContainer").prepend(t);
  setTimeout(()=>{ t.style.animation="toastOut .3s ease forwards"; setTimeout(()=>t.remove(),300); }, 5000);
}

function addAudit(msg) {
  const now = new Date().toLocaleTimeString("en-IN",{hour12:false});
  const role = qs("#role")?.value || currentUser.role;
  auditLog = [`${now} — [${role}] ${currentUser.name}: ${msg}`, ...auditLog].slice(0,35);
  renderAudit();
  const badge = qs("#navBadgeAudit");
  if(badge) badge.textContent = auditLog.length;
}

function notify(msg) {
  notifLog = [msg, ...notifLog].slice(0,15);
  renderNotifications();
  toast(msg, "info");
}

function escHtml(v) {
  return String(v||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function highlight(text, term) {
  if(!term) return escHtml(text);
  const re = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")})`, "gi");
  return escHtml(text).replace(re, '<mark class="highlight">$1</mark>');
}

// ── Authentication & Account Creation ──────────────────────────
function switchAuthTab(isRegister) {
  qs("#tabSignIn").classList.toggle("active", !isRegister);
  qs("#tabSignIn").setAttribute("aria-selected", !isRegister);
  qs("#tabRegister").classList.toggle("active", isRegister);
  qs("#tabRegister").setAttribute("aria-selected", isRegister);
  qs("#signInForm").style.display = isRegister ? "none" : "block";
  qs("#registerForm").style.display = isRegister ? "block" : "none";
}

qs("#tabSignIn")?.addEventListener("click", () => switchAuthTab(false));
qs("#tabRegister")?.addEventListener("click", () => switchAuthTab(true));

window.fillDemoUser = function(email, password, role) {
  const emailInput = qs("#loginEmail");
  const passInput = qs("#loginPassword");
  const roleInput = qs("#loginRole");
  if(emailInput) emailInput.value = email;
  if(passInput) passInput.value = password;
  if(roleInput) roleInput.value = role;
  toast(`Selected demo credentials for ${role}`, 'info');
};

async function doLogin() {
  const emailInput = qs("#loginEmail")?.value.trim();
  const passInput = qs("#loginPassword")?.value.trim();
  const selectedRole = qs("#loginRole")?.value || "Procurement Officer";
  const loginBtn = qs("#loginButton");

  if(!emailInput || !passInput) {
    toast("Please enter both your email and password.", "warn");
    return;
  }

  if(loginBtn) {
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="btn-icon">⏳</span> Verifying Credentials...';
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailInput,
        password: passInput
      })
    });

    const data = await res.json();
    if(!res.ok) {
      toast(`❌ Login Failed: ${data.error || "Invalid credentials."}`, "error");
      if(loginBtn) {
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<span class="btn-icon">🔐</span> Sign In to Standards Sahayak';
      }
      return;
    }

    const user = data.user;
    if(selectedRole && user.role !== selectedRole) {
      user.role = selectedRole;
    }

    currentUser = {
      ...user,
      avatar: user.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()
    };

    localStorage.setItem("standards_user_session", JSON.stringify(currentUser));
    updateUserDisplay();

    const overlay = qs("#loginOverlay");
    const shell   = qs("#appShell");
    overlay.style.animation = "fadeUp .3s ease reverse";
    setTimeout(()=>{ overlay.style.display="none"; shell.style.display=""; }, 280);

    toast(`✅ Welcome back, ${currentUser.name}! Signed in as ${currentUser.role}.`, "success");
    addAudit(`authenticated successfully with verified credentials as ${currentUser.role}.`);
    notify(`Welcome back, ${currentUser.name}. Active role: ${currentUser.role}.`);
    updateRoleVisibility(currentUser.role);
    fetchAndRenderUsers();
  } catch(err) {
    toast(`Server connection error: ${err.message}`, "error");
    console.error("[Login]", err);
  } finally {
    if(loginBtn) {
      loginBtn.disabled = false;
      loginBtn.innerHTML = '<span class="btn-icon">🔐</span> Sign In to Standards Sahayak';
    }
  }
}

async function doRegister() {
  const name = qs("#regName")?.value.trim();
  const email = qs("#regEmail")?.value.trim();
  const org = qs("#regOrg")?.value.trim();
  const designation = qs("#regDesignation")?.value.trim() || "";
  const role = qs("#regRole")?.value || "Procurement Officer";
  const pass = qs("#regPassword")?.value.trim();
  const regBtn = qs("#registerButton");

  if(!name || !email || !org || !pass) {
    toast("Please fill in all mandatory registration fields (*).", "warn");
    return;
  }

  if(pass.length < 6) {
    toast("Password must be at least 6 characters long.", "warn");
    return;
  }

  if(regBtn) {
    regBtn.disabled = true;
    regBtn.innerHTML = '<span class="btn-icon">⏳</span> Creating Account in Database...';
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        org,
        designation,
        role,
        password: pass
      })
    });

    const data = await res.json();
    if(!res.ok) {
      toast(`❌ Registration Failed: ${data.error || "Could not register account."}`, "error");
      if(regBtn) {
        regBtn.disabled = false;
        regBtn.innerHTML = '<span class="btn-icon">✅</span> Create Account & Enter Platform';
      }
      return;
    }

    const newUser = data.user;
    currentUser = {
      ...newUser,
      avatar: name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()
    };

    localStorage.setItem("standards_user_session", JSON.stringify(currentUser));
    updateUserDisplay();

    const overlay = qs("#loginOverlay");
    const shell   = qs("#appShell");
    overlay.style.animation = "fadeUp .3s ease reverse";
    setTimeout(()=>{ overlay.style.display="none"; shell.style.display=""; }, 280);

    toast(`🎉 Account created and stored in database for ${currentUser.name}!`, "success");
    addAudit(`created new verified account as ${currentUser.role} (${currentUser.org}).`);
    notify(`Account created successfully for ${currentUser.name}!`);
    updateRoleVisibility(currentUser.role);
    fetchAndRenderUsers();
  } catch(err) {
    toast(`Server error during registration: ${err.message}`, "error");
    console.error("[Register]", err);
  } finally {
    if(regBtn) {
      regBtn.disabled = false;
      regBtn.innerHTML = '<span class="btn-icon">✅</span> Create Account & Enter Platform';
    }
  }
}

function updateUserDisplay() {
  if(qs("#sidebarUserName")) qs("#sidebarUserName").textContent = currentUser.name;
  if(qs("#sidebarUserEmail")) qs("#sidebarUserEmail").textContent = currentUser.email;
  if(qs("#sidebarAvatar")) qs("#sidebarAvatar").textContent = currentUser.avatar || "PO";
  if(qs("#role")) qs("#role").value = currentUser.role;
}

qs("#loginButton")?.addEventListener("click", doLogin);
qs("#registerButton")?.addEventListener("click", doRegister);
qs("#loginPassword")?.addEventListener("keydown", e => { if(e.key === "Enter") doLogin(); });
qs("#loginEmail")?.addEventListener("keydown", e => { if(e.key === "Enter") doLogin(); });
qs("#regPassword")?.addEventListener("keydown", e => { if(e.key === "Enter") doRegister(); });
qs("#logoutButton")?.addEventListener("click", ()=>{
  localStorage.removeItem("standards_user_session");
  qs("#appShell").style.display="none";
  qs("#loginOverlay").style.display="flex";
  qs("#loginOverlay").style.animation="fadeUp .5s ease";
  switchAuthTab(false);
  toast("Signed out successfully.", "info");
});

// ── Dark mode ──────────────────────────────────────────────────
function applyTheme(dark) {
  document.documentElement.setAttribute("data-theme", dark?"dark":"light");
  qs("#themeIcon").textContent  = dark?"☀️":"🌙";
  qs("#themeLabel").textContent = dark?"Light mode":"Dark mode";
  localStorage.setItem("theme", dark?"dark":"light");
}
qs("#themeToggle")?.addEventListener("click", ()=>{
  applyTheme(document.documentElement.getAttribute("data-theme")!=="dark");
});
applyTheme(localStorage.getItem("theme")==="dark");

// ── Project Approval State Machine ─────────────────────────────
const STAGES_ORDER = ["draft", "ai_analysis", "officer_review", "tech_review", "published", "compliance_review"];

function setProjectStage(stage) {
  currentProjectStage = stage;
  const stageIdx = STAGES_ORDER.indexOf(stage);
  
  document.querySelectorAll(".step-node").forEach((node, i) => {
    const nodeStage = node.dataset.step;
    const nodeIdx = STAGES_ORDER.indexOf(nodeStage);
    node.classList.remove("done", "active");
    if(nodeIdx < stageIdx) node.classList.add("done");
    else if(nodeIdx === stageIdx) node.classList.add("active");
  });

  document.querySelectorAll(".step-connector").forEach((conn, i) => {
    conn.classList.toggle("done", i < stageIdx);
  });

  const titles = {
    draft: "Tender Draft Mode",
    ai_analysis: "AI Specification & Standards Analysis",
    officer_review: "Procurement Officer Technical Review",
    tech_review: "Standards Expert Technical Validation",
    published: "Tender Published on GeM / CPPP",
    compliance_review: "Final Technical Compliance Verified"
  };

  notify(`Project advanced to: ${titles[stage] || stage}`);
  addAudit(`project stage updated to ${stage.toUpperCase()}`);
}

qs("#btnSubmitForReview")?.addEventListener("click", () => {
  setProjectStage("tech_review");
  toast("Tender submitted to Technical Reviewer for validation!", "success");
  if(currentUser.role === "Technical Reviewer" || currentUser.role === "System Administrator") {
    qs("#techReviewSection")?.scrollIntoView({ behavior: "smooth" });
  }
});

qs("#btnFinalizeAndPublish")?.addEventListener("click", () => {
  setProjectStage("published");
  toast("Tender requirements finalized and published to GeM / CPPP portal!", "success");
});

qs("#btnApproveTechReview")?.addEventListener("click", () => {
  const notes = qs("#techJustificationInput")?.value.trim() || "All recommended IS standards and QCO orders verified.";
  qs("#techReviewStatusBadge").textContent = "✓ Technical Approved";
  qs("#techReviewStatusBadge").className = "pill green";
  setProjectStage("published");
  addAudit(`Technical Reviewer approved standards: "${notes.slice(0, 60)}..."`);
  toast("Technical validation approved! Tender ready for publishing.", "success");
});

qs("#btnRequestClarification")?.addEventListener("click", () => {
  setProjectStage("officer_review");
  qs("#techReviewStatusBadge").textContent = "⚠️ Clarification Requested";
  qs("#techReviewStatusBadge").className = "pill amber";
  addAudit("Technical Reviewer requested clarification on tender testing scope.");
  toast("Clarification request sent to Procurement Officer.", "warn");
});

qs("#btnSubmitVendorCompliance")?.addEventListener("click", () => {
  setProjectStage("compliance_review");
  qs("#vendorSubmissionStatusBadge").textContent = "✓ Compliance Submitted";
  addAudit("Contractor/Vendor submitted complete compliance pack with BIS certificates.");
  toast("Vendor compliance package submitted successfully for evaluation!", "success");
});

// ── 3-Role RBAC Visibility ─────────────────────────────────────
function updateRoleVisibility(role) {
  const isOfficer  = (role === "Procurement Officer");
  const isStdsAdmin = (role === "Standards Administrator");
  const isAdmin    = (role === "System Administrator");

  const lookupSec   = qs("#lookup");
  const resultsSec  = qs("#results");
  const graphSec    = qs("#graph");
  const auditSec    = qs("#audit");
  const adminSec    = qs("#admin");
  const stdsMgmtSec = qs("#stdsMgmtSection");
  const lifeBar     = qs("#projectLifecycleBar");

  const navLookup   = qs("#navLookupLink");
  const navResults  = qs("#navResultsLink");
  const navGraph    = qs("#navGraphLink");
  const navAudit    = qs("#navAuditLink");
  const navAdmin    = qs("#navAdminLink");
  const navStdsMgmt = qs("#navStdsMgmtLink");

  // All roles see the core analysis and chatbot
  [lookupSec, resultsSec, graphSec, auditSec].forEach(el => el && (el.style.display = ""));
  [navLookup, navResults, navGraph, navAudit].forEach(el => el && (el.style.display = ""));

  if(isOfficer) {
    if(stdsMgmtSec) stdsMgmtSec.style.display = "none";
    if(adminSec)    adminSec.style.display    = "none";
    if(lifeBar)     lifeBar.style.display     = "";
    if(navStdsMgmt) navStdsMgmt.style.display = "none";
    if(navAdmin)    navAdmin.style.display    = "none";
    qs("#roleHelp").textContent = "Primary Workspace: Draft specs, run AI RAG, accept/reject & generate GeM clauses";

  } else if(isStdsAdmin) {
    if(stdsMgmtSec) stdsMgmtSec.style.display = "";
    if(adminSec)    adminSec.style.display    = "none";
    if(lifeBar)     lifeBar.style.display     = "";
    if(navStdsMgmt) navStdsMgmt.style.display = "";
    if(navAdmin)    navAdmin.style.display    = "none";
    qs("#roleHelp").textContent = "Standards Administrator: Manage BIS knowledge base, curated standards, graph & feedback analytics";
    loadStandardsMgmtStatus();

  } else if(isAdmin) {
    if(stdsMgmtSec) stdsMgmtSec.style.display = "";
    if(adminSec)    adminSec.style.display    = "";
    if(lifeBar)     lifeBar.style.display     = "";
    if(navStdsMgmt) navStdsMgmt.style.display = "";
    if(navAdmin)    navAdmin.style.display    = "";
    qs("#roleHelp").textContent = "System Administrator: User management, database ingestion & SLA telemetry";
    renderUsersTable();
    loadStandardsMgmtStatus();
  }
}

// ── Admin User Directory ───────────────────────────────────────
async function fetchAndRenderUsers() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/users`);
    if(res.ok) {
      const data = await res.json();
      if(data.users && Array.isArray(data.users)) {
        systemUsers = data.users;
        renderUsersTable();
      }
    }
  } catch(e) {
    console.warn("[Users] Could not load users from API:", e);
    renderUsersTable();
  }
}

function renderUsersTable() {
  const container = qs("#usersTableBody");
  if(!container) return;
  if(!systemUsers.length) {
    container.innerHTML = `<div style="padding: 16px; text-align: center; color: var(--ink-muted);">Loading user directory from database...</div>`;
    return;
  }
  container.innerHTML = systemUsers.map(u => `
    <div class="user-row">
      <div>
        <strong>${escHtml(u.name)}</strong>
        <span style="display:block;font-size:.78rem;color:var(--ink-muted)">${escHtml(u.email)}</span>
      </div>
      <div>
        <span class="user-role-badge">${escHtml(u.role)}</span>
      </div>
      <div>${escHtml(u.org || "Government / PSU")}</div>
      <div><span class="user-status-tag ${String(u.status||'Active').toLowerCase()}">${u.status || 'Active'}</span></div>
      <div style="display:flex;gap:6px;align-items:center;">
        <button class="compact-btn" style="padding:4px 8px;font-size:.75rem" onclick="toggleUserStatus('${u.id}')">
          ${u.status==='Active'?'Disable':'Activate'}
        </button>
        <button class="compact-btn" style="padding:4px 8px;font-size:.75rem;color:var(--red);border-color:rgba(185,28,28,0.35);" title="Delete user" onclick="deleteUser('${u.id}', '${escHtml(u.name)}')">
          🗑️
        </button>
      </div>
    </div>
  `).join("");
}

window.toggleUserStatus = async function(id) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/users/toggle-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    const data = await res.json();
    if(res.ok && data.user) {
      const idx = systemUsers.findIndex(u => u.id === id);
      if(idx !== -1) systemUsers[idx] = data.user;
      renderUsersTable();
      toast(`User ${data.user.name} is now ${data.user.status}.`, "info");
      addAudit(`Admin toggled status of ${data.user.name} to ${data.user.status}.`);
    } else {
      toast(`Could not update user: ${data.error || "Unknown error"}`, "error");
    }
  } catch(err) {
    toast(`Error toggling user status: ${err.message}`, "error");
  }
};

window.deleteUser = async function(id, userName) {
  if(!confirm(`Are you sure you want to delete user '${userName}' from the database?`)) return;
  try {
    const res = await fetch(`${API_BASE}/api/auth/users/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
    const data = await res.json();
    if(res.ok) {
      systemUsers = systemUsers.filter(u => u.id !== id);
      renderUsersTable();
      toast(`User '${userName}' removed from database.`, "success");
      addAudit(`Admin deleted user ${userName} (${id}).`);
    } else {
      toast(`Could not delete user: ${data.error || "Unknown error"}`, "error");
    }
  } catch(err) {
    toast(`Error deleting user: ${err.message}`, "error");
  }
};

qs("#btnAdminAddUser")?.addEventListener("click", () => {
  switchAuthTab(true);
  qs("#loginOverlay").style.display = "flex";
  qs("#loginOverlay").style.animation = "fadeUp .3s ease";
  qs("#regName")?.focus();
  toast("Opening user registration form...", "info");
});

window.changeUserRole = function(id, newRole) {
  const user = systemUsers.find(u => u.id === id);
  if(user) {
    user.role = newRole;
    addAudit(`Admin changed role of ${user.name} to ${newRole}.`);
    toast(`Updated ${user.name} role to ${newRole}.`, "success");
  }
};

// ── Multi-Format Input Tabs & Presets (Feature 1) ─────────────
const SAMPLE_TENDERS = {
  motor: "Supply of 100 three-phase squirrel cage induction motors, 415V, 50Hz, suitable for industrial applications, with minimum efficiency requirements and appropriate safety provisions.",
  outdated_motor: "Procurement of 50 Nos. 3-phase induction motors conforming to IS 325:1996, 415V, 50Hz, IE3 efficiency for municipal pumping station.",
  led: "We intend to procure 500 LED street lighting luminaires with high surge protection (>=4kV) and IP66 ingress protection for municipal highways and public street lighting.",
  tmt: "Supply and delivery of 500 MT High Strength Deformed Steel Bars Grade Fe 500D for reinforced concrete bridge pier construction conforming to latest revisions.",
  cement: "Supply of 2000 bags of 43 Grade Ordinary Portland Cement (OPC) for structural concrete works conforming to BIS standards.",
  cables: "Supply of 1100V grade PVC insulated heavy duty armoured copper conductor electrical cables conforming to BIS specifications for hospital power distribution.",
  pipes: "Supply of 300mm nominal diameter centrifugal ductile iron pressure pipes with socket and spigot ends Class K9 for urban drinking water transmission pipeline.",
  solar: "Design, supply, and installation of 100 kW grid-connected rooftop solar photovoltaic power plant with monocrystalline silicon modules as per BIS standards."
};

const MULTI_LANG_SAMPLES = {
  hi: "औद्योगिक अनुप्रयोगों के लिए 100 थ्री-फेज स्क्वायरल केज इंडक्शन मोटर्स की आपूर्ति, 415V, 50Hz, न्यूनतम दक्षता आवश्यकताओं और उपयुक्त सुरक्षा प्रावधानों के साथ।",
  kn: "ಕೈಗಾರಿಕಾ ಉದ್ದೇಶಗಳಿಗಾಗಿ 100 ಮೂರು-ಹಂತದ ಇಂಡಕ್ಷನ್ ಮೋಟರ್‌ಗಳ ಪೂರೈಕೆ, 415V, 50Hz, IE3 ದಕ್ಷತೆ ಮತ್ತು ಸೂಕ್ತ ಸುರಕ್ಷತಾ ಮಾನದಂಡಗಳೊಂದಿಗೆ.",
  te: "పారిశ్రామిక అవసరాల కోసం 100 త్రీ-ఫేజ్ స్క్విరల్ కేజ్ ఇండక్షన్ మోటార్ల సరఫరా, 415V, 50Hz, కనీస సామర్థ్యం మరియు సరైన భద్రతా నిబంధనలతో.",
  ta: "தொழில்துறை பயன்பாடுகளுக்கான 100 மூன்று-கட்ட தூண்டல் மோட்டார்கள் வழங்கல், 415V, 50Hz, குறைந்தபட்ச திறன் மற்றும் பொருத்தமான பாதுகாப்புடன்.",
  mr: "औद्योगिक वापरासाठी 100 थ्री-फेज इंडक्शन मोटर्सचा पुरवठा, 415V, 50Hz, किमान कार्यक्षमता आणि योग्य सुरक्षा तरतुदींसह."
};

// Input Format Tabs Switching
document.querySelectorAll(".input-mode-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".input-mode-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    const mode = tab.dataset.tab;

    qs("#tabContentNatural").style.display    = (mode === "natural") ? "block" : "none";
    qs("#tabContentStructured").style.display = (mode === "structured") ? "block" : "none";
    qs("#tabContentDocument").style.display   = (mode === "document") ? "block" : "none";
    qs("#tabContentMultilingual").style.display = (mode === "multilingual") ? "block" : "none";
  });
});

// Structured Form Apply Button
qs("#btnApplyStructuredForm")?.addEventListener("click", () => {
  const prod = qs("#formProduct")?.value.trim() || "Three-Phase Squirrel Cage Induction Motor";
  const volt = qs("#formVoltage")?.value.trim() || "415V";
  const freq = qs("#formFrequency")?.value.trim() || "50 Hz";
  const phase = qs("#formPhase")?.value || "3 Phase";
  const pwr  = qs("#formPower")?.value.trim() || "15 kW";
  const eff  = qs("#formEfficiency")?.value || "IE3 (Premium Efficiency as per IS 12615)";
  const prot = qs("#formProtection")?.value || "IP55 (Dust & Water Jet Protected)";
  const app  = qs("#formApplication")?.value.trim() || "Industrial continuous duty drives";

  const syntheticQuery = `Supply of 100 ${prod}, rated for ${volt}, ${freq}, ${phase}, ${pwr}, conforming to ${eff} and ${prot}, suitable for ${app}.`;
  qs("#queryInput").value = syntheticQuery;
  const preview = qs("#translationText");
  if(preview) preview.textContent = syntheticQuery;

  // Switch to natural tab and notify
  document.querySelector(".input-mode-tab[data-tab='natural']")?.click();
  toast("Structured technical parameters applied to workspace!", "success");
  runPipeline();
});

// Multilingual regional language buttons
document.querySelectorAll("[data-lang-preset]").forEach(btn => {
  btn.addEventListener("click", () => {
    const lang = btn.dataset.langPreset;
    if(MULTI_LANG_SAMPLES[lang]) {
      document.querySelectorAll("[data-lang-preset]").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      qs("#queryInput").value = MULTI_LANG_SAMPLES[lang];
      qs("#translationText").textContent = MULTI_LANG_SAMPLES[lang];
      qs("#detectedLangTag").textContent = btn.textContent.split(" ")[0];
      toast(`Loaded ${btn.textContent.trim()} specification. Click Run to analyze!`, "info");
      document.querySelector(".input-mode-tab[data-tab='natural']")?.click();
      runPipeline();
    }
  });
});

// ── Pipeline Animation & Recommendation Execution ──────────────
const PIPELINE_STAGES = [
  "Input Processing (PDF/DOCX/Text)",
  "Multilingual Detection & Normalization",
  "NLP Technical Parameter Extraction",
  "Hybrid Vector & Keyword BM25 Retrieval",
  "Standards Knowledge Graph Expansion",
  "Calibrated Multi-Criteria Ranking",
  "Revision & Amendment Gazette Check",
  "Statutory QCO Certification Engine",
  "Tender Defect & Risk Detection",
  "Grounded RAG Reasoning & Procurement Report"
];

const PIPELINE_STAGES_KN = [
  "ಇನ್‌ಪುಟ್ ಪ್ರಕ್ರಿಯೆ (PDF/DOCX/ಪಠ್ಯ)",
  "ಬಹುಭಾಷಾ ಪತ್ತೆ & ಸಾಮಾನ್ಯೀಕರಣ",
  "NLP ತಾಂತ್ರಿಕ ನಿಯತಾಂಕಗಳ ಹೊರತೆಗೆಯುವಿಕೆ",
  "ಹೈಬ್ರಿಡ್ ವೆಕ್ಟರ್ & ಕೀವರ್ಡ್ BM25 ಮರುಪಡೆಯುವಿಕೆ",
  "ಮಾನದಂಡಗಳ ಜ್ಞಾನ ನಕ್ಷೆಯ ವಿಸ್ತರಣೆ",
  "ಕ್ಯಾಲಿಬ್ರೇಟೆಡ್ ಬಹು-ಮಾನದಂಡ ಶ್ರೇಯಾಂಕ",
  "ಗೆಜೆಟ್ ತಿದ್ದುಪಡಿ & ಆವೃತ್ತಿ ಪರಿಶೀಲನೆ",
  "ಶಾಸನಬದ್ಧ QCO ಪ್ರಮಾಣೀಕರಣ ಎಂಜಿನ್",
  "ಟೆಂಡರ್ ದೋಷ & ಅಪಾಯ ಪತ್ತೆ",
  "ಆಧಾರಿತ RAG ಖರೀದಿ ವರದಿ ರಚನೆ"
];

function renderStages(activeIndex=PIPELINE_STAGES.length-1, running=false){
  const lang = (typeof getCurrentLanguage === "function") ? getCurrentLanguage() : "en-IN";
  const stages = (lang === "kn-IN") ? PIPELINE_STAGES_KN : PIPELINE_STAGES;
  const list = qs("#stageList");
  if(list) {
    list.innerHTML = stages.map((s,i)=>{
      const state = running ? (i<activeIndex?"done":i===activeIndex?"active":"") : "done";
      return `<div class="stage ${state}"><span>${i+1}</span><p>${s}</p></div>`;
    }).join("");
  }
}

async function runPipeline() {
  const query = qs("#queryInput").value.trim();
  if(!query){ toast("Please enter a specification or tender text.","warn"); return; }
  const btn = qs("#runPipeline");
  btn.disabled = true; btn.innerHTML = "<span>⏳</span> Analyzing…";
  notify("Recommendation engine analyzing tender specification...");
  addAudit(`initiated standards recommendation pipeline for "${query.slice(0,40)}..."`);

  const lang = (typeof getCurrentLanguage === "function") ? getCurrentLanguage() : "en-IN";
  const stages = (lang === "kn-IN") ? PIPELINE_STAGES_KN : PIPELINE_STAGES;

  // Animate stages smoothly
  for(let i=0;i<stages.length;i++){
    await new Promise(r=>setTimeout(r,120));
    const pct = Math.round(((i+1)/stages.length)*100);
    qs("#stageTitle").textContent = stages[i];
    qs("#progressNumber").textContent = pct+"%";
    qs("#progressBar").style.width = pct+"%";
    renderStages(i,true);
  }

  // Call backend API
  try {
    const res = await fetch(`${API_BASE}/api/recommend`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({query, top_k:8})
    });
    if(!res.ok) throw new Error(`Server error ${res.status}`);
    currentResults = await res.json();

    if(currentResults.recommendations && currentResults.recommendations.length > 0){
      selectedId = currentResults.recommendations[0].standard_number;
    }
    
    // Update translation and lang tag
    if(currentResults.language_info) {
      const tag = qs("#detectedLangTag");
      if(tag) tag.textContent = currentResults.language_info.detected_language || "English";
    }

    renderAll();
    notify(`Recommendations ready: ${currentResults.recommendations.length} applicable standards identified.`);
    addAudit(`generated ${currentResults.recommendations.length} ranked IS recommendations.`);
  } catch(e) {
    toast("Backend error: "+e.message+". Is app.py running?","error");
    console.error(e);
  }

  btn.disabled=false; btn.innerHTML="<span>▶</span> Run Intelligence Engine";
  qs("#stageTitle").textContent = (lang === "kn-IN") ? "ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ" : "Ready with latest run";
  renderStages(stages.length-1,false);
}

qs("#runPipeline")?.addEventListener("click", runPipeline);
qs("#analyzeQueryBtn")?.addEventListener("click", runPipeline);

// ── Render Tender Defect Alerts (Feature 13, 14, 15) ────────────
function renderTenderDefects(defects) {
  const sec = qs("#tenderDefectSection");
  const container = qs("#defectCardsContainer");
  const countPill = qs("#defectTotalCount");
  if(!sec || !container) return;

  if(!defects || defects.total_issues === 0) {
    sec.style.display = "none";
    return;
  }

  const lang = (typeof getCurrentLanguage === "function") ? getCurrentLanguage() : "en-IN";
  sec.style.display = "block";
  countPill.textContent = (lang === "kn-IN") ? `${defects.total_issues} ದೋಷಗಳು ಪತ್ತೆಯಾಗಿವೆ` : `${defects.total_issues} Defect(s) Detected`;

  let html = "";

  // 1. Outdated Standards Alerts
  (defects.outdated_standards || []).forEach(item => {
    const headerBadge = (lang === "kn-IN") ? "⚠️ ಹಳೆಯ / ಅಮಾನ್ಯ ಮಾನದಂಡ ಪತ್ತೆಯಾಗಿದೆ" : "⚠️ OUTDATED / SUPERSEDED STANDARD DETECTED";
    const riskBadge = (lang === "kn-IN") ? "ಅಪಾಯ: GFR ಉಲ್ಲಂಘನೆ" : "High Risk · GFR Violation";
    const refText = (lang === "kn-IN") ? `ಟೆಂಡರ್ ಉಲ್ಲೇಖ: ${escHtml(item.mentioned_standard)} (${escHtml(item.title)})` : `Tender references: ${escHtml(item.mentioned_standard)} (${escHtml(item.title)})`;
    const riskText = (lang === "kn-IN") ? `ಅಪಾಯ: ಈ ಮಾನದಂಡವನ್ನು BIS ಹಿಂಪಡೆದಿದೆ ಮತ್ತು ಅಮಾನ್ಯಗೊಳಿಸಿದೆ. ಬಿಡ್ಡರ್‌ಗಳು ಇದರ ಅಡಿಯಲ್ಲಿ ISI ಪರವಾನಗಿ ಪಡೆಯಲು ಸಾಧ್ಯವಿಲ್ಲ.` : `Risk: ${escHtml(item.risk)}`;
    const actionText = (lang === "kn-IN") ? `ಅಗತ್ಯ ಕ್ರಮ: ಟೆಂಡರ್‌ನಲ್ಲಿ ${item.mentioned_standard} ಬದಲಿಗೆ ${item.recommended_replacement} ನಮೂದಿಸಿ.` : `Action Required: ${escHtml(item.remedy)}`;
    const replaceBtnText = (lang === "kn-IN") ? "🔄 ವಿವರಣೆಯಲ್ಲಿ ಬದಲಾಯಿಸಿ" : "🔄 Replace in Specification";

    html += `
      <div class="defect-card superseded">
        <div class="defect-card-top">
          <span>${headerBadge}</span>
          <span class="badge-mini" style="background:#fee2e2;color:#991b1b;border-color:#f87171">${riskBadge}</span>
        </div>
        <div>
          <strong>${refText}</strong>
          <p class="defect-card-risk">${riskText}</p>
        </div>
        <div class="defect-card-remedy">
          <span>${actionText}</span>
          <button class="compact-btn" style="background:#fff;color:#991b1b;border:1px solid #f87171" onclick="replaceTenderStandard('${escHtml(item.mentioned_standard)}', '${escHtml(item.recommended_replacement)}')">
            ${replaceBtnText}
          </button>
        </div>
      </div>
    `;
  });

  // 2. Missing Standards Alerts
  (defects.missing_standards || []).forEach(item => {
    const headerBadge = (lang === "kn-IN") ? "⚠️ ಕಡ್ಡಾಯ ಪರೀಕ್ಷಾ ಮಾನದಂಡ ಕಾಣೆಯಾಗಿದೆ" : "⚠️ MISSING MANDATORY ALLIED STANDARD";
    const unrefText = (lang === "kn-IN") ? `ಉಲ್ಲೇಖಿಸದ ಅಗತ್ಯ ಕೋಡ್: ${escHtml(item.missing_standard)} — ${escHtml(item.title)}` : `Unreferenced Essential Code: ${escHtml(item.missing_standard)} — ${escHtml(item.title)}`;
    const riskText = (lang === "kn-IN") ? `ಅಪಾಯ: ತಾಪಮಾನ ಏರಿಕೆ ಮತ್ತು ದಕ್ಷತೆಯ ಅನುಸರಣಾ ಪರೀಕ್ಷೆಗಳನ್ನು ಕರಾರಿನಂತೆ ಜಾರಿಗೊಳಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ.` : `Risk: ${escHtml(item.risk)}`;
    const actionText = (lang === "kn-IN") ? `ಶಿಫಾರಸು: ತಾಂತ್ರಿಕ ವಿವರಣೆಯ ತಪಾಸಣೆ & ಸ್ವೀಕಾರ ಪರೀಕ್ಷೆಯ ಅಡಿಯಲ್ಲಿ ${item.missing_standard} ಸೇರಿಸಿ.` : `Recommendation: ${escHtml(item.action)}`;
    const addBtnText = (lang === "kn-IN") ? "➕ ತಪಾಸಣಾ ವ್ಯಾಪ್ತಿಗೆ ಸೇರಿಸಿ" : "➕ Add to Inspection Scope";

    html += `
      <div class="defect-card missing">
        <div class="defect-card-top">
          <span>${headerBadge}</span>
          <span class="badge-mini" style="background:#fef3c7;color:#92400e;border-color:#fcd34d">${escHtml(item.category)}</span>
        </div>
        <div>
          <strong>${unrefText}</strong>
          <p class="defect-card-risk">${riskText}</p>
        </div>
        <div class="defect-card-remedy">
          <span>${actionText}</span>
          <button class="compact-btn" style="background:#fff;color:#92400e;border:1px solid #fcd34d" onclick="addMissingStandardClause('${escHtml(item.missing_standard)}')">
            ${addBtnText}
          </button>
        </div>
      </div>
    `;
  });

  // 3. Conflict Alerts
  (defects.conflicts || []).forEach(item => {
    const headerBadge = (lang === "kn-IN") ? "⚠️ ವಿಶೇಷಣಗಳ ಸಂಘರ್ಷ / ಹೊಂದಾಣಿಕೆಯಿಲ್ಲ" : "⚠️ SPECIFICATION CONFLICT / INCONSISTENCY";
    const titleText = (lang === "kn-IN") ? "ವಿರುದ್ಧ ಮಾನದಂಡ ಉಲ್ಲೇಖ vs ದಕ್ಷತೆಯ ಅಗತ್ಯತೆ" : escHtml(item.title);
    const detailText = (lang === "kn-IN") ? "ಟೆಂಡರ್ ಹಳೆಯ IS 325 ಅನ್ನು ಉಲ್ಲೇಖಿಸುತ್ತಾ 'IE3 ಕನಿಷ್ಠ ದಕ್ಷತೆ' ಬೇಡುತ್ತದೆ. IS 325 ನಲ್ಲಿ IE3 ಗೆ ಯಾವುದೇ ಅವಕಾಶವಿಲ್ಲ." : escHtml(item.conflict_detail);
    const resText = (lang === "kn-IN") ? "ಪರಿಹಾರ: IS 12615:2018 ಅನ್ನು ಕಡ್ಡಾಯವಾಗಿ ನಮೂದಿಸಬೇಕು, ಏಕೆಂದರೆ ಇದು IE3 ದಕ್ಷತೆಯ ವರ್ಗವನ್ನು ನಿಯಂತ್ರಿಸುತ್ತದೆ." : escHtml(item.resolution);

    html += `
      <div class="defect-card conflict">
        <div class="defect-card-top">
          <span>${headerBadge}</span>
          <span class="badge-mini" style="background:#ede9fe;color:#5b21b6;border-color:#c4b5fd">Critical Conflict</span>
        </div>
        <div>
          <strong>${titleText}</strong>
          <p class="defect-card-risk">${detailText}</p>
        </div>
        <div class="defect-card-remedy">
          <span>${(lang === "kn-IN") ? "ಪರಿಹಾರ: " : "Resolution: "}${resText}</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

window.replaceTenderStandard = function(oldStd, newStd) {
  const textarea = qs("#queryInput");
  if(textarea) {
    const rawNum = oldStd.split(":")[0];
    textarea.value = textarea.value.replace(new RegExp(rawNum + "(:\\d{4})?", "g"), newStd);
    toast(`Updated specification: Replaced ${oldStd} with ${newStd}!`, "success");
    addAudit(`Officer corrected tender clause: Replaced ${oldStd} with ${newStd}.`);
    runPipeline();
  }
};

window.addMissingStandardClause = function(stdNum) {
  const textarea = qs("#queryInput");
  if(textarea) {
    textarea.value += ` Acceptance testing and quality compliance shall strictly adhere to ${stdNum}.`;
    toast(`Appended ${stdNum} to tender specification!`, "success");
    addAudit(`Officer added missing standard ${stdNum} to inspection scope.`);
    runPipeline();
  }
};

// ── Render Extracted Entities & Technical Parameters (Feature 2 & 3) ────────
function renderEntities(data) {
  if(!data) return;
  const p = data.extracted_parameters || {};
  const lang = (typeof getCurrentLanguage === "function") ? getCurrentLanguage() : "en-IN";
  const summaryBox = qs("#ragSummaryText");
  if(summaryBox && data.summary) {
    if(lang === "kn-IN") {
      summaryBox.textContent = `ಟೆಂಡರ್ ಅವಶ್ಯಕತೆಗಳ ವಿಶ್ಲೇಷಣೆ: ${p.product || "ಮೂರು-ಹಂತದ ಇಂಡಕ್ಷನ್ ಮೋಟರ್"} (${p.voltage || "415V"}, ${p.frequency || "50Hz"}, ${p.efficiency || "IE3 ದಕ್ಷತೆ"}). ಪ್ರಾಥಮಿಕ ಮಾನದಂಡ IS 12615:2018 ಅನ್ವಯಿಸುತ್ತದೆ. ವಿದ್ಯುತ್ ಮೋಟರ್‌ಗಳ QCO ಅಡಿಯಲ್ಲಿ ಕಡ್ಡಾಯ ISI ಮಾರ್ಕ್ ಪ್ರಮಾಣೀಕರಣ ಅನ್ವಯಿಸುತ್ತದೆ.`;
    } else {
      summaryBox.textContent = data.summary;
    }
  }

  const grid = qs("#entityGrid");
  if(!grid) return;

  const items = [
    ["Product Designation", p.product || "—"],
    ["Operating Voltage", p.voltage || "415V"],
    ["System Frequency", p.frequency || "50 Hz"],
    ["Phase Configuration", p.phase || "3 Phase"],
    ["Power Rating", p.power || "Standard Duty"],
    ["Efficiency Class", p.efficiency || "IE3 (Premium)"],
    ["Ingress Protection", p.protection || "IP55"],
    ["Application Domain", p.application || "Industrial Drives"],
    ["Duty Cycle", p.duty_type || "Continuous S1"],
    ["Likely ICS Classification", (p.ics_codes||[]).join(", ") || "29.160.30"],
    ["Statutory Compliance", (p.procurement_risks||[])[0] || "Mandatory BIS ISI Mark under QCO"]
  ];

  grid.innerHTML = items.map(([label, val]) => {
    const localizedLabel = (typeof translateParamLabel === "function") ? translateParamLabel(label, lang) : label;
    return `
      <div class="entity-card">
        <span>${escHtml(localizedLabel)}</span>
        <strong>${escHtml(val)}</strong>
      </div>
    `;
  }).join("");
}

// ── Render Standards List (Feature 7, 10, 11) ──────────────────
function getFiltered(){
  if(!currentResults||!currentResults.recommendations) return [];
  const search = (qs("#searchInput")?.value||"").toLowerCase().trim();
  const status = qs("#statusFilter")?.value||"all";
  const sortBy = qs("#sortBy")?.value||"confidence";

  let list = currentResults.recommendations.filter(r=>{
    const blob = `${r.standard_number} ${r.title} ${r.category} ${r.certification} ${r.relevance_category}`.toLowerCase();
    const matchSearch = !search || blob.includes(search);
    const matchStatus = status==="all" || r.status===status;
    const matchCat = catFilter==="all" || (catFilter==="qco" ? (r.certification||"").toLowerCase().includes("mandatory") : (catFilter==="withdrawn" ? r.status==="superseded" : r.category===catFilter));
    return matchSearch && matchStatus && matchCat;
  });

  list.sort((a,b)=>{
    if(sortBy==="confidence") return b.confidence-a.confidence;
    if(sortBy==="status") return a.status.localeCompare(b.status);
    return a.category.localeCompare(b.category);
  });
  return list;
}

function renderStandards(){
  const search = (qs("#searchInput")?.value||"").toLowerCase().trim();
  const list   = getFiltered();
  const count  = qs("#resultCount"); if(count) count.textContent=list.length;
  const badge  = qs("#navBadgeResults"); if(badge) badge.textContent=list.length;
  const lang   = (typeof getCurrentLanguage === "function") ? getCurrentLanguage() : "en-IN";

  if(!list.length){
    const emptyMsg = (lang === "kn-IN") ? "ಯಾವುದೇ ಮಾನದಂಡಗಳು ಹೊಂದಾಣಿಕೆಯಾಗುತ್ತಿಲ್ಲ. ಹುಡುಕಾಟ ಮಾನದಂಡವನ್ನು ಸರಿಹೊಂದಿಸಿ." : "No standards match your filters. Try adjusting search criteria.";
    qs("#standardsList").innerHTML=`<div class="empty-state"><div class="empty-icon">🔍</div><p>${emptyMsg}</p></div>`;
    return;
  }

  qs("#standardsList").innerHTML = list.map((rawItem,idx)=>{
    const r = (typeof translateStandard === "function") ? translateStandard(rawItem, lang) : rawItem;
    const displayTitle = r.localized_title || r.title;
    const displayCategory = r.localized_category || r.category;
    const isSup = r.status === "superseded";
    const warn = r.superseded_by ? `<div class="warning"><span class="warning-icon">⚠️</span>${(lang==="kn-IN")?"ಬದಲಾಯಿಸಲಾಗಿದೆ: ":"Superseded by: "}<strong>${escHtml(r.superseded_by)}</strong></div>` : "";
    const qco  = (r.certification||"").toLowerCase().includes("mandatory") ? `<span class="qco-badge">🏷️ ${(lang==="kn-IN")?"ಕಡ್ಡಾಯ QCO":"QCO Mandatory"}</span>` : "";
    const amd  = r.amendment_info ? `<div class="warning" style="background:var(--blue-light);color:var(--blue)">📝 ${escHtml(r.amendment_info)}</div>` : "";
    const fb   = r.feedback ? `<span class="feedback">✓ ${(lang==="kn-IN")?"ಅನುಮೋದಿಸಲಾಗಿದೆ":"Endorsed"}: ${escHtml(r.feedback)}</span>` : "";
    const chk  = compareIds.includes(r.standard_number) ? "checked" : "";

    const relClass = r.confidence >= 88 ? "high" : (r.confidence >= 75 ? "medium" : "potential");
    let relLabel = r.relevance_category || (r.confidence >= 88 ? "High Relevance" : "Medium Relevance");
    if(lang === "kn-IN") {
      relLabel = r.confidence >= 88 ? "ಹೆಚ್ಚಿನ ಪ್ರಸ್ತುತತೆ" : (r.confidence >= 75 ? "ಮಧ್ಯಮ ಪ್ರಸ್ತುತತೆ" : "ಸಂಭಾವ್ಯ ಪ್ರಸ್ತುತತೆ");
    }

    const btnAccept = (lang === "kn-IN") ? "✓ ಸ್ವೀಕರಿಸಿ" : "✓ Accept";
    const btnReject = (lang === "kn-IN") ? "✕ ತಿರಸ್ಕರಿಸಿ" : "✕ Reject";
    const btnEdit   = (lang === "kn-IN") ? "✎ ಬದಲಿಸಿ" : "✎ Edit";
    const lblCompare = (lang === "kn-IN") ? "ಹೋಲಿಕೆ" : "Compare";

    return `<article class="standard-card ${selectedId===r.standard_number?"selected":""}" data-select="${escHtml(r.standard_number)}" style="animation-delay:${idx*0.03}s">
      <div class="card-topline">
        <span class="relevance-pill ${relClass}">★ ${escHtml(relLabel)}</span>
        <div style="display:flex;gap:6px;align-items:center">
          <span class="status ${r.status}">${r.status}</span>
          ${qco}
          <span class="confidence">${r.confidence}%</span>
        </div>
      </div>
      <h3>${highlight(r.standard_number,search)}</h3>
      <p>${highlight(displayTitle,search)}</p>
      <div class="chip-row">
        <span>${escHtml(displayCategory)}</span>
        <span>${escHtml(r.edition||"Current Published")}</span>
      </div>
      ${warn}${amd}
      <div class="card-actions">
        <button data-feedback-btn="accepted" data-id="${escHtml(r.standard_number)}">${btnAccept}</button>
        <button data-feedback-btn="rejected" data-id="${escHtml(r.standard_number)}">${btnReject}</button>
        <button data-feedback-btn="edited"   data-id="${escHtml(r.standard_number)}">${btnEdit}</button>
        <label><input type="checkbox" data-compare="${escHtml(r.standard_number)}" ${chk}/> ${lblCompare}</label>
      </div>
      ${fb}
    </article>`;
  }).join("");
}

// ── Render Detail Panel & Why Checklist (Feature 12) ───────────
function renderDetail(){
  if(!currentResults||!selectedId) return;
  const rawItem = currentResults.recommendations.find(x=>x.standard_number===selectedId);
  if(!rawItem) return;

  const lang = (typeof getCurrentLanguage === "function") ? getCurrentLanguage() : "en-IN";
  const r = (typeof translateStandard === "function") ? translateStandard(rawItem, lang) : rawItem;

  qs("#detailId").textContent    = r.standard_number;
  qs("#detailTitle").textContent = r.localized_title || r.title;
  qs("#detailMeter").style.width = r.confidence+"%";
  
  let relLabel = r.relevance_category || (r.confidence >= 88 ? 'High Relevance' : 'Medium Relevance');
  if(lang === "kn-IN") {
    relLabel = r.confidence >= 88 ? "ಹೆಚ್ಚಿನ ಪ್ರಸ್ತುತತೆ" : "ಮಧ್ಯಮ ಪ್ರಸ್ತುತತೆ";
  }
  qs("#detailConfidenceLabel").textContent = `${r.confidence}% (${relLabel})`;
  qs("#detailStatus").innerHTML  = `<span class="status ${r.status}">${r.status.toUpperCase()}</span>`;
  qs("#detailEdition").textContent = r.edition||"—";
  qs("#detailIcs").textContent   = r.ics_code||"29.160.30";
  qs("#detailCertification").textContent = r.localized_certification || r.certification||"—";
  qs("#detailReason").textContent = r.localized_reason || r.reason||"—";

  // Render Why-Checklist (Feature 12)
  const checklistContainer = qs("#detailChecklist");
  if(checklistContainer) {
    const checks = r.localized_why_checks || r.why_checklist || [
      { criterion: "Product Match", matched: true, detail: "Directly governs specified product requirements" },
      { criterion: "Technical Scope", matched: true, detail: "Parameters aligned with voltage, frequency, and duty" },
      { criterion: "Statutory Order", matched: true, detail: "Complies with statutory BIS Certification Orders" }
    ];
    checklistContainer.innerHTML = checks.map(c => `
      <div class="check-row">
        <span class="check-icon ${c.matched !== false ? 'ok' : 'no'}">${c.matched !== false ? '✓' : '—'}</span>
        <div>
          <strong>${escHtml(c.criterion)}:</strong>
          <span> ${escHtml(c.detail)}</span>
        </div>
      </div>
    `).join("");
  }

  // Amendments info
  const amdWrap = qs("#detailAmendmentsWrap");
  const amdText = qs("#detailAmendmentsText");
  if(amdWrap && amdText) {
    if(r.amendment_info) {
      amdWrap.style.display = "block";
      amdText.textContent = r.amendment_info;
    } else {
      amdWrap.style.display = "none";
    }
  }

  qs("#detailEvidence").innerHTML = (r.evidence||[]).map(e=>`<li>${escHtml(e)}</li>`).join("");
  qs("#detailAttributes").innerHTML = (r.attributes||[]).map(a=>`<span>${escHtml(a)}</span>`).join("");
  
  // Dynamic BIS portal search URL
  const bisBtn = qs("#detailBisLink");
  if(bisBtn) {
    const rawNum = encodeURIComponent((r.standard_number || "").split(":")[0].replace(/\s+/g, ' '));
    bisBtn.href = `https://www.services.bis.gov.in/php/BIS_2.0/bisconnect/knowyourstandards/indian_standards/isdetails/?standard_number=${rawNum}`;
  }

  const mapTitle = (lang === "kn-IN") ? `${r.standard_number} ಗಾಗಿ ಮಾನದಂಡಗಳ ಅವಲಂಬನೆ ನಕ್ಷೆ` : `Standards Dependency Map for ${r.standard_number}`;
  qs("#graphTitle").textContent = mapTitle;
  renderGraph(r);
  qs("#detailPanel").classList.remove("hidden");
  qs("#results").classList.remove("details-hidden");
  qs("#toggleDetails").textContent = (lang === "kn-IN") ? "ವಿವರಗಳನ್ನು ಮರೆಮಾಡಿ" : "Hide details";
}

// ── Render Standards Dependency Map (Feature 8, 9, 32) ─────────
function renderGraph(primaryStandard){
  const depMap = currentResults?.standards_dependency_map || {};
  let nodes = depMap.nodes || [];
  let edges = depMap.edges || [];

  // Fallback if not populated
  if(!nodes.length) {
    nodes = [
      { id: primaryStage.standard_number, title: primaryStage.title, is_center: true, role: "Primary Standard" }
    ];
    (currentResults?.allied_standards || []).forEach(a => {
      nodes.push({ id: a.standard_number, title: a.title, is_center: false, role: a.relation_type || "Test Method" });
      edges.push({ source: primaryStage.standard_number, target: a.standard_number, label: a.relation_type || "Test Method" });
    });
  }

  const cx = 370, cy = 170;
  const outerNodes = nodes.filter(n => !n.is_center);
  const totalOuter = outerNodes.length;

  const positionedNodes = outerNodes.map((node, i) => {
    const angle = (Math.PI * 2 * i / Math.max(totalOuter, 1)) - Math.PI / 2;
    const rx = 240, ry = 115;
    return {
      ...node,
      x: cx + Math.cos(angle) * rx,
      y: cy + Math.sin(angle) * ry
    };
  });

  const centerNode = nodes.find(n => n.is_center) || { id: primaryStage.standard_number, title: primaryStage.title };

  qs("#graphSvg").innerHTML = `
    <defs>
      <linearGradient id="primaryNodeGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0f766e"/>
        <stop offset="100%" stop-color="#1d4ed8"/>
      </linearGradient>
      <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
        <polygon points="0 0, 8 3, 0 6" fill="#0f766e"/>
      </marker>
    </defs>
    <!-- Connector Edges -->
    ${positionedNodes.map(n => {
      const edge = edges.find(e => e.target === n.id) || { label: n.role || "Allied" };
      const mx = (cx + n.x) / 2;
      const my = (cy + n.y) / 2;
      return `
        <g class="graph-edge-group">
          <line x1="${cx}" y1="${cy}" x2="${n.x}" y2="${n.y}" class="graph-line-arrow"/>
          <rect x="${mx-45}" y="${my-10}" width="90" height="18" rx="4" fill="var(--bg-surface)" stroke="var(--line)" stroke-width="1"/>
          <text x="${mx}" y="${my+3}" class="edge-label" text-anchor="middle">${escHtml(edge.label)}</text>
        </g>
      `;
    }).join("")}

    <!-- Center Primary Standard Node -->
    <g class="graph-center-group" data-std="${escHtml(centerNode.id)}">
      <circle cx="${cx}" cy="${cy}" r="58" class="core-node"/>
      <text x="${cx}" y="${cy-6}" text-anchor="middle" class="core-text">${escHtml(centerNode.id)}</text>
      <text x="${cx}" y="${cy+14}" text-anchor="middle" class="core-subtext">PRIMARY PRODUCT</text>
    </g>

    <!-- Branching Dependency Nodes -->
    ${positionedNodes.map(n => `
      <g class="linked-node-group" data-std="${escHtml(n.id)}" title="${escHtml(n.title)}">
        <rect x="${n.x-75}" y="${n.y-28}" width="150" height="56" rx="10" class="linked-node"/>
        <text x="${n.x}" y="${n.y-6}" text-anchor="middle" class="linked-text">${escHtml(n.id)}</text>
        <text x="${n.x}" y="${n.y+13}" text-anchor="middle" class="linked-subtext">${escHtml(n.role||"Linked")}</text>
      </g>
    `).join("")}
  `;

  // Click on any graph node to inspect it
  qs("#graphSvg").onclick = (e) => {
    const g = e.target.closest(".linked-node-group, .graph-center-group");
    if(g && g.dataset.std) {
      const clickedStd = g.dataset.std;
      const found = currentResults?.recommendations?.find(x => x.standard_number === clickedStd);
      if(found) {
        selectedId = found.standard_number;
        renderAll();
        toast(`Selected ${clickedStd} for detailed audit inspection.`, "info");
      }
    }
  };
}

// ── Render Allied Standards Grid ───────────────────────────────
function renderAllied(){
  if(!currentResults) return;
  const allied = currentResults.allied_standards||[];
  const grid   = qs("#alliedGrid");
  if(!grid) return;
  const lang   = (typeof getCurrentLanguage === "function") ? getCurrentLanguage() : "en-IN";

  if(!allied.length) {
    grid.innerHTML = `<div style="color:var(--ink-muted);padding:14px;font-size:.88rem">${(lang==="kn-IN")?"ಎಲ್ಲಾ ಸಂಬಂಧಿತ ಕೋಡ್‌ಗಳನ್ನು ಗ್ರಾಫ್‌ನಲ್ಲಿ ನಕ್ಷೆ ಮಾಡಲಾಗಿದೆ.":"All companion codes mapped in graph view."}</div>`;
    return;
  }

  grid.innerHTML = allied.map(rawA => {
    const a = (typeof translateStandard === "function") ? translateStandard(rawA, lang) : rawA;
    return `
      <div class="allied-card" data-std="${escHtml(a.standard_number)}">
        <span>${escHtml(a.relation_type || "Allied Code")}</span>
        <strong>${escHtml(a.standard_number)}</strong>
        <p>${escHtml(a.localized_title || a.title || "")}</p>
        ${a.description ? `<span style="font-size:.76rem;color:var(--ink-muted);display:block;margin-top:4px;">${escHtml(a.description)}</span>` : ""}
      </div>
    `;
  }).join("");
}

// ── Render Comparison Table ────────────────────────────────────
function renderComparison(){
  if(!currentResults) return;
  const lang  = (typeof getCurrentLanguage === "function") ? getCurrentLanguage() : "en-IN";
  const items = (currentResults.recommendations||[]).filter(r=>compareIds.includes(r.standard_number));
  const hStd  = (lang === "kn-IN") ? "ಮಾನದಂಡ" : "Standard";
  const hStat = (lang === "kn-IN") ? "ಸ್ಥಿತಿ" : "Status";
  const hRel  = (lang === "kn-IN") ? "ಪ್ರಸ್ತುತತೆ" : "Relevance";
  const hCert = (lang === "kn-IN") ? "ಪ್ರಮಾಣೀಕರಣ ಯೋಜನೆ" : "Certification Scheme";
  const emptyNote = (lang === "kn-IN") ? "ಯಾವುದೇ ಕಾರ್ಡ್‌ನಲ್ಲಿ 'ಹೋಲಿಕೆ' ಆಯ್ಕೆಮಾಡಿ." : "Check 'Compare' on any standard card to add it here.";

  qs("#comparisonTable").innerHTML = `
    <div class="table-row header"><span>${hStd}</span><span>${hStat}</span><span>${hRel}</span><span>${hCert}</span></div>
    ${items.map(rawR=>{
      const r = (typeof translateStandard === "function") ? translateStandard(rawR, lang) : rawR;
      return `<div class="table-row">
        <span style="font-weight:700">${escHtml(r.standard_number)}</span>
        <span class="status ${r.status}">${r.status}</span>
        <span>${r.relevance_category || r.confidence + '%'}</span>
        <span>${escHtml(r.localized_certification||r.certification||r.scheme||"")}</span>
      </div>`;
    }).join("")}
    ${!items.length?`<div style="color:var(--ink-muted);padding:12px;font-size:.87rem">${emptyNote}</div>`:""}`;
}

// ── Vendor Compliance Table ────────────────────────────────────
function renderVendorComplianceTable() {
  const container = qs("#vendorComplianceTable");
  if(!container) return;
  const list = currentResults?.recommendations || [];
  if(!list.length) {
    container.innerHTML = `<div style="padding:16px;color:var(--ink-muted);font-size:.88rem">No tender standards loaded yet. Run a recommendation or select a preset to view standards.</div>`;
    return;
  }
  container.innerHTML = `
    <div class="vendor-row header">
      <span>Standard Number</span>
      <span>Title / Scope</span>
      <span>Mandatory Requirement</span>
      <span>Vendor Undertaking</span>
    </div>
    ${list.map(r => `
      <div class="vendor-row">
        <strong>${escHtml(r.standard_number)}</strong>
        <div>${escHtml(r.title)}</div>
        <div><span class="qco-badge">${escHtml(r.certification || "Standard Compliance")}</span></div>
        <div>
          <select class="vendor-row-select">
            <option>✓ Provided &amp; Attached</option>
            <option>⚠️ Claiming Exemption</option>
            <option>⏳ Under Lab Testing</option>
          </select>
        </div>
      </div>
    `).join("")}
  `;
}

// ── Human-in-the-Loop Feedback Modal (Feature 18) ──────────────
let activeFeedbackStd = null;
let activeFeedbackDecision = "accepted";

function openFeedbackModal(stdNumber, decision="accepted") {
  activeFeedbackStd = stdNumber;
  activeFeedbackDecision = decision;

  qs("#fbModalStdId").textContent = stdNumber;
  qs("#fbModalUser").textContent = `${currentUser.name} (${currentUser.role})`;
  qs("#fbModalTime").textContent = new Date().toLocaleString("en-IN");

  document.querySelectorAll(".dec-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.decision === decision);
  });

  qs("#fbModSection").style.display = (decision === "edited") ? "block" : "none";

  const defaultReasons = {
    accepted: `Verified conformity with procurement technical parameters and statutory QCO orders. Standard accepted for tender.`,
    rejected: `Standard does not match the precise operating duty or is superseded. Rejected for tender clause.`,
    edited: `Modified standard specification to align with site requirements.`
  };
  qs("#fbReasonInput").value = defaultReasons[decision] || "";

  qs("#feedbackModal").style.display = "flex";
}

document.querySelectorAll(".dec-btn").forEach(b => {
  b.addEventListener("click", () => {
    document.querySelectorAll(".dec-btn").forEach(btn => btn.classList.remove("active"));
    b.classList.add("active");
    activeFeedbackDecision = b.dataset.decision;
    qs("#fbModSection").style.display = (activeFeedbackDecision === "edited") ? "block" : "none";
  });
});

qs("#closeFeedbackModal")?.addEventListener("click", () => { qs("#feedbackModal").style.display = "none"; });
qs("#cancelFeedbackBtn")?.addEventListener("click", () => { qs("#feedbackModal").style.display = "none"; });

qs("#submitFeedbackBtn")?.addEventListener("click", async () => {
  const reason = qs("#fbReasonInput").value.trim() || "Technical compliance verified.";
  const modVal = qs("#fbModInput").value.trim();

  // Send feedback to server
  try {
    const res = await fetch(`${API_BASE}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_name: currentUser.name,
        user_role: currentUser.role,
        tender_ref: "TENDER-2026-IND-MOTORS-9402",
        standard_number: activeFeedbackStd,
        decision: activeFeedbackDecision,
        reason: reason,
        modifications: modVal
      })
    });
    if(!res.ok) throw new Error("Server error saving feedback");
    
    // Update local state
    if(currentResults?.recommendations) {
      const rec = currentResults.recommendations.find(r => r.standard_number === activeFeedbackStd);
      if(rec) rec.feedback = `${activeFeedbackDecision.toUpperCase()} — "${reason.slice(0,35)}..."`;
    }

    addAudit(`Officer recorded ${activeFeedbackDecision.toUpperCase()} for ${activeFeedbackStd}: "${reason.slice(0,50)}..."`);
    notify(`Decision for ${activeFeedbackStd} saved to immutable audit trail.`);
    toast(`Decision for ${activeFeedbackStd} recorded successfully!`, "success");

    renderAll();
  } catch(err) {
    toast(`Feedback save error: ${err.message}`, "error");
  }

  qs("#feedbackModal").style.display = "none";
});

// ── Export Center: DOCX & GeM Clause (Feature 16 & 17) ─────────
async function exportDocxReport() {
  if(!currentResults || !currentResults.recommendations) {
    toast("Run a recommendation first to generate a procurement report.", "warn");
    return;
  }
  toast("Generating official government DOCX procurement report...", "info");
  notify("Preparing DOCX report download...");

  try {
    const res = await fetch(`${API_BASE}/api/export/docx`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentResults)
    });
    if(!res.ok) throw new Error(`Report generation failed (${res.status})`);
    
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BIS_Procurement_Compliance_Report_${Date.now()}.docx`;
    a.click();
    URL.revokeObjectURL(url);

    toast("📄 Official DOCX Procurement Report downloaded successfully!", "success");
    addAudit("downloaded official BIS technical compliance report as DOCX.");
  } catch(err) {
    toast(`DOCX export error: ${err.message}`, "error");
    console.error(err);
  }
}

async function exportPdfReport() {
  if(!currentResults || !currentResults.recommendations) {
    toast("Run a recommendation first to generate a procurement report.", "warn");
    return;
  }
  toast("Generating official government PDF procurement report...", "info");
  notify("Preparing PDF report download...");

  try {
    const res = await fetch(`${API_BASE}/api/export/pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentResults)
    });
    if(!res.ok) throw new Error(`PDF generation failed (${res.status})`);
    
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BIS_Procurement_Compliance_Report_${Date.now()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);

    toast("📄 Official PDF Procurement Report downloaded successfully!", "success");
    addAudit("downloaded official BIS technical compliance report as PDF.");
  } catch(err) {
    toast(`PDF export error: ${err.message}`, "error");
    console.error(err);
  }
}

qs("#btnExportDocx")?.addEventListener("click", exportDocxReport);
qs("#btnExportPdf")?.addEventListener("click", exportPdfReport);

function copyGemClause() {
  if(!currentResults || !currentResults.recommendations || !currentResults.recommendations.length) {
    toast("Run a recommendation first to generate GeM tender clauses.", "warn");
    return;
  }
  const topStds = currentResults.recommendations.slice(0, 6);
  const qcoStds = topStds.filter(s => (s.certification || "").toLowerCase().includes("mandatory"));
  const params = currentResults.extracted_parameters || {};
  
  let clause = `=========================================================================\n`;
  clause += `MANDATORY INDIAN STANDARDS (BIS) SPECIFICATION & COMPLIANCE CLAUSE\n`;
  clause += `(Aligned with General Financial Rules - GFR 2017 & GeM Public Procurement Norms)\n`;
  clause += `=========================================================================\n\n`;
  clause += `ITEM / PRODUCT: ${params.product || "Designated Procurement Supplies"}\n`;
  if(params.voltage) clause += `OPERATIONAL RATINGS: ${params.voltage}, ${params.frequency || "50Hz"}, ${params.phase || "3-Phase"}, ${params.efficiency || ""}\n\n`;
  
  clause += `1. TECHNICAL SPECIFICATIONS & STANDARDS:\n`;
  clause += `   The supplies/equipment shall strictly conform to the latest active published revisions\n`;
  clause += `   and all valid Gazette amendments of the following Bureau of Indian Standards (BIS):\n`;
  topStds.forEach((s, i) => {
    clause += `   ${i+1}. ${s.standard_number} : "${s.title}" [${s.category}] - ${s.status.toUpperCase()}\n`;
  });

  clause += `\n2. STATUTORY QUALITY CONTROL ORDERS (QCO):\n`;
  if(qcoStds.length > 0) {
    clause += `   - Compulsory BIS Certification applies under Ministry Quality Control Orders (QCO):\n`;
    qcoStds.forEach(s => {
      clause += `     * Standard: ${s.standard_number} -> Compulsory ISI Mark Certification / CRS Registration.\n`;
      clause += `       Statutory Order: ${s.qco_order_title || "BIS Quality Regulation"}\n`;
    });
  } else {
    clause += `   - Suppliers must possess valid BIS product certification licenses or NABL test certificates.\n`;
  }

  clause += `\n3. ALLIED TESTING & ACCEPTANCE PROTOCOLS:\n`;
  (currentResults.allied_standards || []).slice(0, 3).forEach(a => {
    clause += `   - ${a.relation_type}: Conformity testing shall follow ${a.standard_number} ("${a.title}").\n`;
  });

  clause += `\n4. BIDDER SUBMISSION MANDATE:\n`;
  clause += `   - Bidders must upload valid BIS CM/L license endorsements and Type Test Reports\n`;
  clause += `     from NABL accredited laboratories on the GeM portal prior to bid closure.\n\n`;
  clause += `=========================================================================`;

  navigator.clipboard.writeText(clause).then(() => {
    toast("📋 GeM Tender Compliance Clause copied to clipboard!", "success");
    notify("GeM Tender Compliance Clause copied to clipboard.");
    addAudit("copied GeM tender specification clause to clipboard.");
  }).catch(() => {
    toast("Please copy manually from browser.", "error");
  });
}

qs("#copyGemClauseBtn")?.addEventListener("click", copyGemClause);

function doExport(fmt){
  const list = getFiltered();
  if(!list.length){ toast("No standards available to export.", "warn"); return; }
  notify(`${fmt} export prepared for ${list.length} recommendations.`);
  addAudit(`exported ${list.length} standards as ${fmt}.`);

  if(fmt==="PDF"){ exportPdfReport(); return; }
  if(fmt==="CSV"){
    const rows=[["IS Number","Title","Category","Status","Relevance","Confidence","Certification","Edition"],
      ...list.map(r=>[r.standard_number,r.title,r.category,r.status,r.relevance_category||"",`${r.confidence}%`,r.certification||"",r.edition||""])];
    const csv=rows.map(row=>row.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));
    a.download="is-recommendations.csv"; a.click();
    URL.revokeObjectURL(a.href);
    toast("CSV export downloaded successfully!","success");
    return;
  }
  if(fmt==="XLSX"){
    const xmlHeader = `<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="BIS Standards"><Table>`;
    const headerRow = `<Row>` + ["IS Number","Title","Category","Status","Relevance","Confidence","Certification Scheme","Edition"].map(h => `<Cell><Data ss:Type="String">${escHtml(h)}</Data></Cell>`).join("") + `</Row>`;
    const dataRows = list.map(r => `<Row>` + [
      r.standard_number, r.title, r.category, r.status, r.relevance_category||"", `${r.confidence}%`, r.certification||"", r.edition||""
    ].map(v => `<Cell><Data ss:Type="String">${escHtml(String(v))}</Data></Cell>`).join("") + `</Row>`).join("");
    const xmlFooter = `</Table></Worksheet></Workbook>`;
    const blob = new Blob([xmlHeader + headerRow + dataRows + xmlFooter], { type: "application/vnd.ms-excel" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "is-recommendations.xls";
    a.click();
    URL.revokeObjectURL(a.href);
    toast("Excel export downloaded successfully!","success");
    return;
  }
}

// ── File Upload Parser (Feature 1.D & 1.E) ──────────────────────
async function uploadTenderFile(file) {
  if(!file) return;
  qs("#fileName").textContent = `Selected: ${file.name} (${(file.size/1024).toFixed(1)} KB)`;
  toast(`Parsing tender document: ${file.name}...`, "info");
  notify(`Uploading and extracting text from ${file.name}`);

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    if(data.error) throw new Error(data.error);

    qs("#queryInput").value = data.text;
    qs("#translationText").textContent = data.snippet || data.text.slice(0, 350);
    
    let msg = `Extracted ${data.text.length} characters from ${file.name} (${data.pages || 1} pages).`;
    if(data.mentioned_standards && data.mentioned_standards.length > 0) {
      msg += ` Detected standard codes: ${data.mentioned_standards.join(", ")}.`;
    }
    toast(msg, "success");
    notify(`Tender parsed successfully.`);
    addAudit(`uploaded ${file.name} and extracted specifications.`);

    // Switch to natural tab and run analysis
    document.querySelector(".input-mode-tab[data-tab='natural']")?.click();
    runPipeline();
  } catch(err) {
    toast(`File upload error: ${err.message}`, "error");
    console.error(err);
  }
}

// Drag & drop support
const dropZone = qs("#uploadZone");
if(dropZone) {
  dropZone.addEventListener("dragover", e => { e.preventDefault(); dropZone.classList.add("dragover"); });
  dropZone.addEventListener("dragleave", () => { dropZone.classList.remove("dragover"); });
  dropZone.addEventListener("drop", e => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    if(e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadTenderFile(e.dataTransfer.files[0]);
    }
  });
}

// ── Audit & Notifications ──────────────────────────────────────
function renderAudit(){ qs("#auditList").innerHTML=auditLog.map(l=>`<div>${escHtml(l)}</div>`).join(""); }
function renderNotifications(){ qs("#notificationList").innerHTML=notifLog.map(l=>`<div>${escHtml(l)}</div>`).join(""); }

function renderAll(){
  if(currentResults){
    renderTenderDefects(currentResults.tender_defects);
    renderEntities(currentResults);
    renderStandards();
    renderDetail();
    renderComparison();
    renderAllied();
    renderVendorComplianceTable();
  }
  renderAudit();
  renderNotifications();
}

// ── Event Delegation ───────────────────────────────────────────
document.addEventListener("click", e => {
  const fbBtn  = e.target.closest("[data-feedback-btn]");
  const sample = e.target.closest("[data-sample]");
  const exp    = e.target.closest("[data-export]");
  const cat    = e.target.closest("[data-cat-filter]");
  const card   = e.target.closest("[data-select]");
  const dAct   = e.target.closest("[data-action]");
  const alliedCard = e.target.closest(".allied-card");

  // Quick sample preset clicked
  if(sample){
    const key = sample.dataset.sample;
    if(SAMPLE_TENDERS[key]){
      document.querySelectorAll("[data-sample]").forEach(b=>b.classList.remove("active"));
      sample.classList.add("active");
      qs("#queryInput").value = SAMPLE_TENDERS[key];
      qs("#translationText").textContent = SAMPLE_TENDERS[key];
      toast(`Loaded preset: ${sample.textContent.trim()}. Running intelligence analysis...`, "info");
      document.querySelector(".input-mode-tab[data-tab='natural']")?.click();
      runPipeline();
    }
    return;
  }

  // Feedback modal button clicked
  if(fbBtn && currentResults){
    e.stopPropagation();
    openFeedbackModal(fbBtn.dataset.id, fbBtn.dataset.feedbackBtn);
    return;
  }

  if(dAct && selectedId && currentResults){
    openFeedbackModal(selectedId, dAct.dataset.action);
    return;
  }

  if(exp){ doExport(exp.dataset.export); return; }

  if(cat){
    document.querySelectorAll("[data-cat-filter]").forEach(b=>b.classList.remove("active"));
    cat.classList.add("active"); catFilter=cat.dataset.catFilter;
    renderStandards(); return;
  }

  if(card){ selectedId=card.dataset.select; renderAll(); return; }

  if(alliedCard && alliedCard.dataset.std){
    const found = currentResults?.recommendations?.find(x => x.standard_number === alliedCard.dataset.std);
    if(found) {
      selectedId = found.standard_number;
      renderAll();
      toast(`Selected ${found.standard_number} for inspection.`, "info");
    }
  }
});

document.addEventListener("change", e => {
  if(e.target.matches("[data-compare]")){
    const id=e.target.dataset.compare;
    if(e.target.checked && !compareIds.includes(id)) compareIds=[...compareIds,id].slice(-4);
    else compareIds=compareIds.filter(x=>x!==id);
    renderComparison(); return;
  }
  if(e.target.matches("#fileInput")){
    const f = e.target.files[0];
    if(f) uploadTenderFile(f);
    return;
  }
  if(e.target.matches("#role")){
    const r = e.target.value;
    currentUser.role = r;
    updateRoleVisibility(r);
    notify(`${r} RBAC workspace activated.`);
    addAudit(`switched active workspace to ${r}.`);
  }
});

["#searchInput","#statusFilter","#sortBy"].forEach(sel=>{
  const el=qs(sel); if(!el) return;
  el.addEventListener("input", renderStandards);
  el.addEventListener("change", ()=>{ renderStandards(); renderComparison(); });
});

qs("#closeDetails")?.addEventListener("click",()=>{ qs("#detailPanel").classList.add("hidden"); qs("#results").classList.add("details-hidden"); qs("#toggleDetails").textContent="Show details"; });
qs("#toggleDetails")?.addEventListener("click",()=>{ const h=qs("#detailPanel").classList.toggle("hidden"); qs("#results").classList.toggle("details-hidden",h); qs("#toggleDetails").textContent=h?"Show details":"Hide details"; });
qs("#clearComparison")?.addEventListener("click",()=>{ compareIds=[]; renderComparison(); renderStandards(); });
qs("#clearQueryBtn")?.addEventListener("click", () => {
  qs("#queryInput").value = "";
  const prev = qs("#translationText");
  if(prev) prev.textContent = "No specification entered yet.";
  qs("#fileName").textContent = "No document attached (drag & drop PDF/DOCX or click Attach)";
  document.querySelectorAll("[data-sample]").forEach(b=>b.classList.remove("active"));
  qs("#queryInput").focus();
  toast("Workspace cleared. Enter or paste a new specification.", "info");
});

// ── Keyboard shortcuts ─────────────────────────────────────────
document.addEventListener("keydown", e=>{
  if((e.key==="/" || e.key==="k") && !e.ctrlKey && !["INPUT","TEXTAREA","SELECT"].includes(document.activeElement.tagName)){
    e.preventDefault(); qs("#searchInput")?.focus();
  }
  if(e.key==="Escape") {
    qs("#closeDetails")?.click();
    qs("#feedbackModal").style.display = "none";
    closeChatbot();
  }
});

// ── Init ───────────────────────────────────────────────────────
renderStages();
renderAudit();
renderNotifications();

// Restore user session if previously signed in
try {
  const savedSession = localStorage.getItem("standards_user_session");
  if(savedSession) {
    const u = JSON.parse(savedSession);
    if(u && u.name && u.email) {
      currentUser = u;
      const overlay = qs("#loginOverlay");
      const shell   = qs("#appShell");
      if(overlay) overlay.style.display = "none";
      if(shell) shell.style.display = "";
    }
  }
} catch(e) {
  console.warn("[Session] Could not restore saved session:", e);
}

updateUserDisplay();
updateRoleVisibility(currentUser.role || "Procurement Officer");
fetchAndRenderUsers();
qs("#progressBar").style.width="0%";

// Fetch backend status
fetch(`${API_BASE}/api/status`)
  .then(r => r.json())
  .then(d => {
    if(d.standards_loaded) {
      const el = qs("#heroStandardsCount");
      if(el) el.textContent = `${Number(d.standards_loaded).toLocaleString()}+`;
    }
  })
  .catch(() => {});

// Initial load with benchmark motor query
setTimeout(()=>runPipeline(), 600);

// ── Multilingual Global Hook ──────────────────────────────────
window.onLanguageChanged = function(lang) {
  currentSarvamLang = lang;
  const chatLangSel = qs("#chatLangSelector");
  if(chatLangSel && chatLangSel.value !== lang) {
    chatLangSel.value = lang;
  }
  renderStages();
  renderAll();
};


// ────────────────────────────────────────────────────────────────
// STANDARDS AI CHATBOT MODULE
// ────────────────────────────────────────────────────────────────
let chatHistory = [];
let chatContext = {};
let chatOpen = false;
let currentSarvamLang = localStorage.getItem('sarvam_lang') || 'en-IN';
let activeAudio = null;
let activeSpeakBtn = null;
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;

/** Stop any currently playing audio or speech synthesis */
function stopActiveAudio() {
  if(activeAudio) {
    try { activeAudio.pause(); activeAudio.currentTime = 0; } catch(_) {}
    activeAudio = null;
  }
  if(window.speechSynthesis) {
    try { window.speechSynthesis.cancel(); } catch(_) {}
  }
  if(activeSpeakBtn) {
    activeSpeakBtn.classList.remove('playing');
    activeSpeakBtn.innerHTML = '<span>🔊</span> Listen';
    activeSpeakBtn = null;
  }
}

/** Fallback to browser SpeechSynthesis API */
function fallbackBrowserTTS(text) {
  if(!('speechSynthesis' in window)) {
    stopActiveAudio();
    toast('Text-to-speech not supported in this browser.', 'warning');
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text.slice(0, 350));
  utterance.lang = currentSarvamLang || 'en-IN';
  utterance.onend = () => stopActiveAudio();
  utterance.onerror = () => stopActiveAudio();
  window.speechSynthesis.speak(utterance);
}

/** Play text-to-speech audio via Sarvam AI TTS with browser fallback */
window.speakMessage = async function(btn, text) {
  if(btn === activeSpeakBtn) {
    stopActiveAudio();
    return;
  }
  stopActiveAudio();

  btn.classList.add('playing');
  btn.innerHTML = '<span>⏹️</span> Playing...';
  activeSpeakBtn = btn;

  // Clean markdown syntax for speech
  const plainText = text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/•|-/g, '')
    .trim();

  try {
    const res = await fetch(`${API_BASE}/api/sarvam/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: plainText.slice(0, 500),
        language: currentSarvamLang || 'en-IN'
      })
    });

    if(res.ok) {
      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      activeAudio = audio;

      audio.onended = () => stopActiveAudio();
      audio.onerror = () => fallbackBrowserTTS(plainText);
      await audio.play();
      return;
    }
  } catch(e) {
    console.warn('[Sarvam TTS] fallback:', e);
  }

  fallbackBrowserTTS(plainText);
};

/** Toggle audio recording for Speech-to-Text */
window.toggleVoiceRecording = async function() {
  const micBtn = qs("#chatMicBtn");
  if(!micBtn) return;

  if(isRecording) {
    stopVoiceRecording();
    return;
  }

  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    if(('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window)) {
      startSpeechRecognition();
      return;
    }
    toast('Microphone access not supported in this browser.', 'warning');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];

    let mimeType = 'audio/webm';
    if(typeof MediaRecorder !== 'undefined') {
      if(MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if(MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
      } else if(MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/wav';
      }
    }

    mediaRecorder = new MediaRecorder(stream, { mimeType });

    mediaRecorder.ondataavailable = (e) => {
      if(e.data && e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach(track => track.stop());
      micBtn.classList.remove('recording');
      micBtn.innerHTML = '<span class="mic-icon">🎤</span>';
      isRecording = false;

      const audioBlob = new Blob(audioChunks, { type: mimeType });
      if(audioBlob.size < 100) return;

      const inp = qs("#chatInput");
      if(inp) inp.placeholder = "Processing voice with Sarvam AI...";

      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      formData.append('language', currentSarvamLang || 'unknown');

      try {
        const res = await fetch(`${API_BASE}/api/sarvam/stt`, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if(inp) inp.placeholder = "Ask about standards, recommendations, or click 🎤 to speak...";

        if(data.transcript) {
          if(inp) {
            inp.value = data.transcript;
            inp.focus();
          }
          toast(`Voice recognized (${data.language_code || 'auto'}): "${data.transcript.slice(0, 45)}..."`, 'success');
        } else if(data.error) {
          toast(`STT: ${data.error}`, 'warning');
        }
      } catch(err) {
        if(inp) inp.placeholder = "Ask about standards, recommendations, or click 🎤 to speak...";
        console.error('[Sarvam STT]', err);
        toast('Speech recognition failed. Check connection.', 'error');
      }
    };

    mediaRecorder.start();
    isRecording = true;
    micBtn.classList.add('recording');
    micBtn.innerHTML = '<span class="mic-icon">⏹️</span>';
    toast('Listening... Speak now and click stop when done.', 'info');
  } catch(err) {
    console.warn('[Microphone]', err);
    if(('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window)) {
      startSpeechRecognition();
    } else {
      toast('Could not access microphone. Please allow mic permissions.', 'warning');
    }
  }
};

function stopVoiceRecording() {
  if(mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  isRecording = false;
}

function startSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SpeechRecognition) {
    toast('Speech recognition is not supported in this browser.', 'warning');
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = currentSarvamLang || 'en-IN';
  recognition.interimResults = false;

  const micBtn = qs("#chatMicBtn");
  if(micBtn) {
    micBtn.classList.add('recording');
    micBtn.innerHTML = '<span class="mic-icon">⏹️</span>';
  }
  toast('Listening via browser speech recognition...', 'info');

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const inp = qs("#chatInput");
    if(inp) {
      inp.value = transcript;
      inp.focus();
    }
    toast(`Heard: "${transcript}"`, 'success');
  };

  recognition.onend = () => {
    if(micBtn) {
      micBtn.classList.remove('recording');
      micBtn.innerHTML = '<span class="mic-icon">🎤</span>';
    }
  };

  recognition.onerror = (e) => {
    if(micBtn) {
      micBtn.classList.remove('recording');
      micBtn.innerHTML = '<span class="mic-icon">🎤</span>';
    }
    console.warn('[SpeechRecognition]', e);
  };

  recognition.start();
}

/** Simple markdown-to-HTML renderer for chatbot messages */
function renderMd(text) {
  return text
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
    .replace(/`([^`]+)`/g,'<code>$1</code>')
    .replace(/^#{1,3}\s(.+)/gm,'<strong>$1</strong>')
    .replace(/^\|(.+)\|$/gm, row => {
      const cells = row.split('|').filter(Boolean);
      if(cells.every(c=>c.trim().match(/^-+$/))) return '';
      return '<div class="chat-table-row">' + cells.map(c=>`<span>${c.trim()}</span>`).join('') + '</div>';
    })
    .replace(/^•\s(.+)/gm,'<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs,'<ul>$1</ul>')
    .replace(/^-\s(.+)/gm,'<li>$1</li>')
    .replace(/\n\n/g,'<br><br>')
    .replace(/\n/g,'<br>');
}

/** Append a message bubble to the chat */
function appendChatBubble(role, content, isLoading=false) {
  const msgs = qs("#chatMessages");
  if(!msgs) return;
  const div = document.createElement("div");
  div.className = `chat-bubble ${role}${isLoading?' loading':''}`;
  if(role === 'ai') {
    const safeContent = (content || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
    const speakBtnHtml = !isLoading && content
      ? `<div class="chat-bubble-footer"><button class="chat-speak-btn" title="Listen with Sarvam AI Voice" onclick="speakMessage(this, this.closest('.chat-bubble-body').innerText)"><span>🔊</span> Listen</button></div>`
      : '';
    div.innerHTML = `<div class="chat-bubble-avatar">IS</div><div class="chat-bubble-body">${isLoading ? '<span class="chat-dots"><span></span><span></span><span></span></span>' : renderMd(content) + speakBtnHtml}</div>`;
  } else {
    div.innerHTML = `<div class="chat-bubble-body user-body">${escHtml(content)}</div>`;
  }
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

/** Show suggested follow-up chips */
function renderSuggestions(questions) {
  const sug = qs("#chatSuggestions");
  if(!sug || !questions?.length) return;
  sug.innerHTML = questions.map(q =>
    `<button class="chat-chip" onclick="injectChatSuggestion(this)" data-q="${escHtml(q)}">${escHtml(q)}</button>`
  ).join('');
}

window.injectChatSuggestion = function(btn) {
  const q = btn.dataset.q;
  if(!q) return;
  const inp = qs("#chatInput");
  if(inp) { inp.value = q; inp.focus(); }
  qs("#chatSuggestions").innerHTML = '';
  sendChatMessage();
};

/** Show citations panel */
function renderCitations(citations) {
  const panel = qs("#chatCitations");
  const list = qs("#citationsList");
  if(!panel || !list) return;
  if(!citations?.length) { panel.style.display = 'none'; return; }
  list.innerHTML = citations.map(c => `<span class="citation-chip">📎 ${escHtml(c)}</span>`).join('');
  panel.style.display = 'block';
}

/** Load current analysis context into chatbot */
function loadChatContext() {
  if(!currentResults) return;
  chatContext = {
    query: currentResults.query || '',
    recommendations: currentResults.recommendations || [],
    extracted_params: currentResults.extracted_parameters || {},
    allied_standards: currentResults.allied_standards || [],
    defects: currentResults.tender_defects || {},
    primary_standard: currentResults.recommendations?.[0]?.standard_number || ''
  };
  const product = chatContext.extracted_params?.product || 'your procurement';
  const primary = chatContext.primary_standard;
  const label = qs("#chatContextLabel");
  if(label) label.textContent = primary ? `Context: ${primary}` : `Context: ${product.slice(0,30)}`;
}

/** Send a message to the chatbot API */
async function sendChatMessage() {
  const inp = qs("#chatInput");
  const msg = inp?.value.trim();
  if(!msg) return;

  inp.value = '';
  inp.style.height = '';
  qs("#chatSuggestions").innerHTML = '';

  appendChatBubble('user', msg);
  chatHistory.push({ role: 'user', content: msg });

  const loadingBubble = appendChatBubble('ai', '', true);

  try {
    const res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: msg,
        context: chatContext,
        history: chatHistory.slice(-8),
        response_language: currentSarvamLang || 'en-IN'
      })
    });
    const data = await res.json();
    if(loadingBubble) loadingBubble.remove();

    const replyText = data.reply || 'I could not generate a response. Please try again.';
    appendChatBubble('ai', replyText);
    chatHistory.push({ role: 'assistant', content: replyText });
    if(chatHistory.length > 30) chatHistory = chatHistory.slice(-30);

    renderSuggestions(data.suggested_questions);
    renderCitations(data.citations);

    const badge = data.confidence === 'gemini-grounded' ? '🟢 Gemini RAG' : '🔵 Rule-based RAG';
    const langBadge = data.sarvam_active ? ' • 🇮🇳 Sarvam AI' : '';
    addAudit(`AI chatbot answered: "${msg.slice(0,50)}..." [${badge}${langBadge}]`);
  } catch(err) {
    if(loadingBubble) loadingBubble.remove();
    appendChatBubble('ai', '⚠️ Could not reach the AI engine. Please check the server and try again.');
    console.error('[Chat]', err);
  }
}

/** Show a greeting message based on current context */
function showChatGreeting() {
  const msgs = qs("#chatMessages");
  if(!msgs || msgs.children.length > 0) return;
  const product = chatContext?.extracted_params?.product || null;
  const primary = chatContext?.primary_standard || null;
  const lang = (typeof getCurrentLanguage === "function") ? getCurrentLanguage() : "en-IN";
  let greeting;
  let defaultSuggestions;

  if(lang === "kn-IN") {
    if(product && primary) {
      greeting = `👋 ನಮಸ್ಕಾರ! ನೀವು **${product}** ವಿಶ್ಲೇಷಿಸಿರುವುದನ್ನು ನಾನು ನೋಡುತ್ತಿದ್ದೇನೆ ಮತ್ತು ಮುಖ್ಯ ಶಿಫಾರಸು ಮಾಡಿದ ಮಾನದಂಡ **${primary}** ಆಗಿದೆ.\n\nನೀವು ಏನು ತಿಳಿದುಕೊಳ್ಳಲು ಬಯಸುತ್ತೀರಿ? ಈ ಮಾನದಂಡವನ್ನು ಏಕೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ, ಸಂಬಂಧಿತ ಪರೀಕ್ಷಾ ಮತ್ತು ಸುರಕ್ಷತಾ ಕೋಡ್‌ಗಳು, ಅಥವಾ ಟೆಂಡರ್ ದೋಷಗಳ ಬಗ್ಗೆ ನಾನು ನಿಮಗೆ ಕನ್ನಡದಲ್ಲಿ ವಿವರಿಸಬಲ್ಲೆ.`;
    } else {
      greeting = `👋 **ಸ್ಟ್ಯಾಂಡರ್ಡ್ಸ್ AI ಸಹಾಯಕಕ್ಕೆ ಸುಸ್ವಾಗತ!**\n\nಸಾರ್ವಜನಿಕ ಖರೀದಿಗಾಗಿ ಭಾರತೀಯ ಮಾನದಂಡಗಳ (BIS) ಕುರಿತು ನಿಮ್ಮ ಸಂದರ್ಭ-ಅರಿವುಳ್ಳ ಮಾರ್ಗದರ್ಶಿ ನಾನು.\n\nಟೆಂಡರ್ ಅಥವಾ ಉತ್ಪನ್ನದ ಕುರಿತು ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳನ್ನು ನೀವು ಕನ್ನಡದಲ್ಲೇ ಕೇಳಬಹುದು!`;
    }
    defaultSuggestions = product
      ? ["ಈ ಮಾನದಂಡವನ್ನು ಏಕೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ?", "ಯಾವ ಪರೀಕ್ಷಾ ಮಾನದಂಡಗಳು ಅನ್ವಯಿಸುತ್ತವೆ?", "ಟೆಂಡರ್‌ನಲ್ಲಿ ಯಾವುದೇ ದೋಷಗಳಿವೆಯೇ?", "ಇದು ಕಡ್ಡಾಯ QCO ಹೊಂದಿದೆಯೇ?"]
      : ["ಇಂಡಕ್ಷನ್ ಮೋಟರ್‌ಗಳಿಗೆ ಯಾವ ಮಾನದಂಡಗಳು ಅನ್ವಯಿಸುತ್ತವೆ?", "IS 12615:2018 ಬಗ್ಗೆ ವಿವರಿಸಿ", "QCO ಎಂದರೇನು?"];
  } else if(lang === "hi-IN") {
    if(product && primary) {
      greeting = `👋 नमस्ते! आपने **${product}** का विश्लेषण किया है और प्राथमिक अनुशंसित मानक **${primary}** है।\n\nआप क्या जानना चाहते हैं? मैं बता सकता हूँ कि यह मानक क्यों अनुशंसित किया गया, कौन से परीक्षण कोड लागू होते हैं, या निविदा दोषों की जांच कर सकता हूँ।`;
    } else {
      greeting = `👋 **स्टैंडर्ड्स एआई सहायक में आपका स्वागत है!**\n\nसार्वजनिक खरीद के लिए भारतीय मानकों (BIS) पर आपका मार्गदर्शक।\n\nअनुशंसित मानकों या प्रमाणन के बारे में कोई भी प्रश्न पूछें।`;
    }
    defaultSuggestions = product
      ? ["यह मानक क्यों अनुशंसित है?", "कौन से परीक्षण मानक लागू होते हैं?", "क्या कोई निविदा दोष हैं?", "क्या यह QCO अनिवार्य है?"]
      : ["इंडक्शन मोटर्स के लिए कौन से मानक लागू होते हैं?", "IS 12615:2018 समझाएं", "QCO क्या है?"];
  } else {
    if(product && primary) {
      greeting = `👋 I can see you've analyzed **${product}** and the primary recommended standard is **${primary}**.\n\nWhat would you like to know? I can explain why this standard was recommended, explore related test and safety codes, check for tender defects, or compare standards.`;
    } else {
      greeting = `👋 **Welcome to the Standards AI Assistant!**\n\nI'm your context-aware guide to Indian Standards (BIS) for public procurement.\n\nRun a **Standards Analysis** first, then come back and ask me anything about the recommended standards, tender defects, or certification requirements.`;
    }
    defaultSuggestions = product
      ? ["Why was this standard recommended?", "What testing standards apply?", "Are there any tender defects?", "Is this QCO mandatory?"]
      : ["What standards apply to induction motors?", "Explain IS 12615:2018", "What is a QCO?"];
  }

  appendChatBubble('ai', greeting);
  renderSuggestions(defaultSuggestions);
}

/** Toggle chatbot panel open/close */
window.toggleChatbot = function(e) {
  if(e) e.preventDefault();
  chatOpen ? closeChatbot() : openChatbot();
};

function openChatbot() {
  const panel = qs("#chatbotPanel");
  const fab = qs("#chatbotFab");
  if(!panel) return;
  loadChatContext();
  panel.style.display = 'flex';
  panel.classList.add('open');
  if(fab) fab.classList.add('active');
  chatOpen = true;
  showChatGreeting();
  setTimeout(()=>qs("#chatInput")?.focus(), 100);
  addAudit('opened Standards AI Chatbot.');
};

function closeChatbot() {
  const panel = qs("#chatbotPanel");
  const fab = qs("#chatbotFab");
  if(!panel) return;
  panel.classList.remove('open');
  setTimeout(()=>{ panel.style.display='none'; }, 300);
  if(fab) fab.classList.remove('active');
  chatOpen = false;
};

// Wire chatbot buttons
qs("#chatbotFab")?.addEventListener("click", () => toggleChatbot());
qs("#chatCloseBtn")?.addEventListener("click", closeChatbot);
qs("#chatClearBtn")?.addEventListener("click", () => {
  chatHistory = [];
  const msgs = qs("#chatMessages");
  if(msgs) msgs.innerHTML = '';
  qs("#chatSuggestions").innerHTML = '';
  qs("#chatCitations").style.display = 'none';
  showChatGreeting();
  toast('Chat conversation cleared.', 'info');
});
qs("#chatMicBtn")?.addEventListener("click", toggleVoiceRecording);
const chatLangSel = qs("#chatLangSelector");
if(chatLangSel) {
  chatLangSel.value = currentSarvamLang;
  chatLangSel.addEventListener("change", (e) => {
    currentSarvamLang = e.target.value;
    localStorage.setItem('sarvam_lang', currentSarvamLang);
    const langName = e.target.options[e.target.selectedIndex]?.text || currentSarvamLang;
    toast(`AI Response language set to: ${langName}`, 'info');
  });
}
qs("#chatSendBtn")?.addEventListener("click", sendChatMessage);
qs("#chatInput")?.addEventListener("keydown", e => {
  if(e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
});
qs("#chatInput")?.addEventListener("input", function() {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 100) + 'px';
});

// Reload context after each analysis run (hook into runPipeline success)
const _origFetch = window.fetch;
window.fetch = function(...args) {
  return _origFetch.apply(this, args).then(res => {
    if(args[0] && String(args[0]).includes('/api/recommend') && res.ok) {
      // Clone so body can still be consumed downstream
      res.clone().json().then(d => {
        currentResults = d;
        loadChatContext();
        // If chatbot is open and greeting already shown, update context label only
        const label = qs("#chatContextLabel");
        const primary = d.recommendations?.[0]?.standard_number || '';
        const product = d.extracted_parameters?.product || '';
        if(label) label.textContent = primary ? `Context: ${primary}` : `Context: ${product.slice(0,30)}`;
        // Pulse the FAB to notify new context is ready
        const fab = qs("#chatbotFab");
        if(fab && !chatOpen) { fab.classList.add('pulse-ready'); setTimeout(()=>fab.classList.remove('pulse-ready'),3000); }
      }).catch(()=>{});
    }
    return res;
  });
};

// ────────────────────────────────────────────────────────────────
// STANDARDS MANAGEMENT PANEL (Standards Administrator)
// ────────────────────────────────────────────────────────────────

async function loadStandardsMgmtStatus() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/standards`);
    const data = await res.json();
    const set = (id, val) => { const el = qs(`#${id}`); if(el) el.textContent = val; };
    set('smTotalIndexed', Number(data.total_indexed||0).toLocaleString());
    set('smTotalCurated', data.total_curated ?? '—');
    set('smGraphEdges', data.total_graph_edges ?? '—');
    set('smVectorStatus', data.vector_index_ready ? 'Ready ✅' : 'Not Ready ⚠️');
  } catch(e) { console.warn('[StdsMgmt] Status load failed', e); }
}

async function loadCuratedStandards() {
  const wrap = qs("#curatedTableWrap");
  if(!wrap) return;
  wrap.innerHTML = '<p class="muted-hint">Loading curated standards...</p>';
  try {
    const res = await fetch(`${API_BASE}/api/admin/standards`);
    const data = await res.json();
    const stds = data.curated_standards || [];
    if(!stds.length) { wrap.innerHTML = '<p class="muted-hint">No curated standards found.</p>'; return; }
    wrap.innerHTML = `
      <div class="curated-stds-grid">
        ${stds.map(s => `
          <div class="curated-std-card">
            <div class="csc-header">
              <strong>${escHtml(s.standard_number)}</strong>
              <span class="pill ${s.status==='current'?'green':'amber'}">${s.status||'?'}</span>
            </div>
            <p class="csc-title">${escHtml(s.title)}</p>
            <div class="csc-meta">
              <span>📂 ${escHtml(s.category||'?')}</span>
              <span>🏷️ ${escHtml(s.certification_scheme||'BIS')}</span>
              ${s.qco_mandatory?'<span class="pill-mini qco">QCO</span>':''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch(e) { wrap.innerHTML = '<p class="muted-hint">Failed to load. Check server.</p>'; }
}

async function loadGraphRelationships() {
  const wrap = qs("#graphRelTable");
  if(!wrap) return;
  wrap.innerHTML = '<p class="muted-hint">Loading graph relationships...</p>';
  try {
    const res = await fetch(`${API_BASE}/api/admin/graph`);
    const data = await res.json();
    const rels = data.relationships || [];
    if(!rels.length) { wrap.innerHTML = '<p class="muted-hint">No graph relationships found.</p>'; return; }
    wrap.innerHTML = `
      <div class="graph-rel-header">${rels.length} relationship edges in knowledge graph</div>
      <div class="graph-rel-list">
        ${rels.slice(0,40).map(r => `
          <div class="graph-rel-row">
            <span class="grel-source">${escHtml(r.source||'?')}</span>
            <span class="grel-arrow">→</span>
            <span class="grel-type rel-${(r.relation||'').toLowerCase()}">${escHtml(r.label||r.relation||'?')}</span>
            <span class="grel-target">${escHtml(r.target||'?')}</span>
          </div>
        `).join('')}
        ${rels.length>40 ? `<p class="muted-hint">…and ${rels.length-40} more relationships</p>` : ''}
      </div>
    `;
  } catch(e) { wrap.innerHTML = '<p class="muted-hint">Failed to load graph. Check server.</p>'; }
}

async function triggerReindex() {
  const btn = qs("#btnReindex");
  const statusDiv = qs("#reindexStatus");
  if(btn) { btn.disabled = true; btn.textContent = '🔄 Re-indexing...'; }
  if(statusDiv) { statusDiv.style.display='block'; statusDiv.className='reindex-status running'; statusDiv.textContent = 'Building TF-IDF vector index... This may take 30-60 seconds.'; }
  try {
    const res = await fetch(`${API_BASE}/api/admin/reindex`, { method: 'POST' });
    const data = await res.json();
    if(data.ok) {
      if(statusDiv) { statusDiv.className='reindex-status success'; statusDiv.innerHTML = `✅ ${data.message}<br><small>${data.timestamp}</small>`; }
      toast(`Re-index complete! ${Number(data.standards_indexed).toLocaleString()} standards indexed.`, 'success');
      addAudit(`Standards Administrator triggered re-index: ${data.standards_indexed} standards loaded.`);
      loadStandardsMgmtStatus();
    } else {
      if(statusDiv) { statusDiv.className='reindex-status error'; statusDiv.textContent = `❌ Error: ${data.error}`; }
      toast('Re-index failed. Check server logs.', 'error');
    }
  } catch(e) {
    if(statusDiv) { statusDiv.className='reindex-status error'; statusDiv.textContent = '❌ Server unreachable.'; }
    toast('Re-index request failed.', 'error');
  } finally {
    if(btn) { btn.disabled = false; btn.innerHTML = '<span>🔄</span> Trigger Full Re-index'; }
  }
}

async function loadFeedbackAnalytics() {
  const panel = qs("#feedbackAnalyticsPanel");
  if(!panel) return;
  panel.style.display = 'block';
  panel.innerHTML = '<p class="muted-hint">Loading feedback analytics...</p>';
  try {
    const res = await fetch(`${API_BASE}/api/feedback`);
    const data = await res.json();
    const decisions = data.decisions || [];
    const accepted = decisions.filter(d=>d.decision==='accepted').length;
    const rejected = decisions.filter(d=>d.decision==='rejected').length;
    const edited = decisions.filter(d=>d.decision==='edited').length;
    panel.innerHTML = `
      <div class="fa-stats">
        <div class="fa-stat green"><strong>${accepted}</strong><span>Accepted</span></div>
        <div class="fa-stat red"><strong>${rejected}</strong><span>Rejected</span></div>
        <div class="fa-stat amber"><strong>${edited}</strong><span>Modified</span></div>
        <div class="fa-stat blue"><strong>${decisions.length}</strong><span>Total Reviews</span></div>
      </div>
      <div class="fa-recent">
        <strong>Recent Decisions:</strong>
        ${decisions.slice(0,8).map(d => `
          <div class="fa-row">
            <span class="dec-badge ${d.decision}">${d.decision.toUpperCase()}</span>
            <span>${escHtml(d.standard_number)}</span>
            <span class="fa-user">${escHtml(d.user_name)}</span>
            <span class="fa-time">${d.timestamp?.slice(0,10)||'?'}</span>
          </div>
        `).join('')}
      </div>
    `;
  } catch(e) { panel.innerHTML = '<p class="muted-hint">Failed to load analytics.</p>'; }
}

// Wire Standards Management buttons
qs("#btnReindex")?.addEventListener("click", triggerReindex);
qs("#btnRefreshCurated")?.addEventListener("click", loadCuratedStandards);
qs("#btnRefreshGraph")?.addEventListener("click", loadGraphRelationships);
qs("#btnLoadFeedbackAnalytics")?.addEventListener("click", loadFeedbackAnalytics);
