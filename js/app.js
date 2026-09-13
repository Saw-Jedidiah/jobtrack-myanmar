"use strict";

/* =========================================
   STORAGE
========================================= */

const STORAGE_KEY = "jobtrackMyanmarApplications";
const PROFILE_KEY = "jobtrackMyanmarProfile";
const THEME_KEY = "jobtrackMyanmarTheme";

/* =========================================
   CONSTANTS
========================================= */

const STATUSES = [
  "Applied",
  "Screening",
  "Interview",
  "Test",
  "Offer",
  "Rejected",
];

const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
  "Internship",
];

/* =========================================
   DEMO APPLICATIONS
========================================= */

const demoApplications = [
  {
    company: "World Vision Myanmar",
    position: "Program Assistant",
    location: "Yangon",
    salary: "1,500,000 MMK",
    jobType: "Full-time",
    status: "Interview",
    date: "2026-09-01",
    url: "",
    notes: "Follow up after interview.",
  },
  {
    company: "Hana Microfinance",
    position: "Communication Officer",
    location: "Yangon",
    salary: "Negotiable",
    jobType: "Full-time",
    status: "Screening",
    date: "2026-08-14",
    url: "",
    notes: "Communication team interview completed.",
  },
  {
    company: "ONOW Myanmar",
    position: "Program Coordinator",
    location: "Yangon",
    salary: "1,500,000 MMK",
    jobType: "Full-time",
    status: "Test",
    date: "2026-08-15",
    url: "",
    notes: "Pre-test submitted.",
  },
  {
    company: "WFP",
    position: "Programme Associate",
    location: "Yangon",
    salary: "Negotiable",
    jobType: "Full-time",
    status: "Applied",
    date: "2026-09-01",
    url: "",
    notes: "Programme Associate application.",
  },
  {
    company: "CHAI",
    position: "Assistant Program Officer",
    location: "Yangon",
    salary: "Negotiable",
    jobType: "Contract",
    status: "Rejected",
    date: "2026-08-20",
    url: "",
    notes: "Application closed.",
  },
];

/* =========================================
   DEFAULT PROFILE
========================================= */

const defaultProfile = {
  name: "Job Seeker",
  role: "Job Seeker",
  email: "",
  phone: "",
  location: "Myanmar",
  bio: "",
  photo: "",
};

/* =========================================
   HELPERS
========================================= */

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  [...parent.querySelectorAll(selector)];

const el = (...ids) =>
  ids
    .map((id) => document.getElementById(id))
    .find(Boolean) || null;

/* =========================================
   ID GENERATOR
========================================= */

function createId() {
  return (
    crypto?.randomUUID?.() ||
    `${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 9)}`
  );
}

/* =========================================
   ESCAPE HTML
========================================= */

function esc(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (match) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[match]
  );
}

/* =========================================
   SAFE URL
========================================= */

function safeUrl(value) {
  if (!value) return "";

  try {
    const url = new URL(value, location.origin);

    return ["http:", "https:"].includes(url.protocol)
      ? url.href
      : "";
  } catch {
    return "";
  }
}

/* =========================================
   STATUS
========================================= */

function normalizeStatus(value) {
  return STATUSES.includes(value)
    ? value
    : "Applied";
}

function statusClass(value) {
  return normalizeStatus(value).toLowerCase();
}

/* =========================================
   DATE
========================================= */

function formatDate(value) {
  if (!value) return "-";

  const dateValue = new Date(`${value}T00:00:00`);

  if (Number.isNaN(dateValue.getTime())) {
    return esc(value);
  }

  return dateValue.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* =========================================
   NORMALIZE APPLICATION
========================================= */

function normalizeApp(application) {
  if (!application || typeof application !== "object") {
    return null;
  }

  return {
    id: String(application.id || createId()),

    company: String(application.company || "").trim(),

    position: String(application.position || "").trim(),

    location: String(application.location || "").trim(),

    salary: String(application.salary || "").trim(),

    jobType: JOB_TYPES.includes(application.jobType)
      ? application.jobType
      : "Full-time",

    status: normalizeStatus(application.status),

    date: String(application.date || ""),

    url: safeUrl(application.url),

    notes: String(application.notes || "").trim(),
  };
}

/* =========================================
   NORMALIZE PROFILE
========================================= */

function normalizeProfile(value) {
  const profile =
    value && typeof value === "object"
      ? value
      : {};

  return {
    ...defaultProfile,

    name:
      String(profile.name || "").trim() ||
      "Job Seeker",

    role:
      String(profile.role || "").trim() ||
      "Job Seeker",

    email: String(profile.email || "").trim(),

    phone: String(profile.phone || "").trim(),

    location:
      String(profile.location || "").trim() ||
      "Myanmar",

    bio: String(profile.bio || "").trim(),

    photo:
      typeof profile.photo === "string"
        ? profile.photo
        : "",
  };
}

/* =========================================
   APPLICATION STORAGE
========================================= */

function saveApps(applicationList) {
  const normalized = (applicationList || [])
    .map(normalizeApp)
    .filter(Boolean);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(normalized)
  );

  window.dispatchEvent(
    new Event("jobtrack:apps")
  );
}

function apps() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    const demo = demoApplications.map((application) =>
      normalizeApp({
        ...application,
        id: createId(),
      })
    );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(demo)
    );

    return demo;
  }

  try {
    const parsed = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed.map(normalizeApp).filter(Boolean)
      : [];
  } catch {
    const demo = demoApplications.map((application) =>
      normalizeApp({
        ...application,
        id: createId(),
      })
    );

    saveApps(demo);

    return demo;
  }
}

/* =========================================
   PROFILE STORAGE
========================================= */

function profile() {
  try {
    return normalizeProfile(
      JSON.parse(
        localStorage.getItem(PROFILE_KEY) || "null"
      )
    );
  } catch {
    return normalizeProfile(null);
  }
}

function saveProfile(value) {
  localStorage.setItem(
    PROFILE_KEY,
    JSON.stringify(normalizeProfile(value))
  );

  window.dispatchEvent(
    new Event("jobtrack:profile")
  );
}

/* =========================================
   TOAST
========================================= */

function toast(message, type = "success") {
  const toastElement = el("toast");

  if (!toastElement) return;

  toastElement.textContent = message;

  toastElement.className =
    `toast ${type} show`;

  clearTimeout(toast.timer);

  toast.timer = setTimeout(() => {
    toastElement.classList.remove("show");
  }, 2800);
}

/* =========================================
   INITIALS
========================================= */

function initials(name) {
  return (
    String(name || "Job Seeker")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "J"
  );
}

/* =========================================
   AVATAR
========================================= */

function avatar(node) {
  if (!node) return;

  const currentProfile = profile();

  if (currentProfile.photo) {
    node.innerHTML = `
      <img
        src="${esc(currentProfile.photo)}"
        alt="${esc(currentProfile.name)}"
      >
    `;
  } else {
    node.textContent = initials(
      currentProfile.name
    );
  }
}

/* =========================================
   SYNC PROFILE UI
========================================= */

function syncProfile() {
  const currentProfile = profile();

  [
    el("headerName"),
    el("dashboardUserName"),
    el("profileDisplayName"),
  ]
    .filter(Boolean)
    .forEach((element) => {
      element.textContent = currentProfile.name;
    });

  [
    el("headerRole"),
    el("profileDisplayRole"),
  ]
    .filter(Boolean)
    .forEach((element) => {
      element.textContent = currentProfile.role;
    });

  [
    el("headerAvatar"),
    el("topbarAvatar"),
  ]
    .filter(Boolean)
    .forEach(avatar);

  const preview = el("profilePreview");

  if (preview) {
    if (currentProfile.photo) {
      preview.src = currentProfile.photo;
    } else {
      preview.removeAttribute("src");
    }
  }
}

/* =========================================
   THEME
========================================= */

function getTheme() {
  let theme = localStorage.getItem(THEME_KEY);

  if (!theme) {
    theme = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches
      ? "dark"
      : "light";
  }

  return theme === "dark"
    ? "dark"
    : "light";
}

function updateThemeButtons(theme) {
  $$(".theme-toggle").forEach((button) => {
    button.textContent =
      theme === "dark"
        ? "☀"
        : "☾";

    button.setAttribute(
      "aria-label",
      `Switch to ${
        theme === "dark"
          ? "light"
          : "dark"
      } mode`
    );

    button.setAttribute(
      "title",
      theme === "dark"
        ? "Switch to light mode"
        : "Switch to dark mode"
    );
  });
}

function applyTheme(theme) {
  document.body.classList.toggle(
    "dark",
    theme === "dark"
  );

  localStorage.setItem(
    THEME_KEY,
    theme
  );

  updateThemeButtons(theme);

  if (typeof Chart !== "undefined") {
    setTimeout(() => {
      renderCharts();
    }, 50);
  }
}

function setupTheme() {
  const theme = getTheme();

  applyTheme(theme);

  $$(".theme-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const currentTheme =
        document.body.classList.contains("dark")
          ? "dark"
          : "light";

      applyTheme(
        currentTheme === "dark"
          ? "light"
          : "dark"
      );
    });
  });
}

/* =========================================
   MOBILE SIDEBAR
========================================= */

function mobile() {
  const sidebar = el("sidebar");

  const button = el(
    "mobileMenu",
    "mobileMenuBtn"
  );

  const overlay = el(
    "mobileOverlay",
    "sidebarOverlay"
  );

  if (!sidebar || !button) {
    return;
  }

  const close = () => {
    sidebar.classList.remove("open");
    overlay?.classList.remove("show");
  };

  const toggle = () => {
    const isOpen =
      sidebar.classList.toggle("open");

    overlay?.classList.toggle(
      "show",
      isOpen
    );
  };

  button.addEventListener(
    "click",
    toggle
  );

  overlay?.addEventListener(
    "click",
    close
  );

  $$(".sidebar a").forEach((link) => {
    link.addEventListener(
      "click",
      close
    );
  });

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape") {
        close();
      }
    }
  );
}

/* =========================================
   ACTIVE NAVIGATION
========================================= */

function activeNav() {
  const links = $$(".sidebar a");

  const currentPage =
    location.pathname
      .split("/")
      .pop() ||
    "index.html";

  links.forEach((link) => {
    const href =
      link.getAttribute("href") || "";

    const targetPage =
      href
        .split(/[?#]/)[0]
        .split("/")
        .pop() ||
      "index.html";

    link.classList.toggle(
      "active",
      targetPage.toLowerCase() ===
        currentPage.toLowerCase()
    );
  });
}

/* =========================================
   CHARTS
========================================= */

let trendChart = null;
let statusChart = null;

function dashboard() {
  if (!el("totalApplications")) {
    return;
  }

  const applicationList = apps();

  const total =
    applicationList.length;

  const count = (currentStatus) =>
    applicationList.filter(
      (application) =>
        application.status === currentStatus
    ).length;

  if (el("totalApplications")) {
    el("totalApplications").textContent =
      total;
  }

  if (el("interviewCount")) {
    el("interviewCount").textContent =
      count("Interview");
  }

  if (el("testCount")) {
    el("testCount").textContent =
      count("Test");
  }

  if (el("offerCount")) {
    el("offerCount").textContent =
      count("Offer");
  }

  const performanceItems = [
    [
      "interviewRate",
      "interviewProgress",
      "Interview",
    ],
    [
      "testRate",
      "testProgress",
      "Test",
    ],
    [
      "offerRate",
      "offerProgress",
      "Offer",
    ],
  ];

  performanceItems.forEach(
    ([textId, progressId, currentStatus]) => {
      const percentage = total
        ? Math.round(
            (count(currentStatus) / total) *
              100
          )
        : 0;

      const textElement = el(textId);
      const progressElement =
        el(progressId);

      if (textElement) {
        textElement.textContent =
          `${percentage}%`;
      }

      if (progressElement) {
        progressElement.style.width =
          `${percentage}%`;

        progressElement.setAttribute(
          "aria-valuenow",
          percentage
        );
      }
    }
  );

  const recentContainer =
    el("recentApplications");

  if (recentContainer) {
    const recentApplications = [
      ...applicationList,
    ]
      .sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      )
      .slice(0, 5);

    if (recentApplications.length) {
      recentContainer.innerHTML =
        recentApplications
          .map(
            (application) => `
              <div class="recent-row">
                <span class="company-avatar">
                  ${esc(
                    initials(
                      application.company
                    )
                  )}
                </span>

                <div class="recent-info">
                  <strong>
                    ${esc(
                      application.position
                    )}
                  </strong>

                  <span>
                    ${esc(
                      application.company
                    )}
                  </span>
                </div>

                <span
                  class="status-badge ${statusClass(
                    application.status
                  )}"
                >
                  ${esc(
                    application.status
                  )}
                </span>

                <span class="recent-date">
                  ${formatDate(
                    application.date
                  )}
                </span>
              </div>
            `
          )
          .join("");
    } else {
      recentContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">▤</div>

          <h3>
            No applications yet
          </h3>

          <p>
            Add your first job application.
          </p>

          <a
            href="add-job.html"
            class="btn btn-primary"
          >
            Add Application
          </a>
        </div>
      `;
    }
  }

  renderCharts();
}

/* =========================================
   RENDER CHARTS
========================================= */

function renderCharts() {
  if (typeof Chart === "undefined") {
    return;
  }

  const applicationList = apps();

  /* -----------------------------------------
     APPLICATION TREND
  ----------------------------------------- */

  const trendCanvas =
    el("applicationTrendChart");

  if (trendCanvas) {
    trendChart?.destroy();

    const now = new Date();

    const labels = [];
    const data = [];

    for (let index = 5; index >= 0; index--) {
      const monthDate = new Date(
        now.getFullYear(),
        now.getMonth() - index,
        1
      );

      labels.push(
        monthDate.toLocaleString(
          "en-US",
          {
            month: "short",
          }
        )
      );

      data.push(
        applicationList.filter(
          (application) => {
            const applicationDate =
              new Date(
                application.date
              );

            return (
              applicationDate.getFullYear() ===
                monthDate.getFullYear() &&
              applicationDate.getMonth() ===
                monthDate.getMonth()
            );
          }
        ).length
      );
    }

    trendChart = new Chart(
      trendCanvas,
      {
        type: "line",

        data: {
          labels,

          datasets: [
            {
              label: "Applications",
              data,
              tension: 0.35,
              fill: true,
              borderWidth: 2,
            },
          ],
        },

        options: {
          responsive: true,
          maintainAspectRatio: false,

          plugins: {
            legend: {
              display: false,
            },
          },

          scales: {
            y: {
              beginAtZero: true,

              ticks: {
                precision: 0,
              },
            },
          },
        },
      }
    );
  }

  /* -----------------------------------------
     STATUS CHART
  ----------------------------------------- */

  const statusCanvas =
    el("statusChart");

  if (statusCanvas) {
    statusChart?.destroy();

    const counts = STATUSES.map(
      (currentStatus) =>
        applicationList.filter(
          (application) =>
            application.status ===
            currentStatus
        ).length
    );

    statusChart = new Chart(
      statusCanvas,
      {
        type: "doughnut",

        data: {
          labels: STATUSES,

          datasets: [
            {
              data: counts,
              borderWidth: 0,
            },
          ],
        },

        options: {
          responsive: true,
          maintainAspectRatio: false,

          cutout: "68%",

          plugins: {
            legend: {
              position: "bottom",
            },
          },
        },
      }
    );

    const summary =
      el("statusSummary");

    if (summary) {
      summary.innerHTML =
        STATUSES.map(
          (currentStatus, index) => `
            <div class="status-summary-item">
              <span>
                ${esc(currentStatus)}
              </span>

              <strong>
                ${counts[index]}
              </strong>
            </div>
          `
        ).join("");
    }
  }
}

/* =========================================
   APPLICATION TABLE
========================================= */

function renderTable() {
  const tableBody = el(
    "applicationsTableBody",
    "applicationsTable"
  );

  if (!tableBody) {
    return;
  }

  let applicationList = apps();

  const searchInput =
    el("applicationSearch");

  const searchFromUrl =
    new URLSearchParams(
      location.search
    ).get("search") || "";

  const searchQuery =
    (
      searchInput?.value ||
      searchFromUrl
    )
      .toLowerCase()
      .trim();

  const statusFilter =
    el("statusFilter")?.value || "";

  /* Search */

  if (searchQuery) {
    applicationList =
      applicationList.filter(
        (application) =>
          [
            application.company,
            application.position,
            application.location,
            application.jobType,
            application.status,
            application.salary,
            application.notes,
          ]
            .join(" ")
            .toLowerCase()
            .includes(searchQuery)
      );
  }

  /* Status filter */

  if (statusFilter) {
    applicationList =
      applicationList.filter(
        (application) =>
          application.status ===
          statusFilter
      );
  }

  /* Sort newest first */

  applicationList.sort(
    (a, b) =>
      new Date(b.date) -
      new Date(a.date)
  );

  const emptyState =
    el("applicationsEmpty");

  if (emptyState) {
    emptyState.classList.toggle(
      "hidden",
      applicationList.length > 0
    );
  }

  if (!applicationList.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <div class="empty-icon">
              ⌕
            </div>

            <h3>
              No applications found
            </h3>

            <p>
              Try changing your search or filter.
            </p>
          </div>
        </td>
      </tr>
    `;

    return;
  }

  tableBody.innerHTML =
    applicationList
      .map(
        (application) => `
          <tr>
            <td>
              <div class="table-company">

                <span class="company-avatar">
                  ${esc(
                    initials(
                      application.company
                    )
                  )}
                </span>

                <div>
                  <strong>
                    ${esc(
                      application.company
                    )}
                  </strong>

                  <small>
                    ${esc(
                      application.location
                    )}
                  </small>
                </div>

              </div>
            </td>

            <td>
              ${esc(
                application.position
              )}
            </td>

            <td>
              ${esc(
                application.jobType
              )}
            </td>

            <td>
              ${esc(
                application.salary || "-"
              )}
            </td>

            <td>
              <span
                class="status-badge ${statusClass(
                  application.status
                )}"
              >
                ${esc(
                  application.status
                )}
              </span>
            </td>

            <td>
              ${formatDate(
                application.date
              )}
            </td>

            <td>
              <div class="table-actions">

                ${
                  application.url
                    ? `
                      <a
                        class="icon-button"
                        href="${esc(
                          application.url
                        )}"
                        target="_blank"
                        rel="noopener"
                        aria-label="Open job link"
                        title="Open job link"
                      >
                        ↗
                      </a>
                    `
                    : ""
                }

                <a
                  class="icon-button"
                  href="add-job.html?id=${encodeURIComponent(
                    application.id
                  )}"
                  aria-label="Edit application"
                  title="Edit application"
                >
                  ✎
                </a>

                <button
                  type="button"
                  class="icon-button danger"
                  data-delete="${esc(
                    application.id
                  )}"
                  aria-label="Delete application"
                  title="Delete application"
                >
                  ×
                </button>

              </div>
            </td>
          </tr>
        `
      )
      .join("");
}

/* =========================================
   APPLICATIONS PAGE
========================================= */

function applicationsPage() {
  const tableBody = el(
    "applicationsTableBody",
    "applicationsTable"
  );

  if (!tableBody) {
    return;
  }

  const searchQuery =
    new URLSearchParams(
      location.search
    ).get("search");

  const searchInput =
    el("applicationSearch");

  if (searchInput && searchQuery) {
    searchInput.value = searchQuery;
  }

  renderTable();

  searchInput?.addEventListener(
    "input",
    renderTable
  );

  el("statusFilter")?.addEventListener(
    "change",
    renderTable
  );

  el("clearFilters")?.addEventListener(
    "click",
    () => {
      if (searchInput) {
        searchInput.value = "";
      }

      const statusFilter =
        el("statusFilter");

      if (statusFilter) {
        statusFilter.value = "";
      }

      history.replaceState(
        {},
        "",
        location.pathname
      );

      renderTable();
    }
  );

  tableBody.addEventListener(
    "click",
    (event) => {
      const deleteButton =
        event.target.closest(
          "[data-delete]"
        );

      if (!deleteButton) {
        return;
      }

      const application =
        apps().find(
          (item) =>
            item.id ===
            deleteButton.dataset.delete
        );

      if (!application) {
        return;
      }

      const confirmed = confirm(
        `Delete "${application.position}" at ${application.company}?`
      );

      if (!confirmed) {
        return;
      }

      saveApps(
        apps().filter(
          (item) =>
            item.id !== application.id
        )
      );

      renderTable();
      dashboard();

      toast(
        "Application deleted."
      );
    }
  );
}

/* =========================================
   JOB FORM
========================================= */

function jobForm() {
  const form = el("jobForm");

  if (!form) {
    return;
  }

  const idParam =
    new URLSearchParams(
      location.search
    ).get("id");

  const existingApplication =
    idParam
      ? apps().find(
          (application) =>
            application.id === idParam
        )
      : null;

  const formTitle =
    el("formTitle");

  if (existingApplication) {
    if (formTitle) {
      formTitle.textContent =
        "Edit Application";
    }

    Object.entries(
      existingApplication
    ).forEach(([key, value]) => {
      const fieldName =
        key === "date"
          ? "applicationDate"
          : key;

      const field =
        form.elements[fieldName];

      if (field) {
        field.value = value || "";
      }
    });

    const submitButton =
      form.querySelector(
        'button[type="submit"]'
      );

    if (submitButton) {
      submitButton.textContent =
        "Update Application";
    }
  } else {
    const dateField =
      form.elements.applicationDate;

    if (dateField) {
      dateField.value =
        new Date()
          .toISOString()
          .slice(0, 10);
    }
  }

  form.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();

      if (!form.reportValidity()) {
        return;
      }

      const formData =
        new FormData(form);

      const application =
        normalizeApp({
          id: idParam || createId(),

          company:
            formData.get("company"),

          position:
            formData.get("position"),

          location:
            formData.get("location"),

          salary:
            formData.get("salary"),

          jobType:
            formData.get("jobType"),

          status:
            formData.get("status"),

          date:
            formData.get(
              "applicationDate"
            ),

          url:
            formData.get("jobUrl"),

          notes:
            formData.get("notes"),
        });

      if (
        !application.company ||
        !application.position
      ) {
        toast(
          "Company and position are required.",
          "error"
        );

        return;
      }

      const applicationList = apps();

      const existingIndex =
        applicationList.findIndex(
          (item) =>
            item.id === application.id
        );

      if (existingIndex >= 0) {
        applicationList[
          existingIndex
        ] = application;
      } else {
        applicationList.push(
          application
        );
      }

      saveApps(applicationList);

      toast(
        existingIndex >= 0
          ? "Application updated."
          : "Application added."
      );

      setTimeout(() => {
        location.href =
          "applications.html";
      }, 400);
    }
  );
}

/* =========================================
   PROFILE PAGE
========================================= */

function profilePage() {
  const form = el("profileForm");

  if (!form) {
    return;
  }

  const currentProfile =
    profile();

  [
    "name",
    "role",
    "email",
    "phone",
    "location",
    "bio",
  ].forEach((fieldName) => {
    const field =
      form.elements[fieldName];

    if (field) {
      field.value =
        currentProfile[fieldName] || "";
    }
  });

  const preview =
    el("profilePreview");

  const photoInput =
    el("profilePhoto");

  if (preview) {
    if (currentProfile.photo) {
      preview.src =
        currentProfile.photo;
    }
  }

  let photo =
    currentProfile.photo;

  photoInput?.addEventListener(
    "change",
    (event) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      if (
        !file.type.startsWith(
          "image/"
        )
      ) {
        toast(
          "Please select an image file.",
          "error"
        );

        return;
      }

      if (
        file.size >
        2 * 1024 * 1024
      ) {
        toast(
          "Image must be smaller than 2MB.",
          "error"
        );

        return;
      }

      const reader =
        new FileReader();

      reader.onload = () => {
        photo = reader.result;

        if (preview) {
          preview.src = photo;
        }
      };

      reader.readAsDataURL(file);
    }
  );

  form.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();

      if (!form.reportValidity()) {
        return;
      }

      const formData =
        new FormData(form);

      saveProfile({
        name: formData.get("name"),
        role: formData.get("role"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        location:
          formData.get("location"),
        bio: formData.get("bio"),
        photo,
      });

      syncProfile();

      toast(
        "Profile saved successfully."
      );
    }
  );
}

/* =========================================
   KANBAN
========================================= */

function kanban() {
  const wrapper =
    $(".kanban-wrapper");

  if (!wrapper) {
    return;
  }

  const render = () => {
    const applicationList =
      apps();

    $$(".kanban-list").forEach(
      (list) => {
        const currentStatus =
          list.dataset.status;

        const items =
          applicationList.filter(
            (application) =>
              application.status ===
              currentStatus
          );

        const column =
          list.closest(
            ".kanban-column"
          );

        const count =
          column?.querySelector(
            ".kanban-count"
          );

        if (count) {
          count.textContent =
            items.length;
        }

        if (items.length) {
          list.innerHTML =
            items
              .map(
                (application) => `
                  <article
                    class="kanban-card"
                    draggable="true"
                    data-id="${esc(
                      application.id
                    )}"
                  >

                    <div class="kanban-card-top">

                      <span class="company-avatar small">
                        ${esc(
                          initials(
                            application.company
                          )
                        )}
                      </span>

                      <a
                        class="kanban-menu"
                        href="add-job.html?id=${encodeURIComponent(
                          application.id
                        )}"
                        aria-label="Edit application"
                        title="Edit application"
                      >
                        ⋯
                      </a>

                    </div>

                    <h4>
                      ${esc(
                        application.position
                      )}
                    </h4>

                    <p class="kanban-company">
                      ${esc(
                        application.company
                      )}
                    </p>

                    <div class="kanban-meta">

                      <span>
                        📍
                        ${esc(
                          application.location ||
                            "-"
                        )}
                      </span>

                      <span>
                        💰
                        ${esc(
                          application.salary ||
                            "-"
                        )}
                      </span>

                    </div>

                    <div class="kanban-footer">

                      <span>
                        ${formatDate(
                          application.date
                        )}
                      </span>

                      <a
                        class="kanban-edit"
                        href="add-job.html?id=${encodeURIComponent(
                          application.id
                        )}"
                      >
                        Edit
                      </a>

                    </div>

                  </article>
                `
              )
              .join("");
        } else {
          list.innerHTML = `
            <div class="kanban-empty">
              No applications
            </div>
          `;
        }
      }
    );

    setupKanbanDragEvents();
  };

  const setupKanbanDragEvents =
    () => {
      $$(".kanban-card").forEach(
        (card) => {
          card.addEventListener(
            "dragstart",
            (event) => {
              event.dataTransfer.effectAllowed =
                "move";

              event.dataTransfer.setData(
                "text/plain",
                card.dataset.id
              );

              card.classList.add(
                "dragging"
              );
            }
          );

          card.addEventListener(
            "dragend",
            () => {
              card.classList.remove(
                "dragging"
              );
            }
          );
        }
      );
    };

  $$(".kanban-list").forEach(
    (list) => {
      list.addEventListener(
        "dragover",
        (event) => {
          event.preventDefault();

          list.classList.add(
            "drag-over"
          );
        }
      );

      list.addEventListener(
        "dragleave",
        () => {
          list.classList.remove(
            "drag-over"
          );
        }
      );

      list.addEventListener(
        "drop",
        (event) => {
          event.preventDefault();

          list.classList.remove(
            "drag-over"
          );

          const applicationId =
            event.dataTransfer.getData(
              "text/plain"
            );

          const applicationList =
            apps();

          const application =
            applicationList.find(
              (item) =>
                item.id ===
                applicationId
            );

          const newStatus =
            list.dataset.status;

          if (
            !application ||
            !STATUSES.includes(
              newStatus
            )
          ) {
            return;
          }

          application.status =
            newStatus;

          saveApps(
            applicationList
          );

          render();
          dashboard();

          toast(
            `Moved to ${newStatus}.`
          );
        }
      );
    }
  );

  render();
}

/* =========================================
   SETTINGS
========================================= */

function settings() {
  const resetButton = el(
    "resetData",
    "resetDemoData"
  );

  resetButton?.addEventListener(
    "click",
    () => {
      const confirmed = confirm(
        "Reset all applications to demo data?"
      );

      if (!confirmed) {
        return;
      }

      const demo =
        demoApplications.map(
          (application) =>
            normalizeApp({
              ...application,
              id: createId(),
            })
        );

      saveApps(demo);

      toast(
        "Demo data restored."
      );

      setTimeout(() => {
        location.reload();
      }, 400);
    }
  );

  const clearButton = el(
    "clearAllApplications",
    "clearApplications"
  );

  clearButton?.addEventListener(
    "click",
    () => {
      const confirmed = confirm(
        "Delete all applications? This cannot be undone."
      );

      if (!confirmed) {
        return;
      }

      saveApps([]);

      toast(
        "All applications deleted."
      );

      setTimeout(() => {
        location.reload();
      }, 400);
    }
  );
}

/* =========================================
   GLOBAL SEARCH
========================================= */

function globalSearch() {
  const input =
    el("globalSearch");

  if (!input) {
    return;
  }

  const query =
    new URLSearchParams(
      location.search
    ).get("search");

  if (query) {
    input.value = query;
  }

  input.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Enter" &&
        input.value.trim()
      ) {
        location.href =
          `applications.html?search=${encodeURIComponent(
            input.value.trim()
          )}`;
      }
    }
  );
}

/* =========================================
   BACK BUTTON
========================================= */

function back() {
  $$(
    "[data-action='back'], .back-button"
  ).forEach((button) => {
    button.addEventListener(
      "click",
      (event) => {
        if (
          button.tagName === "A"
        ) {
          return;
        }

        event.preventDefault();

        if (
          history.length > 1
        ) {
          history.back();
        } else {
          location.href =
            "applications.html";
        }
      }
    );
  });
}

/* =========================================
   STORAGE SYNC
========================================= */

window.addEventListener(
  "storage",
  (event) => {
    if (
      event.key === STORAGE_KEY ||
      event.key === PROFILE_KEY
    ) {
      syncProfile();
      dashboard();
      renderTable();
      kanban();
    }

    if (
      event.key === THEME_KEY
    ) {
      const theme =
        event.newValue === "dark"
          ? "dark"
          : "light";

      document.body.classList.toggle(
        "dark",
        theme === "dark"
      );

      updateThemeButtons(theme);

      if (
        typeof Chart !==
        "undefined"
      ) {
        renderCharts();
      }
    }
  }
);

/* =========================================
   INTERNAL APPLICATION EVENTS
========================================= */

window.addEventListener(
  "jobtrack:apps",
  () => {
    dashboard();
    renderTable();
    kanban();
  }
);

window.addEventListener(
  "jobtrack:profile",
  () => {
    syncProfile();
  }
);

/* =========================================
   INITIALIZATION
========================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {
    /* Create default profile */

    if (
      !localStorage.getItem(
        PROFILE_KEY
      )
    ) {
      saveProfile(
        defaultProfile
      );
    }

    /* Global setup */

    setupTheme();
    mobile();
    activeNav();
    back();
    globalSearch();

    /* Page sync */

    syncProfile();

    /* Page modules */

    dashboard();
    applicationsPage();
    jobForm();
    profilePage();
    kanban();
    settings();
  }
);