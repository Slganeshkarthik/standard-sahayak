/**
 * Standards Sahayak (SIH26108) — Multilingual i18n Engine & Indic Dictionary
 * Provides instant 0ms client-side translation and dynamic standard localization
 * for Kannada (ಕನ್ನಡ), Hindi (हिन्दी), Tamil (தமிழ்), Telugu (తెలుగు),
 * Marathi (मराठी), Bengali (বাংলা), Gujarati (ગુજરાતી), and English (English).
 */

const SUPPORTED_LANGUAGES = {
  "en-IN": { code: "en-IN", name: "English", native: "English", flag: "🇬🇧", voice: "en-IN" },
  "kn-IN": { code: "kn-IN", name: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳", voice: "kn-IN" },
  "hi-IN": { code: "hi-IN", name: "Hindi", native: "हिन्दी", flag: "🇮🇳", voice: "hi-IN" },
  "ta-IN": { code: "ta-IN", name: "Tamil", native: "தமிழ்", flag: "🇮🇳", voice: "ta-IN" },
  "te-IN": { code: "te-IN", name: "Telugu", native: "తెలుగు", flag: "🇮🇳", voice: "te-IN" },
  "mr-IN": { code: "mr-IN", name: "Marathi", native: "मराठी", flag: "🇮🇳", voice: "mr-IN" },
  "bn-IN": { code: "bn-IN", name: "Bengali", native: "বাংলা", flag: "🇮🇳", voice: "bn-IN" },
  "gu-IN": { code: "gu-IN", name: "Gujarati", native: "ગુજરાતી", flag: "🇮🇳", voice: "gu-IN" },
  "ml-IN": { code: "ml-IN", name: "Malayalam", native: "മലയാളം", flag: "🇮🇳", voice: "ml-IN" },
  "pa-IN": { code: "pa-IN", name: "Punjabi", native: "ਪੰਜਾਬੀ", flag: "🇮🇳", voice: "pa-IN" },
  "od-IN": { code: "od-IN", name: "Odia", native: "ଓଡ଼ିଆ", flag: "🇮🇳", voice: "od-IN" }
};

let currentAppLanguage = localStorage.getItem("standards_app_language") || "en-IN";

const UI_TRANSLATIONS = {
  "en-IN": {
    app_title: "Standards Sahayak",
    app_subtitle: "AI-Powered BIS Procurement Intelligence",
    auth_signin_tab: "🔐 Sign In",
    auth_register_tab: "📝 Create Account",
    auth_quick_demo: "⚡ Quick Demo Accounts:",
    auth_email_lbl: "Email / Government ID *",
    auth_pass_lbl: "Password *",
    auth_role_lbl: "Select Access Role",
    auth_signin_btn: "🔐 Sign In to Standards Sahayak",
    auth_fullname_lbl: "Full Name *",
    auth_org_lbl: "Organization / Dept *",
    auth_desig_lbl: "Designation",
    auth_assign_role_lbl: "Assign System Role *",
    auth_create_pass_lbl: "Create Password (min 6 characters) *",
    auth_create_btn: "✅ Create Account & Enter Platform",
    auth_hashed_badge: "🔒 Hashed & Verified Security",
    auth_sso_badge: "Govt. of India NIC SSO & GFR 2017",
    
    // Sidebar & Nav
    nav_tender_specs: "Tender Specs",
    nav_standards: "Standards",
    nav_dependency_map: "Dependency Map",
    nav_ai_assistant: "AI Assistant",
    nav_stds_mgmt: "Standards Mgmt",
    nav_audit_trail: "Audit Trail",
    nav_admin: "Admin",
    sidebar_role_label: "Active Role (RBAC)",
    role_officer: "Procurement Officer",
    role_stds_admin: "Standards Administrator",
    role_sys_admin: "System Administrator",
    role_officer_help: "Primary Workspace: Draft specs, run AI RAG, accept/reject & generate GeM clauses",
    role_stds_admin_help: "Knowledge Base: Inspect 13,335 standards, curated catalog & graph dependency editor",
    role_sys_admin_help: "System Admin: Manage system users, role-based access & server infrastructure",
    theme_dark: "Dark mode",
    btn_sign_out: "↩ Sign out",

    // Hero
    hero_eyebrow: "🇮🇳 AI-Powered Indian Standards Intelligence Engine (SIH26108)",
    hero_title: "Explainable & Traceable Indian Standards for Public Procurement.",
    hero_copy: "Converts unstructured tender specifications into ranked, verified Indian Standards with normative dependency maps, latest revision checks, Quality Control Order (QCO) compliance, and automated tender defect intelligence.",
    hero_btn_run: "Run Intelligence Engine",
    hero_btn_hide_details: "Hide details",
    hero_btn_show_details: "Show details",
    hero_metric_indexed: "Standards Indexed",
    hero_metric_curated: "Curated Core Standards",
    hero_metric_active: "Active",
    hero_metric_qco: "QCO Compliance",
    hero_metric_audit: "Audit Trail",
    hero_metric_immutable: "Immutable",

    // Lifecycle
    btn_submit_review: "🔬 Submit for Tech Review",
    btn_finalize_publish: "🚀 Finalize & Publish on GeM",
    stage_draft: "Draft",
    stage_ai_analysis: "AI Analysis",
    stage_officer_review: "Officer Review",
    stage_tech_review: "Tech Review",
    stage_published: "Published (GeM)",
    stage_vendor_submission: "Vendor Submissions",
    stage_compliance_review: "Compliance Verified",

    // Input Tabs
    input_eyebrow: "Input Intelligence",
    input_heading: "Tender Specification Workspace",
    tab_natural: "💬 Natural / Tender Query",
    tab_structured: "⚙️ Structured Spec Form",
    tab_document: "📄 Tender Document Upload",
    tab_multilingual: "🌐 Multilingual Query",
    sample_label: "⚡ Benchmark Samples:",
    sample_motor: "⚡ 3-Phase Induction Motors (Benchmark)",
    sample_outdated_motor: "⚠️ Legacy Motor (IS 325 Defect Test)",
    sample_led: "💡 LED Street Lighting",
    sample_tmt: "🏗️ TMT Rebars (Fe 500D)",
    sample_cement: "🧱 OPC 43/53 Cement",
    sample_cables: "⚡ Heavy Duty Cables",
    sample_pipes: "💧 DI Pressure Pipes",
    sample_solar: "☀️ Rooftop Solar PV",

    // Structured Form
    form_product: "Product Designation *",
    form_voltage: "Operating Voltage",
    form_frequency: "Frequency",
    form_phase: "Phase",
    form_power: "Power Rating",
    form_efficiency: "Efficiency Class",
    form_protection: "Ingress Protection (IP)",
    form_application: "Application Domain",
    btn_apply_form: "🔄 Populate Specification from Form",

    // Document Upload
    upload_title: "Upload Tender Document (PDF or DOCX)",
    upload_sub: "Drag and drop tender file (.pdf, .docx, .txt) or click Attach file below",
    btn_select_doc: "📎 Select Document",
    translation_preview_label: "🌐 Live Specification & Language Detection Preview",
    btn_clear_workspace: "🗑️ Clear workspace",
    btn_run_engine: "Run Recommendation Engine",

    // Defect Section
    defect_title: "Tender Intelligence & Risk Detection",
    defect_sub: "Automated audit of tender references, missing testing protocols, and specification conflicts",
    outdated_alert_badge: "⚠️ OUTDATED / SUPERSEDED STANDARD DETECTED",
    missing_alert_badge: "⚠️ MISSING MANDATORY ALLIED STANDARD",
    conflict_alert_badge: "⚠️ SPECIFICATION CONFLICT / INCONSISTENCY",
    btn_replace_spec: "🔄 Replace in Specification",
    btn_add_scope: "➕ Add to Inspection Scope",

    // Parameters Panel
    params_eyebrow: "Requirement Extraction (NLP & Entity Mining)",
    params_heading: "Structured Technical Parameters",
    pill_calibrated: "Calibrated Extraction",
    rag_summary_title: "🤖 Procurement Intelligence Summary",

    // Results Panel
    results_eyebrow: "Hybrid Retrieval & Recommendation Engine",
    results_heading: "Recommended Indian Standards",
    btn_export_docx: "📥 DOCX Report",
    btn_export_pdf: "📄 PDF Report",
    btn_gem_clause: "📋 Copy GeM Clause",
    filter_all: "All Standards",
    filter_primary: "Primary Product",
    filter_safety: "Safety & Ingress",
    filter_install: "Installation & Maint.",
    filter_test: "Test Method",
    filter_superseded: "⚠️ Superseded",
    filter_qco: "🏷️ QCO Mandatory",
    search_placeholder: "🔍 Search IS number, title, technical scope or ICS…",
    status_current: "Current (Active)",
    status_superseded: "Superseded",
    status_withdrawn: "Withdrawn",
    sort_confidence: "Sort by Relevance",
    sort_status: "Sort by Status",
    sort_category: "Sort by Category",

    // Detail Panel
    detail_eyebrow: "Standard Intelligence Detail",
    detail_why_title: "🎯 Why This Standard? (Explainability Checklist)",
    detail_status_lbl: "Status",
    detail_edition_lbl: "Edition & Year",
    detail_ics_lbl: "ICS Classification",
    detail_cert_lbl: "Statutory Certification",
    detail_scope_lbl: "Scope Explanation",
    btn_view_bis: "🌐 View on BIS Portal ↗",
    btn_accept: "✓ Accept",
    btn_reject: "✕ Reject",
    btn_suggest_edit: "✎ Suggest Edit",
    btn_compare: "Compare",

    // AI Chatbot
    chat_title: "Standards AI Assistant",
    chat_placeholder: "Ask about standards, recommendations, or click 🎤 to speak...",
    chat_speak_btn: "🔊 Listen",
    chat_stop_btn: "⏹️ Playing...",
    chat_clear_title: "Clear conversation",
    chat_footer: "🔒 Context-aware RAG • Evidence from 13,335 BIS Standards",
    
    // Modal
    modal_officer_review: "Procurement Officer Review",
    modal_decision_lbl: "Decision Action",
    modal_justification_lbl: "Justification & Audit Rationale *",
    modal_cancel_btn: "Cancel",
    modal_record_btn: "💾 Record Decision in Audit Log"
  },

  "kn-IN": {
    app_title: "ಸ್ಟ್ಯಾಂಡರ್ಡ್ಸ್ ಸಹಾಯಕ",
    app_subtitle: "ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಆಧಾರಿತ BIS ಖರೀದಿ ಗುಪ್ತಚರ ಎಂಜಿನ್",
    auth_signin_tab: "🔐 ಸೈನ್ ಇನ್",
    auth_register_tab: "📝 ಖಾತೆ ರಚಿಸಿ",
    auth_quick_demo: "⚡ ಡೆಮೊ ಖಾತೆಗಳು:",
    auth_email_lbl: "ಅಧಿಕೃತ ಇಮೇಲ್ / ಸರ್ಕಾರಿ ಐಡಿ *",
    auth_pass_lbl: "ಪಾಸ್‌ವರ್ಡ್ *",
    auth_role_lbl: "ಪ್ರವೇಶ ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    auth_signin_btn: "🔐 ಸ್ಟ್ಯಾಂಡರ್ಡ್ಸ್ ಸಹಾಯಕಕ್ಕೆ ಸೈನ್ ಇನ್ ಮಾಡಿ",
    auth_fullname_lbl: "ಪೂರ್ಣ ಹೆಸರು *",
    auth_org_lbl: "ಸಂಸ್ಥೆ / ಇಲಾಖೆ *",
    auth_desig_lbl: "ಹುದ್ದೆ",
    auth_assign_role_lbl: "ಸಿಸ್ಟಮ್ ಪಾತ್ರ ನಿಯೋಜಿಸಿ *",
    auth_create_pass_lbl: "ಪಾಸ್‌ವರ್ಡ್ ರಚಿಸಿ (ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳು) *",
    auth_create_btn: "✅ ಖಾತೆ ರಚಿಸಿ & ವೇದಿಕೆಗೆ ಪ್ರವೇಶಿಸಿ",
    auth_hashed_badge: "🔒 ಹ್ಯಾಶ್ ಮಾಡಿದ ಸುರಕ್ಷಿತ ಭದ್ರತೆ",
    auth_sso_badge: "ಭಾರತ ಸರ್ಕಾರ NIC SSO & GFR 2017",

    // Sidebar & Nav
    nav_tender_specs: "ಟೆಂಡರ್ ವಿವರಣೆಗಳು",
    nav_standards: "ಮಾನದಂಡಗಳು",
    nav_dependency_map: "ಅವಲಂಬನೆ ನಕ್ಷೆ",
    nav_ai_assistant: "AI ಸಹಾಯಕ",
    nav_stds_mgmt: "ಮಾನದಂಡಗಳ ನಿರ್ವಹಣೆ",
    nav_audit_trail: "ಆಡಿಟ್ ಲಾಗ್",
    nav_admin: "ವ್ಯವಸ್ಥಾಪಕರು",
    sidebar_role_label: "ಸಕ್ರಿಯ ಪಾತ್ರ (RBAC)",
    role_officer: "ಖರೀದಿ ಅಧಿಕಾರಿ (Procurement)",
    role_stds_admin: "ಮಾನದಂಡಗಳ ನಿರ್ವಾಹಕರು",
    role_sys_admin: "ಸಿಸ್ಟಮ್ ಅಡ್ಮಿನ್",
    role_officer_help: "ಮುಖ್ಯ ಕಾರ್ಯಸ್ಥಳ: ವಿಶೇಷಣಗಳನ್ನು ರಚಿಸಿ, AI ವಿಶ್ಲೇಷಣೆ ನಡೆಸಿ, ಮಾನದಂಡ ಸ್ವೀಕರಿಸಿ ಮತ್ತು GeM ಷರತ್ತುಗಳನ್ನು ರಚಿಸಿ",
    role_stds_admin_help: "ಜ್ಞಾನ ಭಂಡಾರ: 13,335 ಮಾನದಂಡಗಳು, ಕ್ಯಾಟಲಾಗ್ ಮತ್ತು ಸಂಬಂಧಗಳ ನಕ್ಷೆಯನ್ನು ನಿರ್ವಹಿಸಿ",
    role_sys_admin_help: "ಸಿಸ್ಟಮ್ ಅಡ್ಮಿನ್: ಬಳಕೆದಾರರು, ಪಾತ್ರಾಧಾರಿತ ಪ್ರವೇಶ ಮತ್ತು ಸರ್ವರ್ ನಿರ್ವಹಣೆ",
    theme_dark: "ಡಾರ್ಕ್ ಮೋಡ್",
    btn_sign_out: "↩ ಸೈನ್ ಔಟ್",

    // Hero
    hero_eyebrow: "🇮🇳 ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಆಧಾರಿತ ಭಾರತೀಯ ಮಾನದಂಡಗಳ ಖರೀದಿ ಗುಪ್ತಚರ (SIH26108)",
    hero_title: "ಸಾರ್ವಜನಿಕ ಖರೀದಿಗಾಗಿ ವಿವರಣಾತ್ಮಕ ಮತ್ತು ಪತ್ತೆಹಚ್ಚಬಹುದಾದ ಭಾರತೀಯ ಮಾನದಂಡಗಳು.",
    hero_copy: "ಟೆಂಡರ್ ವಿಶೇಷಣಗಳನ್ನು ಪರಿಶೀಲಿಸಿ, ಸೂಕ್ತ ಭಾರತೀಯ ಮಾನದಂಡಗಳನ್ನು (BIS) ಪತ್ತೆಹಚ್ಚುತ್ತದೆ, ಗುಣಮಟ್ಟ ನಿಯಂತ್ರಣ ಆದೇಶಗಳ (QCO) ಅನುಸರಣೆ ಪರಿಶೀಲಿಸುತ್ತದೆ ಮತ್ತು ಟೆಂಡರ್ ದೋಷಗಳನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಪತ್ತೆ ಮಾಡುತ್ತದೆ.",
    hero_btn_run: "ಗುಪ್ತಚರ ಎಂಜಿನ್ ಚಲಾಯಿಸಿ",
    hero_btn_hide_details: "ವಿವರಗಳನ್ನು ಮರೆಮಾಡಿ",
    hero_btn_show_details: "ವಿವರಗಳನ್ನು ತೋರಿಸಿ",
    hero_metric_indexed: "ಮಾನದಂಡಗಳ ಸಂಖ್ಯೆ",
    hero_metric_curated: "ಕ್ಯುರೇಟೆಡ್ ಮಾನದಂಡಗಳು",
    hero_metric_active: "ಸಕ್ರಿಯ",
    hero_metric_qco: "QCO ಅನುಸರಣೆ",
    hero_metric_audit: "ಆಡಿಟ್ ಲಾಗ್",
    hero_metric_immutable: "ಬದಲಾಯಿಸಲಾಗದ",

    // Lifecycle
    btn_submit_review: "🔬 ತಾಂತ್ರಿಕ ಪರಿಶೀಲನೆಗೆ ಸಲ್ಲಿಸಿ",
    btn_finalize_publish: "🚀 ಅಂತಿಮಗೊಳಿಸಿ & GeM ನಲ್ಲಿ ಪ್ರಕಟಿಸಿ",
    stage_draft: "ಕರಡು",
    stage_ai_analysis: "AI ವಿಶ್ಲೇಷಣೆ",
    stage_officer_review: "ಅಧಿಕಾರಿ ಪರಿಶೀಲನೆ",
    stage_tech_review: "ತಾಂತ್ರಿಕ ಪರಿಶೀಲನೆ",
    stage_published: "ಪ್ರಕಟಿಸಲಾಗಿದೆ (GeM)",
    stage_vendor_submission: "ಬಿಡ್ಡರ್ ಸಲ್ಲಿಕೆಗಳು",
    stage_compliance_review: "ಅನುಸರಣೆ ಪರಿಶೀಲನೆ",

    // Input Tabs
    input_eyebrow: "ಇನ್‌ಪುಟ್ ಗುಪ್ತಚರ",
    input_heading: "ಟೆಂಡರ್ ನಿರ್ದಿಷ್ಟತೆಯ ಕಾರ್ಯಕ್ಷೇತ್ರ",
    tab_natural: "💬 ನೈಸರ್ಗಿಕ / ಟೆಂಡರ್ ಪಠ್ಯ",
    tab_structured: "⚙️ ರಚನಾತ್ಮಕ ಫಾರ್ಮ್",
    tab_document: "📄 ಟೆಂಡರ್ ದಾಖಲೆ ಅಪ್ಲೋಡ್",
    tab_multilingual: "🌐 ಬಹುಭಾಷಾ ಪ್ರಶ್ನೆ",
    sample_label: "⚡ ಮಾದರಿ ಟೆಂಡರ್‌ಗಳು:",
    sample_motor: "⚡ 3-ಹಂತದ ಇಂಡಕ್ಷನ್ ಮೋಟರ್‌ಗಳು",
    sample_outdated_motor: "⚠️ ಹಳೆಯ ಮೋಟರ್ (IS 325 ದೋಷ ಪರೀಕ್ಷೆ)",
    sample_led: "💡 LED ಬೀದಿ ದೀಪಗಳು",
    sample_tmt: "🏗️ TMT ಉಕ್ಕಿನ ಕಂಬಿಗಳು (Fe 500D)",
    sample_cement: "🧱 OPC 43/53 ಸಿಮೆಂಟ್",
    sample_cables: "⚡ ಹೆವಿ ಡ್ಯೂಟಿ ಕೇಬಲ್‌ಗಳು",
    sample_pipes: "💧 DI ಒತ್ತಡದ ಪೈಪ್‌ಗಳು",
    sample_solar: "☀️ ರೂಫ್‌ಟಾಪ್ ಸೋಲಾರ್ PV",

    // Structured Form
    form_product: "ಉತ್ಪನ್ನದ ಹೆಸರು *",
    form_voltage: "ಕಾರ್ಯಾಚರಣಾ ವೋಲ್ಟೇಜ್",
    form_frequency: "ಆವರ್ತನ (Frequency)",
    form_phase: "ಹಂತ (Phase)",
    form_power: "ವಿದ್ಯುತ್ ಸಾಮರ್ಥ್ಯ (Power)",
    form_efficiency: "ದಕ್ಷತೆಯ ವರ್ಗ (Efficiency)",
    form_protection: "ಪ್ರವೇಶ ರಕ್ಷಣೆ (IP ರಕ್ಷಣೆ)",
    form_application: "ಅನ್ವಯ ಕ್ಷೇತ್ರ (Application)",
    btn_apply_form: "🔄 ಫಾರ್ಮ್‌ನಿಂದ ವಿವರಣೆಯನ್ನು ಅನ್ವಯಿಸಿ",

    // Document Upload
    upload_title: "ಟೆಂಡರ್ ದಾಖಲೆ ಅಪ್ಲೋಡ್ ಮಾಡಿ (PDF ಅಥವಾ DOCX)",
    upload_sub: "ಟೆಂಡರ್ ಫೈಲ್ ಡ್ರ್ಯಾಗ್ ಮತ್ತು ಡ್ರಾಪ್ ಮಾಡಿ ಅಥವಾ ಕೆಳಗೆ ಲಗತ್ತಿಸಿ",
    btn_select_doc: "📎 ದಾಖಲೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    translation_preview_label: "🌐 ನೇರ ವಿವರಣೆ ಮತ್ತು ಭಾಷಾ ಪತ್ತೆ ಮುನ್ನೋಟ",
    btn_clear_workspace: "🗑️ ಖಾಲಿ ಮಾಡಿ",
    btn_run_engine: "ಶಿಫಾರಸು ಎಂಜಿನ್ ಚಲಾಯಿಸಿ",

    // Defect Section
    defect_title: "ಟೆಂಡರ್ ಗುಪ್ತಚರ ಮತ್ತು ಅಪಾಯ ಪತ್ತೆ",
    defect_sub: "ಟೆಂಡರ್ ಉಲ್ಲೇಖಗಳು, ಕಾಣೆಯಾದ ಪರೀಕ್ಷಾ ಪ್ರೋಟೋಕಾಲ್‌ಗಳು ಮತ್ತು ವಿಶೇಷಣಗಳ ಸಂಘರ್ಷದ ಸ್ವಯಂಚಾಲಿತ ಲೆಕ್ಕಪರಿಶೋಧನೆ",
    outdated_alert_badge: "⚠️ ಹಳೆಯ / ಅಮಾನ್ಯ ಮಾನದಂಡ ಪತ್ತೆಯಾಗಿದೆ",
    missing_alert_badge: "⚠️ ಕಡ್ಡಾಯ ಪರೀಕ್ಷಾ ಮಾನದಂಡ ಕಾಣೆಯಾಗಿದೆ",
    conflict_alert_badge: "⚠️ ವಿಶೇಷಣಗಳ ಸಂಘರ್ಷ / ಹೊಂದಾಣಿಕೆಯಿಲ್ಲ",
    btn_replace_spec: "🔄 ವಿವರಣೆಯಲ್ಲಿ ಬದಲಾಯಿಸಿ",
    btn_add_scope: "➕ ತಪಾಸಣಾ ವ್ಯಾಪ್ತಿಗೆ ಸೇರಿಸಿ",

    // Parameters Panel
    params_eyebrow: "ಅವಶ್ಯಕತೆ ಹೊರತೆಗೆಯುವಿಕೆ (NLP ಮತ್ತು ಎಂಟಿಟಿ ಮೈನಿಂಗ್)",
    params_heading: "ರಚನಾತ್ಮಕ ತಾಂತ್ರಿಕ ನಿಯತಾಂಕಗಳು",
    pill_calibrated: "ಕ್ಯಾಲಿಬ್ರೇಟೆಡ್ ಪರಿಶೀಲನೆ",
    rag_summary_title: "🤖 ಖರೀದಿ ಗುಪ್ತಚರ ಸಾರಾಂಶ",

    // Results Panel
    results_eyebrow: "ಹೈಬ್ರಿಡ್ ಮರುಪಡೆಯುವಿಕೆ ಮತ್ತು ಶಿಫಾರಸು ಎಂಜಿನ್",
    results_heading: "ಶಿಫಾರಸು ಮಾಡಲಾದ ಭಾರತೀಯ ಮಾನದಂಡಗಳು (BIS)",
    btn_export_docx: "📥 DOCX ವರದಿ ಡೌನ್‌ಲೋಡ್",
    btn_export_pdf: "📄 PDF ವರದಿ ಡೌನ್‌ಲೋಡ್",
    btn_gem_clause: "📋 GeM ಷರತ್ತು ನಕಲಿಸಿ",
    filter_all: "ಎಲ್ಲಾ ಮಾನದಂಡಗಳು",
    filter_primary: "ಪ್ರಾಥಮಿಕ ಉತ್ಪನ್ನ",
    filter_safety: "ಸುರಕ್ಷತೆ & IP ರಕ್ಷಣೆ",
    filter_install: "ಅಳವಡಿಕೆ & ನಿರ್ವಹಣೆ",
    filter_test: "ಪರೀಕ್ಷಾ ವಿಧಾನ",
    filter_superseded: "⚠️ ಹಳೆಯದು (ಅಮಾನ್ಯ)",
    filter_qco: "🏷️ ಕಡ್ಡಾಯ QCO ಆದೇಶ",
    search_placeholder: "🔍 IS ಸಂಖ್ಯೆ, ಶೀರ್ಷಿಕೆ, ತಾಂತ್ರಿಕ ವ್ಯಾಪ್ತಿ ಹುಡುಕಿ…",
    status_current: "ಪ್ರಸ್ತುತ (ಸಕ್ರಿಯ)",
    status_superseded: "ಹಳೆಯದು",
    status_withdrawn: "ಹಿಂಪಡೆಯಲಾಗಿದೆ",
    sort_confidence: "ಪ್ರಸ್ತುತತೆಯ ಆಧಾರದ ಮೇಲೆ",
    sort_status: "ಸ್ಥಿತಿಯ ಆಧಾರದ ಮೇಲೆ",
    sort_category: "ವರ್ಗದ ಆಧಾರದ ಮೇಲೆ",

    // Detail Panel
    detail_eyebrow: "ಮಾನದಂಡದ ಗುಪ್ತಚರ ವಿವರಣೆ",
    detail_why_title: "🎯 ಈ ಮಾನದಂಡವನ್ನು ಏಕೆ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ?",
    detail_status_lbl: "ಸ್ಥಿತಿ",
    detail_edition_lbl: "ಆವೃತ್ತಿ & ವರ್ಷ",
    detail_ics_lbl: "ICS ವರ್ಗೀಕರಣ",
    detail_cert_lbl: "ಶಾಸನಬದ್ಧ ಪ್ರಮಾಣೀಕರಣ",
    detail_scope_lbl: "ವ್ಯಾಪ್ತಿಯ ವಿವರಣೆ",
    btn_view_bis: "🌐 BIS ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ವೀಕ್ಷಿಸಿ ↗",
    btn_accept: "✓ ಸ್ವೀಕರಿಸಿ",
    btn_reject: "✕ ತಿರಸ್ಕರಿಸಿ",
    btn_suggest_edit: "✎ ತಿದ್ದುಪಡಿ ಸೂಚಿಸಿ",
    btn_compare: "ಹೋಲಿಕೆ ಮಾಡಿ",

    // AI Chatbot
    chat_title: "ಸ್ಟ್ಯಾಂಡರ್ಡ್ಸ್ AI ಸಹಾಯಕ",
    chat_placeholder: "ಮಾನದಂಡಗಳ ಬಗ್ಗೆ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ, ಅಥವಾ ಮಾತನಾಡಲು 🎤 ಕ್ಲಿಕ್ ಮಾಡಿ...",
    chat_speak_btn: "🔊 ಆಲಿಸಿ (ಕನ್ನಡ ಧ್ವನಿ)",
    chat_stop_btn: "⏹️ ನುಡಿಸಲಾಗುತ್ತಿದೆ...",
    chat_clear_title: "ಸಂಭಾಷಣೆಯನ್ನು ಅಳಿಸಿ",
    chat_footer: "🔒 ಸಂದರ್ಭ-ಅರಿವುಳ್ಳ RAG • 13,335 BIS ಮಾನದಂಡಗಳ ಅಧಿಕೃತ ಮಾಹಿತಿ",

    // Modal
    modal_officer_review: "ಖರೀದಿ ಅಧಿಕಾರಿ ಪರಿಶೀಲನೆ",
    modal_decision_lbl: "ನಿರ್ಧಾರ ಕ್ರಮ",
    modal_justification_lbl: "ತಾಂತ್ರಿಕ ಸಮರ್ಥನೆ & ಆಡಿಟ್ ವಿವರಣೆ *",
    modal_cancel_btn: "ರದ್ದುಮಾಡಿ",
    modal_record_btn: "💾 ಆಡಿಟ್ ಲಾಗ್‌ನಲ್ಲಿ ನಿರ್ಧಾರ ದಾಖಲಿಸಿ"
  },

  "hi-IN": {
    app_title: "स्टैंडर्ड्स सहायक",
    app_subtitle: "एआई-आधारित भारतीय मानक (BIS) खरीद इंटेलिजेंस",
    auth_signin_tab: "🔐 साइन इन",
    auth_register_tab: "📝 नया खाता बनाएं",
    auth_quick_demo: "⚡ त्वरित डेमो खाते:",
    auth_email_lbl: "ईमेल / सरकारी आईडी *",
    auth_pass_lbl: "पासवर्ड *",
    auth_role_lbl: "पहुंच भूमिका चुनें",
    auth_signin_btn: "🔐 स्टैंडर्ड्स सहायक में साइन इन करें",
    auth_fullname_lbl: "पूरा नाम *",
    auth_org_lbl: "संगठन / विभाग *",
    auth_desig_lbl: "पदनाम",
    auth_assign_role_lbl: "सिस्टम भूमिका असाइन करें *",
    auth_create_pass_lbl: "पासवर्ड बनाएं (न्यूनतम 6 अक्षर) *",
    auth_create_btn: "✅ खाता बनाएं और प्रवेश करें",
    auth_hashed_badge: "🔒 हैशेड और सुरक्षित प्रमाणीकरण",
    auth_sso_badge: "भारत सरकार NIC SSO और GFR 2017",

    // Sidebar & Nav
    nav_tender_specs: "निविदा विवरण",
    nav_standards: "मानक (BIS)",
    nav_dependency_map: "निर्भरता मानचित्र",
    nav_ai_assistant: "एआई सहायक",
    nav_stds_mgmt: "मानक प्रबंधन",
    nav_audit_trail: "ऑडिट ट्रेल",
    nav_admin: "व्यवस्थापक",
    sidebar_role_label: "सक्रिय भूमिका (RBAC)",
    role_officer: "खरीद अधिकारी",
    role_stds_admin: "मानक प्रशासक",
    role_sys_admin: "सिस्टम एडमिन",
    role_officer_help: "मुख्य कार्यक्षेत्र: विनिर्देशों का विश्लेषण, एआई आरएजी और जीईएम क्लॉज निर्माण",
    theme_dark: "डार्क मोड",
    btn_sign_out: "↩ साइन आउट",

    // Hero
    hero_eyebrow: "🇮🇳 एआई-संचालित भारतीय मानक खरीद इंटेलिजेंस इंजन (SIH26108)",
    hero_title: "सार्वजनिक खरीद के लिए व्याख्यात्मक और सटीक भारतीय मानक।",
    hero_copy: "निविदा विनिर्देशों को रैंक किए गए भारतीय मानकों (BIS) में बदलता है, गुणवत्ता नियंत्रण आदेश (QCO) अनुपालन सुनिश्चित करता है और दोषों का पता लगाता है।",
    hero_btn_run: "इंटेलिजेंस इंजन चलाएं",
    hero_btn_hide_details: "विवरण छिपाएं",
    hero_btn_show_details: "विवरण दिखाएं",
    hero_metric_indexed: "अनुक्रमित मानक",
    hero_metric_curated: "सत्यापित मानक",
    hero_metric_active: "सक्रिय",
    hero_metric_qco: "QCO अनुपालन",
    hero_metric_audit: "ऑडिट ट्रेल",
    hero_metric_immutable: "अपरिवर्तनीय",

    // Lifecycle
    btn_submit_review: "🔬 तकनीकी समीक्षा के लिए भेजें",
    btn_finalize_publish: "🚀 अंतिम रूप दें और GeM पर प्रकाशित करें",
    stage_draft: "प्रारूप",
    stage_ai_analysis: "एआई विश्लेषण",
    stage_officer_review: "अधिकारी समीक्षा",
    stage_tech_review: "तकनीकी समीक्षा",
    stage_published: "प्रकाशित (GeM)",
    stage_vendor_submission: "विक्रेता प्रस्तुतियाँ",
    stage_compliance_review: "अनुपालन सत्यापित",

    // Input
    input_eyebrow: "इनपुट इंटेलिजेंस",
    input_heading: "निविदा विनिर्देश कार्यक्षेत्र",
    tab_natural: "💬 प्राकृतिक भाषा / निविदा पाठ",
    tab_structured: "⚙️ संरचित विनिर्देश फॉर्म",
    tab_document: "📄 निविदा दस्तावेज अपलोड",
    tab_multilingual: "🌐 बहुभाषी प्रश्न",
    sample_label: "⚡ बेंचमार्क नमूने:",
    sample_motor: "⚡ 3-फेज इंडक्शन मोटर्स (बेंचमार्क)",
    sample_outdated_motor: "⚠️ पुराना मोटर मानक (IS 325 परीक्षण)",
    sample_led: "💡 एलईडी स्ट्रीट लाइटिंग",
    sample_tmt: "🏗️ टीएमटी रीबार (Fe 500D)",
    sample_cement: "🧱 ओपीसी 43/53 सीमेंट",
    sample_cables: "⚡ भारी शुल्क केबल",
    sample_pipes: "💧 डीआई दबाव पाइप",
    sample_solar: "☀️ रूफटॉप सोलर पीवी",

    // Defect
    defect_title: "निविदा इंटेलिजेंस और जोखिम पहचान",
    defect_sub: "पुराने मानकों, गायब परीक्षण प्रोटोकॉल और विनिर्देश विरोधाभासों का स्वचालित ऑडिट",
    outdated_alert_badge: "⚠️ पुराना / अप्रचलित मानक पाया गया",
    missing_alert_badge: "⚠️ अनिवार्य परीक्षण मानक गायब है",
    conflict_alert_badge: "⚠️ विनिर्देश विरोधाभास",
    btn_replace_spec: "🔄 विनिर्देश में बदलें",
    btn_add_scope: "➕ निरीक्षण दायरे में जोड़ें",

    // Results
    results_eyebrow: "हाइब्रिड खोज और सिफारिश इंजन",
    results_heading: "अनुशंसित भारतीय मानक (BIS)",
    btn_export_docx: "📥 DOCX रिपोर्ट",
    btn_export_pdf: "📄 PDF रिपोर्ट",
    btn_gem_clause: "📋 GeM क्लॉज कॉपी करें",
    filter_all: "सभी मानक",
    filter_primary: "प्राथमिक उत्पाद",
    filter_safety: "सुरक्षा और आईपी कोड",
    filter_install: "स्थापना और रखरखाव",
    filter_test: "परीक्षण विधि",
    filter_superseded: "⚠️ अप्रचलित",
    filter_qco: "🏷️ अनिवार्य QCO",

    // Detail Panel
    detail_eyebrow: "मानक इंटेलिजेंस विवरण",
    detail_why_title: "🎯 यह मानक क्यों अनुशंसित है?",
    detail_status_lbl: "स्थिति",
    detail_edition_lbl: "संस्करण और वर्ष",
    detail_ics_lbl: "ICS वर्गीकरण",
    detail_cert_lbl: "वैधानिक प्रमाणन",
    detail_scope_lbl: "कार्यक्षेत्र विवरण",
    btn_view_bis: "🌐 BIS पोर्टल पर देखें ↗",
    btn_accept: "✓ स्वीकार करें",
    btn_reject: "✕ अस्वीकार करें",
    btn_suggest_edit: "✎ संशोधन सुझाएं",
    btn_compare: "तुलना करें",

    // Chatbot
    chat_title: "स्टैंडर्ड्स एआई सहायक",
    chat_placeholder: "मानकों के बारे में पूछें, या बोलने के लिए 🎤 पर क्लिक करें...",
    chat_speak_btn: "🔊 सुनें",
    chat_stop_btn: "⏹️ बज रहा है...",
    chat_footer: "🔒 संदर्भ-सचेत RAG • 13,335 BIS मानकों से साक्ष्य"
  },

  "ta-IN": {
    app_title: "ஸ்டாண்டர்ட்ஸ் சகாயக்",
    app_subtitle: "AI இந்தியத் தரநிலைகள் (BIS) கொள்முதல் நுண்ணறிவு",
    auth_signin_tab: "🔐 உள்நுழைய",
    auth_register_tab: "📝 கணக்கு உருவாக்க",
    nav_tender_specs: "டெண்டர் விவரங்கள்",
    nav_standards: "தரநிலைகள்",
    nav_dependency_map: "சார்பு வரைபடம்",
    nav_ai_assistant: "AI உதவியாளர்",
    nav_audit_trail: "தணிக்கை பதிவு",
    nav_admin: "நிர்வாகி",
    hero_title: "பொதுக் கொள்முதலுக்கான நம்பகமான இந்தியத் தரநிலைகள்.",
    hero_btn_run: "இயந்திரத்தை இயக்கவும்",
    results_heading: "பரிந்துரைக்கப்பட்ட இந்தியத் தரநிலைகள்",
    btn_export_docx: "📥 DOCX அறிக்கை",
    btn_export_pdf: "📄 PDF அறிக்கை",
    btn_gem_clause: "📋 GeM விதியை நகலெடு",
    chat_title: "AI தரநிலைகள் உதவியாளர்",
    chat_placeholder: "கேள்விகளைக் கேளுங்கள்..."
  },

  "te-IN": {
    app_title: "స్టాండర్డ్స్ సహాయక్",
    app_subtitle: "AI భారతీయ ప్రమాణాలు (BIS) కొనుగోలు ఇంటెలిజెన్స్",
    auth_signin_tab: "🔐 సైన్ ఇన్",
    auth_register_tab: "📝 ఖాతా సృష్టించండి",
    nav_tender_specs: "టెండర్ వివరాలు",
    nav_standards: "ప్రమాణాలు (BIS)",
    nav_dependency_map: "డిపెండెన్సీ మ్యాప్",
    nav_ai_assistant: "AI అసిస్టెంట్",
    nav_audit_trail: "ఆడిట్ లాగ్",
    nav_admin: "అడ్మిన్",
    hero_title: "ప్రభుత్వ కొనుగోళ్ల కోసం స్పష్టమైన భారతీయ ప్రమాణాలు.",
    hero_btn_run: "ఇంటెలిజెన్స్ ఇంజిన్ రన్ చేయండి",
    results_heading: "సిఫార్సు చేయబడిన భారతీయ ప్రమాణాలు",
    btn_export_docx: "📥 DOCX నివేదిక",
    btn_export_pdf: "📄 PDF నివేదిక",
    btn_gem_clause: "📋 GeM నిబంధన కాపీ చేయండి",
    chat_title: "స్టాండర్డ్స్ AI అసిస్టెంట్",
    chat_placeholder: "ప్రమాణాల గురించి అడగండి..."
  },

  "mr-IN": {
    app_title: "स्टँडर्ड्स सहाय्यक",
    app_subtitle: "AI-आधारित भारतीय मानक (BIS) खरेदी बुद्धिमत्ता",
    auth_signin_tab: "🔐 साइन इन",
    auth_register_tab: "📝 खाते तयार करा",
    nav_tender_specs: "निविदा तपशील",
    nav_standards: "मानके (BIS)",
    nav_dependency_map: "अवलंबित्व नकाशा",
    nav_ai_assistant: "AI सहाय्यक",
    nav_audit_trail: "ऑडिट ट्रेल",
    nav_admin: "प्रशासक",
    hero_title: "सार्वजनिक खरेदीसाठी अचूक व स्पष्ट भारतीय मानके.",
    hero_btn_run: "इंटेलिजन्स इंजिन चालवा",
    results_heading: "शिफारस केलेली भारतीय मानके",
    btn_export_docx: "📥 DOCX अहवाल",
    btn_export_pdf: "📄 PDF अहवाल",
    btn_gem_clause: "📋 GeM नियम कॉपी करा",
    chat_title: "स्टँडर्ड्स AI सहाय्यक",
    chat_placeholder: "मानकांबद्दल विचारा..."
  },

  "bn-IN": {
    app_title: "স্ট্যান্ডার্ডস সহায়ক",
    app_subtitle: "এআই-চালিত ভারতীয় মানক (BIS) সংগ্রহ গোয়েন্দা",
    auth_signin_tab: "🔐 সাইন ইন",
    auth_register_tab: "📝 অ্যাকাউন্ট তৈরি করুন",
    nav_tender_specs: "টেন্ডার বিবরণ",
    nav_standards: "মানক (BIS)",
    nav_dependency_map: "নির্ভরতা মানচিত্র",
    nav_ai_assistant: "এআই সহকারী",
    hero_title: "সরকারি ক্রয়ের জন্য ব্যাখ্যামূলক ভারতীয় মানক।",
    hero_btn_run: "ইন্টেলিজেন্স ইঞ্জিন চালান",
    results_heading: "সুপারিশকৃত ভারতীয় মানক",
    btn_export_docx: "📥 DOCX রিপোর্ট",
    btn_export_pdf: "📄 PDF রিপোর্ট",
    btn_gem_clause: "📋 GeM ক্লজ কপি করুন"
  },

  "gu-IN": {
    app_title: "સ્ટાન્ડર્ડ્સ સહાયક",
    app_subtitle: "AI-સંચાલિત ભારતીય ધોરણો (BIS) ખરીદી ઇન્ટેલિજન્સ",
    auth_signin_tab: "🔐 સાઇન ઇન",
    auth_register_tab: "📝 એકાઉન્ટ બનાવો",
    nav_tender_specs: "ટેન્ડર વિશિષ્ટતાઓ",
    nav_standards: "ધોરણો (BIS)",
    hero_title: "જાહેર ખરીદી માટે વિશ્વસનીય ભારતીય ધોરણો.",
    hero_btn_run: "ઇન્ટેલિજન્સ એન્જિન ચલાવો",
    results_heading: "ભલામણ કરેલ ભારતીય ધોરણો",
    btn_export_docx: "📥 DOCX રિપોર્ટ",
    btn_export_pdf: "📄 PDF રિપોર્ટ",
    btn_gem_clause: "📋 GeM કલમ કોપી કરો"
  }
};

/**
 * Detailed Canonical Standards Translations
 * Provides native titles, scopes, reasons, and reasons-checklist for core Indian Standards.
 */
const CANONICAL_STANDARDS_I18N = {
  "IS 12615:2018": {
    "kn-IN": {
      title: "ಶಕ್ತಿ ದಕ್ಷತೆಯ ಮೂರು-ಹಂತದ ಇಂಡಕ್ಷನ್ ಮೋಟರ್‌ಗಳು — ನಿರ್ದಿಷ್ಟತೆ (ಮೂರನೇ ಪರಿಷ್ಕರಣೆ) [IE2, IE3, IE4]",
      category: "ಪ್ರಾಥಮಿಕ ಉತ್ಪನ್ನ ನಿರ್ದಿಷ್ಟತೆ",
      scope: "415V, 50Hz ಕೈಗಾರಿಕಾ 3-ಹಂತದ ಸ್ಕ್ವಿರಲ್ ಕೇಜ್ ಮೋಟರ್‌ಗಳಿಗೆ ಅನ್ವಯಿಸುತ್ತದೆ. IE3 ಮತ್ತು IE4 ಪ್ರೀಮಿಯಂ ಶಕ್ತಿ ದಕ್ಷತೆಯನ್ನು ಕಡ್ಡಾಯಗೊಳಿಸುತ್ತದೆ.",
      reason: "415V, 50Hz, 3-ಹಂತದ ಕೈಗಾರಿಕಾ ಅನ್ವಯಿಕೆಗಳಿಗೆ ಮತ್ತು ಇಂಧನ ದಕ್ಷತೆ IE3/IE4 ಮಾನದಂಡಗಳನ್ನು ಪೂರೈಸಲು ಈ ಮಾನದಂಡ ಅತ್ಯಗತ್ಯ.",
      certification: "ವಿದ್ಯುತ್ ಮೋಟರ್‌ಗಳ ಗುಣಮಟ್ಟ ನಿಯಂತ್ರಣ ಆದೇಶ (QCO) ಅಡಿಯಲ್ಲಿ ಕಡ್ಡಾಯ ISI ಮಾರ್ಕ್",
      why_checks: [
        { criterion: "ಉತ್ಪನ್ನ ಹೊಂದಾಣಿಕೆ", detail: "3-ಹಂತದ ಸ್ಕ್ವಿರಲ್ ಕೇಜ್ ಇಂಡಕ್ಷನ್ ಮೋಟರ್‌ಗಳ ನಿರ್ದಿಷ್ಟತೆಗೆ ನೇರವಾಗಿ ಅನ್ವಯಿಸುತ್ತದೆ" },
        { criterion: "ತಾಂತ್ರಿಕ ನಿಯತಾಂಕಗಳು", detail: "ವೋಲ್ಟೇಜ್ (415V), ಆವರ್ತನ (50Hz), ಮತ್ತು IE3 ಪ್ರೀಮಿಯಂ ದಕ್ಷತೆಯ ಅಗತ್ಯತೆಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ" },
        { criterion: "ಶಾಸನಬದ್ಧ QCO ಆದೇಶ", detail: "ಭಾರತ ಸರ್ಕಾರದ ವಿದ್ಯುತ್ ಮೋಟರ್‌ಗಳ ಕಡ್ಡಾಯ QCO ನಿಯಮಗಳ ಅಡಿಯಲ್ಲಿ ಪ್ರಮಾಣೀಕರಿಸಲಾಗಿದೆ" }
      ]
    },
    "hi-IN": {
      title: "ऊर्जा कुशल तीन-फेज इंडक्शन मोटर्स — विनिर्देश (तीसरा संशोधन) [IE2, IE3, IE4]",
      category: "प्राथमिक उत्पाद विनिर्देश",
      scope: "415V, 50Hz औद्योगिक 3-फेज स्क्वायरल केज मोटर्स को नियंत्रित करता है। IE3/IE4 दक्षता अनिवार्य है।",
      reason: "415V, 50Hz औद्योगिक अनुप्रयोगों और IE3 ऊर्जा दक्षता आवश्यकताओं के लिए यह मानक अनिवार्य है।",
      certification: "इलेक्ट्रिक मोटर्स QCO के तहत अनिवार्य BIS ISI मार्क",
      why_checks: [
        { criterion: "उत्पाद मिलान", detail: "3-फेज इंडक्शन मोटर्स की तकनीकी आवश्यकताओं को सीधे नियंत्रित करता है" },
        { criterion: "तकनीकी पैरामीटर", detail: "415V, 50Hz और IE3 दक्षता वर्गों के साथ पूर्णतः संरेखित" },
        { criterion: "वैधानिक QCO अनुपालन", detail: "भारी उद्योग मंत्रालय के गुणवत्ता नियंत्रण आदेश के तहत अनिवार्य" }
      ]
    }
  },

  "IS 325:1996": {
    "kn-IN": {
      title: "ಮೂರು-ಹಂತದ ಇಂಡಕ್ಷನ್ ಮೋಟರ್‌ಗಳು — ನಿರ್ದಿಷ್ಟತೆ [ಹಳೆಯದು / IS 12615 ನಿಂದ ಬದಲಾಯಿಸಲಾಗಿದೆ]",
      category: "ಹಳೆಯ / ಅಮಾನ್ಯ ಮಾನದಂಡ",
      scope: "ಈ ಮಾನದಂಡವನ್ನು BIS ಹಿಂಪಡೆದಿದೆ ಮತ್ತು IS 12615:2018 ನಿಂದ ಬದಲಾಯಿಸಲಾಗಿದೆ. ಹಳೆಯ ಟೆಂಡರ್‌ಗಳಲ್ಲಿ ಮಾತ್ರ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತದೆ.",
      reason: "ಎಚ್ಚರಿಕೆ: ಈ ಮಾನದಂಡ ಅಮಾನ್ಯವಾಗಿದೆ. ಟೆಂಡರ್‌ನಲ್ಲಿ ಇದನ್ನು IS 12615:2018 ರೊಂದಿಗೆ ತಕ್ಷಣ ಬದಲಾಯಿಸಬೇಕು.",
      certification: "ಅಮಾನ್ಯ - ಹೊಸ ಪರವಾನಗಿಗಳನ್ನು ನೀಡಲಾಗುವುದಿಲ್ಲ"
    },
    "hi-IN": {
      title: "तीन-फेज इंडक्शन मोटर्स — विनिर्देश [अप्रचलित / IS 12615 द्वारा प्रतिस्थापित]",
      category: "अप्रचलित मानक",
      scope: "यह मानक बीआईएस द्वारा वापस ले लिया गया है और IS 12615:2018 द्वारा प्रतिस्थापित किया गया है।",
      reason: "चेतावनी: यह मानक वापस ले लिया गया है। निविदा में इसके स्थान पर IS 12615 निर्दिष्ट करें।",
      certification: "अमान्य - कोई नया लाइसेंस जारी नहीं किया जाता"
    }
  },

  "IS 4029:2010": {
    "kn-IN": {
      title: "ಮೂರು-ಹಂತದ ಇಂಡಕ್ಷನ್ ಮೋಟರ್‌ಗಳ ಪರೀಕ್ಷಾ ಮಾರ್ಗದರ್ಶಿ (ಮೊದಲ ಪರಿಷ್ಕರಣೆ)",
      category: "ಪರೀಕ್ಷಾ ವಿಧಾನ ಮತ್ತು ಗುಣಮಟ್ಟ ಕೋಡ್",
      scope: "ತಾಪಮಾನ ಏರಿಕೆ, ದಕ್ಷತೆ ಮಾಪನ, ಲಾಕ್‌ಡ್-ರೋಟರ್ ಪ್ರಸ್ತುತತೆ ಮತ್ತು ನಷ್ಟ ಪ್ರತ್ಯೇಕತೆಯ ಪರೀಕ್ಷಾ ಪ್ರೋಟೋಕಾಲ್‌ಗಳು.",
      reason: "ಉತ್ಪಾದನಾ ಗುಣಮಟ್ಟ ಮತ್ತು IE3 ದಕ್ಷತೆಯ ಪ್ರಮಾಣೀಕರಣಕ್ಕಾಗಿ ಅಗತ್ಯವಾದ ಪರೀಕ್ಷಾ ವಿಧಾನ.",
      certification: "NABL ಮಾನ್ಯತೆ ಪಡೆದ ಲ್ಯಾಬ್ ಪರೀಕ್ಷಾ ಕೋಡ್"
    },
    "hi-IN": {
      title: "तीन-फेज इंडक्शन मोटर्स के परीक्षण के लिए मार्गदर्शिका (पहला संशोधन)",
      category: "परीक्षण विधि कोड",
      scope: "तापमान वृद्धि, दक्षता मापन और लॉक-रोटर करंट परीक्षण प्रोटोकॉल।",
      reason: "IE3 दक्षता और गुणवत्ता सत्यापन के लिए अनिवार्य परीक्षण कोड।",
      certification: "NABL परीक्षण विधि कोड"
    }
  },

  "IS/IEC 60034-5:2020": {
    "kn-IN": {
      title: "ತಿರುಗುವ ವಿದ್ಯುತ್ ಯಂತ್ರಗಳು — ಆವರಣಗಳ ರಕ್ಷಣೆಯ ಮಟ್ಟ (IP ಕೋಡ್) (IP55/IP65)",
      category: "ಸುರಕ್ಷತೆ ಮತ್ತು ಆವರಣ ರಕ್ಷಣೆ",
      scope: "ಧೂಳು, ನೀರಿನ ಜೆಟ್‌ಗಳು ಮತ್ತು ಕಣಗಳಿಂದ ಮೋಟರ್ ಆವರಣದ ರಕ್ಷಣಾ ವರ್ಗೀಕರಣ (IP55/IP65).",
      reason: "ಕೈಗಾರಿಕಾ ಪರಿಸರದಲ್ಲಿ ಮೋಟಾರ್‌ನ ದೀರ್ಘಾಯುಷ್ಯ ಮತ್ತು ಧೂಳು/ನೀರಿನ ರಕ್ಷಣೆಯನ್ನು ಖಚಿತಪಡಿಸುತ್ತದೆ.",
      certification: "ಕಡ್ಡಾಯ ಕೈಗಾರಿಕಾ ಸುರಕ್ಷತಾ ಕೋಡ್"
    },
    "hi-IN": {
      title: "घूर्णन विद्युत मशीनें — बाड़ों द्वारा प्रदान की गई सुरक्षा की डिग्री (आईपी कोड)",
      category: "सुरक्षा एवं सुरक्षा कोड",
      scope: "धूल और पानी से सुरक्षा (IP55/IP65) का वर्गीकरण।",
      reason: "औद्योगिक वातावरण में मोटर की सुरक्षा और विश्वसनीयता सुनिश्चित करता है।",
      certification: "अनिवार्य औद्योगिक सुरक्षा कोड"
    }
  },

  "IS 1786:2008": {
    "kn-IN": {
      title: "ಕಾಂಕ್ರೀಟ್ ಬಲವರ್ಧನೆಗಾಗಿ ಹೆಚ್ಚಿನ ಸಾಮರ್ಥ್ಯದ ಉಕ್ಕಿನ ಕಂಬಿಗಳು ಮತ್ತು ತಂತಿಗಳು — ನಿರ್ದಿಷ್ಟತೆ (Fe 500D TMT ರಿಬಾರ್‌ಗಳು)",
      category: "ಪ್ರಾಥಮಿಕ ಉತ್ಪನ್ನ ನಿರ್ದಿಷ್ಟತೆ",
      scope: "RCC ಸೇತುವೆಗಳು, ಅಣೆಕಟ್ಟುಗಳು ಮತ್ತು ಕಟ್ಟಡ ನಿರ್ಮಾಣಕ್ಕಾಗಿ Fe 500, Fe 500D, Fe 550D TMT ಉಕ್ಕಿನ ಕಂಬಿಗಳು.",
      reason: "ಕಟ್ಟಡ ಮತ್ತು ಸೇತುವೆ ನಿರ್ಮಾಣಕ್ಕಾಗಿ ಅತ್ಯುನ್ನತ ಕರ್ಷಕ ಸಾಮರ್ಥ್ಯ ಮತ್ತು ನಮ್ಯತೆ ಒದಗಿಸುತ್ತದೆ.",
      certification: "ಉಕ್ಕಿನ ಉತ್ಪನ್ನಗಳ QCO ಅಡಿಯಲ್ಲಿ ಕಡ್ಡಾಯ BIS ISI ಮಾರ್ಕ್"
    },
    "hi-IN": {
      title: "कंक्रीट सुदृढीकरण के लिए उच्च शक्ति वाले विकृत स्टील बार और तार (Fe 500D TMT रीबार)",
      category: "प्राथमिक उत्पाद विनिर्देश",
      scope: "आरसीसी पुलों और भवनों के लिए Fe 500D टीएमटी स्टील बार।",
      reason: "संरचनात्मक कंक्रीट कार्यों के लिए उच्च तन्यता शक्ति प्रदान करता है।",
      certification: "स्टील QCO के तहत अनिवार्य ISI मार्क"
    }
  },

  "IS 269:2015": {
    "kn-IN": {
      title: "ಸಾಮಾನ್ಯ ಪೋರ್ಟ್‌ಲ್ಯಾಂಡ್ ಸಿಮೆಂಟ್ — ನಿರ್ದಿಷ್ಟತೆ (OPC 43 & 53 ಗ್ರೇಡ್)",
      category: "ಪ್ರಾಥಮಿಕ ಉತ್ಪನ್ನ ನಿರ್ದಿಷ್ಟತೆ",
      scope: "ರಚನಾತ್ಮಕ ಕಾಂಕ್ರೀಟ್ ಕಾಮಗಾರಿಗಳಿಗಾಗಿ 33, 43 ಮತ್ತು 53 ಗ್ರೇಡ್ ಸಾಮಾನ್ಯ ಪೋರ್ಟ್‌ಲ್ಯಾಂಡ್ ಸಿಮೆಂಟ್.",
      reason: "ಉನ್ನತ ಮಟ್ಟದ ಸಂಕೋಚನ ಸಾಮರ್ಥ್ಯ ಮತ್ತು ಬಾಳಿಕೆಯನ್ನು ಖಚಿತಪಡಿಸುತ್ತದೆ.",
      certification: "ಸಿಮೆಂಟ್ QCO ಅಡಿಯಲ್ಲಿ ಕಡ್ಡಾಯ BIS ISI ಪ್ರಮಾಣೀಕರಣ"
    }
  },

  "IS 694:2010": {
    "kn-IN": {
      title: "1100 V ವರೆಗಿನ PVC ಇನ್ಸುಲೇಟೆಡ್ ತಂತಿಗಳು ಮತ್ತು ಹೆವಿ ಡ್ಯೂಟಿ ಕೇಬಲ್‌ಗಳು — ನಿರ್ದಿಷ್ಟತೆ",
      category: "ಪ್ರಾಥಮಿಕ ವಿದ್ಯುತ್ ನಿರ್ದಿಷ್ಟತೆ",
      scope: "ವಿದ್ಯುತ್ ಸರಬರಾಜು ಮತ್ತು ಕೈಗಾರಿಕಾ ವೈರಿಂಗ್‌ಗಾಗಿ PVC ಇನ್ಸುಲೇಟೆಡ್ ಆರ್ಮರ್ಡ್ ಕೇಬಲ್‌ಗಳು.",
      reason: "1100V ವರೆಗಿನ ಕೈಗಾರಿಕಾ ವಿದ್ಯುತ್ ವಿತರಣೆಗೆ ಸುರಕ್ಷಿತ ಮತ್ತು ವಿಶ್ವಾಸಾರ್ಹ ವಿದ್ಯುತ್ ಕೇಬಲ್.",
      certification: "ವಿದ್ಯುತ್ ಕೇಬಲ್ QCO ಅಡಿಯಲ್ಲಿ ಕಡ್ಡಾಯ BIS ISI ಮಾರ್ಕ್"
    }
  },

  "IS 10322": {
    "kn-IN": {
      title: "ಲುಮಿನೇರ್‌ಗಳು — ರಸ್ತೆ ಮತ್ತು ಬೀದಿ ದೀಪಗಳ ಸುರಕ್ಷತಾ ನಿರ್ದಿಷ್ಟತೆ (LED Street Lighting)",
      category: "ಪ್ರಾಥಮಿಕ ಬೆಳಕಿನ ನಿರ್ದಿಷ್ಟತೆ",
      scope: "ಸಾರ್ವಜನಿಕ ಹೆದ್ದಾರಿಗಳು ಮತ್ತು ಪುರಸಭೆಯ ಬೀದಿ ದೀಪಗಳಿಗಾಗಿ LED ಲುಮಿನೇರ್‌ಗಳ ಸುರಕ್ಷತಾ ಮಾನದಂಡ.",
      reason: "4kV ಉಲ್ಬಣ ರಕ್ಷಣೆ ಮತ್ತು IP66 ನೊಂದಿಗೆ ಬೀದಿ ದೀಪಗಳ ಸುರಕ್ಷತೆಯನ್ನು ನಿಯಂತ್ರಿಸುತ್ತದೆ.",
      certification: "ಕಡ್ಡಾಯ CRS ನೋಂದಣಿ ಮತ್ತು ISI ಪ್ರಮಾಣೀಕರಣ"
    }
  },

  "IS 8329:2000": {
    "kn-IN": {
      title: "ಕೇಂದ್ರಾಪಗಾಮಿ ಎರಕಹೊಯ್ದ ಡಕ್ಟೈಲ್ ಐರನ್ (DI) ಒತ್ತಡದ ಕೊಳವೆಗಳು — ಕುಡಿಯುವ ನೀರಿನ ಪೈಪ್‌ಲೈನ್",
      category: "ಪ್ರಾಥಮಿಕ ಪೈಪಿಂಗ್ ನಿರ್ದಿಷ್ಟತೆ",
      scope: "ನಗರ ಕುಡಿಯುವ ನೀರು ಮತ್ತು ಒಳಚರಂಡಿ ಸಾಗಣೆಗೆ ಕ್ಲಾಸ್ K7/K9 ಸಾಕೆಟ್ ಮತ್ತು ಸ್ಪಿಗೋಟ್ DI ಪೈಪ್‌ಗಳು.",
      reason: "ಉನ್ನತ ಒತ್ತಡದ ನೀರಿನ ಸಾಗಣೆಗೆ ವಿಶ್ವಾಸಾರ್ಹ ಮತ್ತು ದೀರ್ಘಕಾಲ ಬಾಳಿಕೆ ಬರುವ ಡಕ್ಟೈಲ್ ಐರನ್ ಕೊಳವೆಗಳು.",
      certification: "ಕಡ್ಡಾಯ BIS ISI ಮಾರ್ಕ್"
    }
  }
};

/**
 * Dynamic Technical Parameters Translation Dictionary
 */
const PARAMETERS_I18N = {
  "Product Designation": { "kn-IN": "ಉತ್ಪನ್ನದ ಹೆಸರು", "hi-IN": "उत्पाद पदनाम", "ta-IN": "தயாரிப்பு பெயர்", "te-IN": "ఉత్పత్తి పేరు" },
  "Operating Voltage": { "kn-IN": "ಕಾರ್ಯಾಚರಣಾ ವೋಲ್ಟೇಜ್", "hi-IN": "ऑपरेटिंग वोल्टेज", "ta-IN": "இயக்க மின்னழுத்தம்", "te-IN": "ఆపరేటింగ్ వోల్టేజ్" },
  "System Frequency": { "kn-IN": "ಸಿಸ್ಟಮ್ ಆವರ್ತನ (Hz)", "hi-IN": "सिस्टम आवृत्ति (Hz)", "ta-IN": "அதிர்வெண்", "te-IN": "ఫ్రీక్వెన్సీ" },
  "Phase Configuration": { "kn-IN": "ಹಂತದ ಸಂರಚನೆ (Phase)", "hi-IN": "फेज विन्यास", "ta-IN": "கட்ட அமைப்பு", "te-IN": "ఫేజ్ కాన్ఫిగరేషన్" },
  "Power Rating": { "kn-IN": "ವಿದ್ಯುತ್ ಸಾಮರ್ಥ್ಯ (Power)", "hi-IN": "पावर रेटिंग", "ta-IN": "சக்தி மதிப்பீடு", "te-IN": "పవర్ రేటింగ్" },
  "Efficiency Class": { "kn-IN": "ದಕ್ಷತೆಯ ವರ್ಗ (Efficiency)", "hi-IN": "दक्षता वर्ग", "ta-IN": "திறன் வகுப்பு", "te-IN": "సామర్థ్య తరగతి" },
  "Ingress Protection": { "kn-IN": "ಪ್ರವೇಶ ರಕ್ಷಣೆ (IP ಕೋಡ್)", "hi-IN": "इनग्रेस प्रोटेक्शन (आईपी)", "ta-IN": "நுழைவு பாதுகாப்பு", "te-IN": "ఇన్‌గ్రెస్ ప్రొటెక్షన్" },
  "Application Domain": { "kn-IN": "ಅನ್ವಯ ಕ್ಷೇತ್ರ", "hi-IN": "अनुप्रयोग क्षेत्र", "ta-IN": "பயன்பாட்டு களம்", "te-IN": "అప్లికేషన్ డొమైన్" },
  "Duty Cycle": { "kn-IN": "ಕಾರ್ಯಾಚರಣೆಯ ಕರ್ತವ್ಯ (Duty)", "hi-IN": "ड्यूटी चक्र", "ta-IN": "கடமை சுழற்சி", "te-IN": "డ్యూటీ సైకిల్" },
  "Likely ICS Classification": { "kn-IN": "ICS ವರ್ಗೀಕರಣ ಕೋಡ್", "hi-IN": "ICS वर्गीकरण कोड", "ta-IN": "ICS வகைப்பாடு", "te-IN": "ICS వర్గీకరణ" },
  "Statutory Compliance": { "kn-IN": "ಶಾಸನಬದ್ಧ QCO ಅನುಸರಣೆ", "hi-IN": "वैधानिक QCO अनुपालन", "ta-IN": "சட்டப்பூர்வ இணக்கம்", "te-IN": "చట్టబద్ధమైన సమ్మతి" }
};

/**
 * Get Translation string with fallback
 */
function t(key, lang = currentAppLanguage) {
  const langDict = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS["en-IN"];
  if (langDict && langDict[key] !== undefined) {
    return langDict[key];
  }
  const enDict = UI_TRANSLATIONS["en-IN"];
  return enDict[key] !== undefined ? enDict[key] : key;
}

/**
 * Get active language
 */
function getCurrentLanguage() {
  return currentAppLanguage;
}

/**
 * Localize a Standard object dynamically
 */
function translateStandard(std, lang = currentAppLanguage) {
  if (!std) return std;
  const stdNum = std.standard_number;
  const canon = CANONICAL_STANDARDS_I18N[stdNum];
  
  if (canon && canon[lang]) {
    const loc = canon[lang];
    return {
      ...std,
      localized_title: loc.title || std.title,
      localized_category: loc.category || std.category,
      localized_scope: loc.scope || std.scope_summary,
      localized_reason: loc.reason || std.reason,
      localized_certification: loc.certification || std.certification,
      localized_why_checks: loc.why_checks || std.why_checklist
    };
  }

  // Fallback if no specific translation exists
  return {
    ...std,
    localized_title: std.title,
    localized_category: std.category,
    localized_scope: std.scope_summary || std.title,
    localized_reason: std.reason,
    localized_certification: std.certification,
    localized_why_checks: std.why_checklist
  };
}

/**
 * Localize parameter label
 */
function translateParamLabel(label, lang = currentAppLanguage) {
  if (PARAMETERS_I18N[label] && PARAMETERS_I18N[label][lang]) {
    return PARAMETERS_I18N[label][lang];
  }
  return label;
}

/**
 * Apply the selected language across all UI elements in the DOM
 */
function applyLanguage(lang) {
  if (!SUPPORTED_LANGUAGES[lang]) {
    lang = "en-IN";
  }
  currentAppLanguage = lang;
  localStorage.setItem("standards_app_language", lang);
  localStorage.setItem("sarvam_lang", lang);
  document.documentElement.lang = lang.split("-")[0];

  // 1. Sync all language dropdown selectors across the app
  document.querySelectorAll(".global-lang-selector, #chatLangSelector").forEach(sel => {
    if (sel.value !== lang) {
      sel.value = lang;
    }
  });

  // 2. Translate all DOM elements with [data-i18n]
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (key) {
      const trans = t(key, lang);
      if (trans) {
        // If element contains icons/sub-elements, preserve or set text
        if (el.children.length === 0) {
          el.textContent = trans;
        } else {
          // If first child is icon, keep icon
          const icon = el.querySelector(".nav-icon, .btn-icon, .fab-icon");
          if (icon) {
            el.innerHTML = `${icon.outerHTML} <span>${trans}</span>`;
          } else {
            el.textContent = trans;
          }
        }
      }
    }
  });

  // 3. Translate placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (key) {
      el.placeholder = t(key, lang);
    }
  });

  // 4. Update Chatbot language selector & Sarvam voice language
  if (typeof currentSarvamLang !== "undefined") {
    currentSarvamLang = lang;
  }

  // 5. Fire custom callback for live re-rendering of dynamic data
  if (typeof window.onLanguageChanged === "function") {
    window.onLanguageChanged(lang);
  }

  const langObj = SUPPORTED_LANGUAGES[lang];
  if (typeof toast === "function" && window.hasInitialLoaded) {
    toast(`🌐 Interface language changed to: ${langObj.native} (${langObj.name})`, "info");
  }
}

// Auto-initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("standards_app_language") || "en-IN";
  applyLanguage(saved);
  window.hasInitialLoaded = true;
});

// Export globally
window.SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGES;
window.UI_TRANSLATIONS = UI_TRANSLATIONS;
window.CANONICAL_STANDARDS_I18N = CANONICAL_STANDARDS_I18N;
window.PARAMETERS_I18N = PARAMETERS_I18N;
window.t = t;
window.getCurrentLanguage = getCurrentLanguage;
window.translateStandard = translateStandard;
window.translateParamLabel = translateParamLabel;
window.applyLanguage = applyLanguage;
