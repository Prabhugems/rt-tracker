"use client";
import { useState } from "react";

// ═══════════════════════════════════════════════════════
// FMAS FEEDBACK FORM TEMPLATE
// ═══════════════════════════════════════════════════════

const RATING_OPTIONS = ["Excellent", "Very Good", "Good", "Poor"];

const COURSE_CONTENT_ITEMS = [
  "Relevance of topics covered",
  "Comprehensiveness of content",
  "Quality of presentation slides",
  "Quality of video demonstrations",
  "Balance between theory and practical aspects",
];

const FACULTY_ITEMS = [
  "Subject knowledge",
  "Presentation skills",
  "Interaction with participants",
  "Ability to clarify doubts",
];

const FACILITIES_ITEMS = [
  "Registration process",
  "Venue facilities",
  "Audio-visual arrangements",
  "Refreshments/meals",
  "Time management",
];

const INITIAL_STATE = {
  courseContent: {},
  faculty: {},
  facilities: {},
  sessionsToImprove: "",
  keySkills: "",
  implementPlan: "",
  additionalTopics: "",
  improveCourse: "",
  recommendToColleagues: "",
  interestedInAdvanced: "",
  areasOfInterest: "",
  otherComments: "",
};

export default function FMASFeedbackForm() {
  const [form, setForm] = useState({ ...INITIAL_STATE });
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useState(() => {
    setTimeout(() => setMounted(true), 100);
  });

  const setRating = (section, item, value) => {
    setForm((p) => ({
      ...p,
      [section]: { ...p[section], [item]: value },
    }));
    setErrors((p) => {
      const next = { ...p };
      delete next[`${section}.${item}`];
      return next;
    });
  };

  const setField = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((p) => {
      const next = { ...p };
      delete next[key];
      return next;
    });
  };

  const validatePage = (pageNum) => {
    const e = {};
    if (pageNum === 0) {
      COURSE_CONTENT_ITEMS.forEach((item) => {
        if (!form.courseContent[item]) e[`courseContent.${item}`] = true;
      });
    } else if (pageNum === 1) {
      FACULTY_ITEMS.forEach((item) => {
        if (!form.faculty[item]) e[`faculty.${item}`] = true;
      });
    } else if (pageNum === 2) {
      FACILITIES_ITEMS.forEach((item) => {
        if (!form.facilities[item]) e[`facilities.${item}`] = true;
      });
    } else if (pageNum === 3) {
      if (!form.sessionsToImprove.trim()) e.sessionsToImprove = true;
      if (!form.keySkills.trim()) e.keySkills = true;
      if (!form.implementPlan.trim()) e.implementPlan = true;
      if (!form.additionalTopics.trim()) e.additionalTopics = true;
      if (!form.improveCourse.trim()) e.improveCourse = true;
      if (!form.recommendToColleagues) e.recommendToColleagues = true;
      if (!form.interestedInAdvanced) e.interestedInAdvanced = true;
      if (!form.areasOfInterest.trim()) e.areasOfInterest = true;
      if (!form.otherComments.trim()) e.otherComments = true;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validatePage(page)) {
      setPage((p) => p + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setPage((p) => p - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = () => {
    if (!validatePage(3)) return;
    console.log("FMAS Feedback submitted:", form);
    setSubmitted(true);
  };

  const handleReset = () => {
    setForm({ ...INITIAL_STATE });
    setErrors({});
    setPage(0);
    setSubmitted(false);
  };

  const globalCSS = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .btn-press { transition: all 0.12s; }
    .btn-press:active { transform: scale(0.96); }
    textarea:focus, input:focus { outline: none; border-color: #0f766e !important; box-shadow: 0 0 0 3px rgba(15,118,110,0.1) !important; }
    .radio-opt { transition: all 0.15s; cursor: pointer; }
    .radio-opt:hover { background: #f0fdfa; border-color: #99f6e4; }
  `;

  const pageLabels = [
    "Course Content",
    "Faculty",
    "Facilities & Organization",
    "Feedback & Suggestions",
  ];

  // ═══════════════════════════════════════════════════════
  // MATRIX RATING COMPONENT
  // ═══════════════════════════════════════════════════════
  const RatingMatrix = ({ section, items, question }) => (
    <div>
      <p style={{ fontSize: 14, fontWeight: 600, color: "#1e293b", marginBottom: 20 }}>
        {question} <span style={{ color: "#ef4444" }}>*</span>
      </p>

      {/* Desktop table view */}
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 13,
            minWidth: 540,
          }}
        >
          <thead>
            <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
              <th
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontWeight: 700,
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  color: "#64748b",
                  fontFamily: "'Outfit', sans-serif",
                  width: "40%",
                }}
              />
              {RATING_OPTIONS.map((opt) => (
                <th
                  key={opt}
                  style={{
                    padding: "12px 8px",
                    textAlign: "center",
                    fontWeight: 700,
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    color: "#64748b",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  {opt}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const hasError = errors[`${section}.${item}`];
              return (
                <tr
                  key={item}
                  style={{
                    borderBottom: "1px solid #f1f5f9",
                    background: hasError
                      ? "#fef2f2"
                      : idx % 2 === 0
                        ? "#fff"
                        : "#f8fafb",
                    transition: "background 0.15s",
                  }}
                >
                  <td
                    style={{
                      padding: "14px 16px",
                      fontWeight: 500,
                      color: hasError ? "#ef4444" : "#334155",
                      fontSize: 13,
                    }}
                  >
                    {item}
                    {hasError && (
                      <span
                        style={{
                          display: "block",
                          fontSize: 10,
                          color: "#ef4444",
                          marginTop: 2,
                        }}
                      >
                        Please select a rating
                      </span>
                    )}
                  </td>
                  {RATING_OPTIONS.map((opt) => (
                    <td key={opt} style={{ padding: "14px 8px", textAlign: "center" }}>
                      <label
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="radio"
                          name={`${section}-${item}`}
                          checked={form[section][item] === opt}
                          onChange={() => setRating(section, item, opt)}
                          style={{ display: "none" }}
                        />
                        <span
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            border: `2px solid ${
                              form[section][item] === opt ? "#0f766e" : "#cbd5e1"
                            }`,
                            background:
                              form[section][item] === opt ? "#0f766e" : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.15s",
                            boxShadow:
                              form[section][item] === opt
                                ? "0 0 0 3px rgba(15,118,110,0.15)"
                                : "none",
                          }}
                        >
                          {form[section][item] === opt && (
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: "#fff",
                              }}
                            />
                          )}
                        </span>
                      </label>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════
  // SUBMITTED VIEW
  // ═══════════════════════════════════════════════════════
  if (submitted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f0fdfa 0%, #f8fafb 50%, #ecfdf5 100%)",
          fontFamily: "'DM Sans', sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <style>{globalCSS}</style>
        <div
          style={{
            background: "#fff",
            borderRadius: 24,
            padding: "48px 40px",
            maxWidth: 480,
            width: "100%",
            textAlign: "center",
            boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
            border: "1px solid #e2e8f0",
            animation: "fadeUp 0.5s ease-out",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #0f766e, #14b8a6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: "0 8px 24px rgba(15,118,110,0.25)",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 800,
              fontFamily: "'Outfit', sans-serif",
              color: "#0f172a",
              marginBottom: 8,
            }}
          >
            Thank You!
          </h2>
          <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6, marginBottom: 28 }}>
            Your feedback has been submitted successfully. Your input helps us improve
            future FMAS courses.
          </p>
          <button
            className="btn-press"
            onClick={handleReset}
            style={{
              border: "none",
              padding: "12px 28px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #0f766e, #14b8a6)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Outfit', sans-serif",
              boxShadow: "0 4px 12px rgba(15,118,110,0.25)",
            }}
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // MAIN FORM RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0fdfa 0%, #f8fafb 50%, #ecfdf5 100%)",
        fontFamily: "'DM Sans', sans-serif",
        color: "#1e293b",
        padding: "32px 16px",
      }}
    >
      <style>{globalCSS}</style>

      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #0f766e, #0d9488)",
            borderRadius: "20px 20px 0 0",
            padding: "36px 32px 28px",
            color: "#fff",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
              top: -60,
              right: -40,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
              bottom: -30,
              left: 40,
            }}
          />
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              fontFamily: "'Outfit', sans-serif",
              letterSpacing: "-0.5px",
              position: "relative",
              zIndex: 1,
            }}
          >
            FMAS Course Feedback Form
          </h1>
          <p
            style={{
              fontSize: 14,
              opacity: 0.85,
              marginTop: 6,
              position: "relative",
              zIndex: 1,
              fontWeight: 400,
            }}
          >
            Help us improve by sharing your experience
          </p>
        </div>

        {/* Progress Bar */}
        <div
          style={{
            background: "#fff",
            padding: "20px 32px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
              }}
            >
              Step {page + 1} of 4
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#0f766e",
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              {pageLabels[page]}
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: 6,
              background: "#e2e8f0",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${((page + 1) / 4) * 100}%`,
                height: "100%",
                background: "linear-gradient(90deg, #0f766e, #14b8a6)",
                borderRadius: 10,
                transition: "width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            />
          </div>
          {/* Step indicators */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 12,
            }}
          >
            {pageLabels.map((label, i) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background:
                      i < page
                        ? "#0f766e"
                        : i === page
                          ? "linear-gradient(135deg, #0f766e, #14b8a6)"
                          : "#e2e8f0",
                    color: i <= page ? "#fff" : "#94a3b8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    transition: "all 0.3s",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  {i < page ? "✓" : i + 1}
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: i === page ? 700 : 500,
                    color: i === page ? "#0f766e" : "#94a3b8",
                    display: i === page || window.innerWidth > 600 ? "inline" : "none",
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <div
          style={{
            background: "#fff",
            padding: "32px 32px 28px",
            borderBottom: "1px solid #e2e8f0",
            animation: "fadeUp 0.35s ease-out",
          }}
          key={page}
        >
          {/* PAGE 0: Course Content */}
          {page === 0 && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: "#f0fdfa",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    color: "#0f766e",
                  }}
                >
                  📋
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      fontFamily: "'Outfit', sans-serif",
                      color: "#0f172a",
                    }}
                  >
                    Course Content
                  </h2>
                  <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    Rate various aspects of the course material
                  </p>
                </div>
              </div>
              <RatingMatrix
                section="courseContent"
                items={COURSE_CONTENT_ITEMS}
                question="Please rate the following aspects of the course content:"
              />
            </div>
          )}

          {/* PAGE 1: Faculty */}
          {page === 1 && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: "#eef2ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    color: "#4f46e5",
                  }}
                >
                  👨‍🏫
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      fontFamily: "'Outfit', sans-serif",
                      color: "#0f172a",
                    }}
                  >
                    Faculty
                  </h2>
                  <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    Rate the teaching faculty performance
                  </p>
                </div>
              </div>
              <RatingMatrix
                section="faculty"
                items={FACULTY_ITEMS}
                question="Please rate the faculty on the following parameters:"
              />
            </div>
          )}

          {/* PAGE 2: Facilities and Organization */}
          {page === 2 && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: "#fef3c7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    color: "#d97706",
                  }}
                >
                  🏢
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      fontFamily: "'Outfit', sans-serif",
                      color: "#0f172a",
                    }}
                  >
                    Facilities and Organization
                  </h2>
                  <p style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    Rate the event facilities and logistics
                  </p>
                </div>
              </div>
              <RatingMatrix
                section="facilities"
                items={FACILITIES_ITEMS}
                question="Please rate the following aspects:"
              />
            </div>
          )}

          {/* PAGE 3: Feedback, Learning, Suggestions, Future */}
          {page === 3 && (
            <div>
              {/* Sessions to improve */}
              <div style={{ marginBottom: 28 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: 8,
                  }}
                >
                  Any sessions that could be improved:{" "}
                  <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.sessionsToImprove}
                  onChange={(e) => setField("sessionsToImprove", e.target.value)}
                  placeholder="Your answer"
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: `1.5px solid ${errors.sessionsToImprove ? "#ef4444" : "#e2e8f0"}`,
                    borderRadius: 10,
                    fontSize: 13,
                    background: "#f8fafc",
                    boxSizing: "border-box",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                />
                {errors.sessionsToImprove && (
                  <p
                    style={{
                      color: "#ef4444",
                      fontSize: 10,
                      marginTop: 4,
                      fontWeight: 500,
                    }}
                  >
                    This field is required
                  </p>
                )}
              </div>

              {/* Learning Outcomes Section */}
              <div
                style={{
                  marginBottom: 28,
                  padding: 24,
                  background: "#f8fafb",
                  borderRadius: 14,
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 18,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "#ecfdf5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      color: "#059669",
                    }}
                  >
                    🎯
                  </div>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      fontFamily: "'Outfit', sans-serif",
                      color: "#0f172a",
                    }}
                  >
                    Learning Outcomes
                  </h3>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: 8,
                    }}
                  >
                    What are the key skills/knowledge you gained from this course?{" "}
                    <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <textarea
                    value={form.keySkills}
                    onChange={(e) => setField("keySkills", e.target.value)}
                    placeholder="Your answer"
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: `1.5px solid ${errors.keySkills ? "#ef4444" : "#e2e8f0"}`,
                      borderRadius: 10,
                      fontSize: 13,
                      background: "#fff",
                      boxSizing: "border-box",
                      fontFamily: "'DM Sans', sans-serif",
                      resize: "vertical",
                    }}
                  />
                  {errors.keySkills && (
                    <p
                      style={{
                        color: "#ef4444",
                        fontSize: 10,
                        marginTop: 4,
                        fontWeight: 500,
                      }}
                    >
                      This field is required
                    </p>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: 8,
                    }}
                  >
                    How do you plan to implement these in your practice?{" "}
                    <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <textarea
                    value={form.implementPlan}
                    onChange={(e) => setField("implementPlan", e.target.value)}
                    placeholder="Your answer"
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: `1.5px solid ${errors.implementPlan ? "#ef4444" : "#e2e8f0"}`,
                      borderRadius: 10,
                      fontSize: 13,
                      background: "#fff",
                      boxSizing: "border-box",
                      fontFamily: "'DM Sans', sans-serif",
                      resize: "vertical",
                    }}
                  />
                  {errors.implementPlan && (
                    <p
                      style={{
                        color: "#ef4444",
                        fontSize: 10,
                        marginTop: 4,
                        fontWeight: 500,
                      }}
                    >
                      This field is required
                    </p>
                  )}
                </div>
              </div>

              {/* Suggestions for Improvement */}
              <div
                style={{
                  marginBottom: 28,
                  padding: 24,
                  background: "#f8fafb",
                  borderRadius: 14,
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 18,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "#eef2ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      color: "#4f46e5",
                    }}
                  >
                    💡
                  </div>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      fontFamily: "'Outfit', sans-serif",
                      color: "#0f172a",
                    }}
                  >
                    Suggestions for Improvement
                  </h3>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: 8,
                    }}
                  >
                    What additional topics would you like to see covered in future courses?{" "}
                    <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <textarea
                    value={form.additionalTopics}
                    onChange={(e) => setField("additionalTopics", e.target.value)}
                    placeholder="Your answer"
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: `1.5px solid ${errors.additionalTopics ? "#ef4444" : "#e2e8f0"}`,
                      borderRadius: 10,
                      fontSize: 13,
                      background: "#fff",
                      boxSizing: "border-box",
                      fontFamily: "'DM Sans', sans-serif",
                      resize: "vertical",
                    }}
                  />
                  {errors.additionalTopics && (
                    <p
                      style={{
                        color: "#ef4444",
                        fontSize: 10,
                        marginTop: 4,
                        fontWeight: 500,
                      }}
                    >
                      This field is required
                    </p>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: 8,
                    }}
                  >
                    How can we improve the course experience?{" "}
                    <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <textarea
                    value={form.improveCourse}
                    onChange={(e) => setField("improveCourse", e.target.value)}
                    placeholder="Your answer"
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: `1.5px solid ${errors.improveCourse ? "#ef4444" : "#e2e8f0"}`,
                      borderRadius: 10,
                      fontSize: 13,
                      background: "#fff",
                      boxSizing: "border-box",
                      fontFamily: "'DM Sans', sans-serif",
                      resize: "vertical",
                    }}
                  />
                  {errors.improveCourse && (
                    <p
                      style={{
                        color: "#ef4444",
                        fontSize: 10,
                        marginTop: 4,
                        fontWeight: 500,
                      }}
                    >
                      This field is required
                    </p>
                  )}
                </div>
              </div>

              {/* Future Courses */}
              <div
                style={{
                  padding: 24,
                  background: "#f8fafb",
                  borderRadius: 14,
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 18,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "#fef3c7",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      color: "#d97706",
                    }}
                  >
                    🔮
                  </div>
                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      fontFamily: "'Outfit', sans-serif",
                      color: "#0f172a",
                    }}
                  >
                    Future Courses
                  </h3>
                </div>

                {/* Radio: Recommend */}
                <div style={{ marginBottom: 18 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: 10,
                    }}
                  >
                    Would you recommend this course to colleagues?{" "}
                    <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <div style={{ display: "flex", gap: 10 }}>
                    {["Yes", "No"].map((opt) => (
                      <label
                        key={opt}
                        className="radio-opt"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "10px 20px",
                          borderRadius: 10,
                          border: `1.5px solid ${
                            form.recommendToColleagues === opt
                              ? "#0f766e"
                              : errors.recommendToColleagues
                                ? "#ef4444"
                                : "#e2e8f0"
                          }`,
                          background:
                            form.recommendToColleagues === opt ? "#f0fdfa" : "#fff",
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        <input
                          type="radio"
                          name="recommendToColleagues"
                          checked={form.recommendToColleagues === opt}
                          onChange={() => setField("recommendToColleagues", opt)}
                          style={{ display: "none" }}
                        />
                        <span
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            border: `2px solid ${
                              form.recommendToColleagues === opt ? "#0f766e" : "#cbd5e1"
                            }`,
                            background:
                              form.recommendToColleagues === opt
                                ? "#0f766e"
                                : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.15s",
                          }}
                        >
                          {form.recommendToColleagues === opt && (
                            <span
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                background: "#fff",
                              }}
                            />
                          )}
                        </span>
                        {opt}
                      </label>
                    ))}
                  </div>
                  {errors.recommendToColleagues && (
                    <p
                      style={{
                        color: "#ef4444",
                        fontSize: 10,
                        marginTop: 4,
                        fontWeight: 500,
                      }}
                    >
                      Please select an option
                    </p>
                  )}
                </div>

                {/* Radio: Interested in advanced */}
                <div style={{ marginBottom: 18 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: 10,
                    }}
                  >
                    Are you interested in attending advanced MAS courses in the future?{" "}
                    <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <div style={{ display: "flex", gap: 10 }}>
                    {["Yes", "No"].map((opt) => (
                      <label
                        key={opt}
                        className="radio-opt"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "10px 20px",
                          borderRadius: 10,
                          border: `1.5px solid ${
                            form.interestedInAdvanced === opt
                              ? "#0f766e"
                              : errors.interestedInAdvanced
                                ? "#ef4444"
                                : "#e2e8f0"
                          }`,
                          background:
                            form.interestedInAdvanced === opt ? "#f0fdfa" : "#fff",
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        <input
                          type="radio"
                          name="interestedInAdvanced"
                          checked={form.interestedInAdvanced === opt}
                          onChange={() => setField("interestedInAdvanced", opt)}
                          style={{ display: "none" }}
                        />
                        <span
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            border: `2px solid ${
                              form.interestedInAdvanced === opt ? "#0f766e" : "#cbd5e1"
                            }`,
                            background:
                              form.interestedInAdvanced === opt
                                ? "#0f766e"
                                : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.15s",
                          }}
                        >
                          {form.interestedInAdvanced === opt && (
                            <span
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: "50%",
                                background: "#fff",
                              }}
                            />
                          )}
                        </span>
                        {opt}
                      </label>
                    ))}
                  </div>
                  {errors.interestedInAdvanced && (
                    <p
                      style={{
                        color: "#ef4444",
                        fontSize: 10,
                        marginTop: 4,
                        fontWeight: 500,
                      }}
                    >
                      Please select an option
                    </p>
                  )}
                </div>

                {/* Areas of interest */}
                <div style={{ marginBottom: 18 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: 8,
                    }}
                  >
                    Specific areas of interest for future courses:{" "}
                    <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <textarea
                    value={form.areasOfInterest}
                    onChange={(e) => setField("areasOfInterest", e.target.value)}
                    placeholder="Your answer"
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: `1.5px solid ${errors.areasOfInterest ? "#ef4444" : "#e2e8f0"}`,
                      borderRadius: 10,
                      fontSize: 13,
                      background: "#fff",
                      boxSizing: "border-box",
                      fontFamily: "'DM Sans', sans-serif",
                      resize: "vertical",
                    }}
                  />
                  {errors.areasOfInterest && (
                    <p
                      style={{
                        color: "#ef4444",
                        fontSize: 10,
                        marginTop: 4,
                        fontWeight: 500,
                      }}
                    >
                      This field is required
                    </p>
                  )}
                </div>

                {/* Other comments */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#334155",
                      marginBottom: 8,
                    }}
                  >
                    Any Other Comments{" "}
                    <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <textarea
                    value={form.otherComments}
                    onChange={(e) => setField("otherComments", e.target.value)}
                    placeholder="Your answer"
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "12px 16px",
                      border: `1.5px solid ${errors.otherComments ? "#ef4444" : "#e2e8f0"}`,
                      borderRadius: 10,
                      fontSize: 13,
                      background: "#fff",
                      boxSizing: "border-box",
                      fontFamily: "'DM Sans', sans-serif",
                      resize: "vertical",
                    }}
                  />
                  {errors.otherComments && (
                    <p
                      style={{
                        color: "#ef4444",
                        fontSize: 10,
                        marginTop: 4,
                        fontWeight: 500,
                      }}
                    >
                      This field is required
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div
          style={{
            background: "#fff",
            padding: "20px 32px",
            borderRadius: "0 0 20px 20px",
            border: "1px solid #e2e8f0",
            borderTop: "none",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 4px 16px rgba(0,0,0,0.03)",
          }}
        >
          {page > 0 ? (
            <button
              className="btn-press"
              onClick={handleBack}
              style={{
                border: "1px solid #e2e8f0",
                padding: "11px 24px",
                borderRadius: 10,
                background: "#fff",
                color: "#64748b",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {page < 3 ? (
            <button
              className="btn-press"
              onClick={handleNext}
              style={{
                border: "none",
                padding: "11px 28px",
                borderRadius: 10,
                background: "linear-gradient(135deg, #0f766e, #14b8a6)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Outfit', sans-serif",
                boxShadow: "0 4px 12px rgba(15,118,110,0.25)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              Next →
            </button>
          ) : (
            <button
              className="btn-press"
              onClick={handleSubmit}
              style={{
                border: "none",
                padding: "11px 28px",
                borderRadius: 10,
                background: "linear-gradient(135deg, #0f766e, #14b8a6)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Outfit', sans-serif",
                boxShadow: "0 4px 12px rgba(15,118,110,0.25)",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Submit Feedback ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
