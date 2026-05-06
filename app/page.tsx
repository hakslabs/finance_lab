import { redirect } from "next/navigation";

import { clearTemporaryAuthCookie, readTemporaryAuthCookie } from "@/app/_lib/auth/cookies";

export default async function HomePage() {
  const session = await readTemporaryAuthCookie();

  async function endTemporarySession() {
    "use server";

    clearTemporaryAuthCookie();
    redirect("/login");
  }

  return (
    <div style={{ minHeight: "100vh", padding: "var(--sl-space-6) var(--sl-space-5)" }}>
      <main style={{ maxWidth: 640, margin: "0 auto" }}>
        {/* Header bar */}
        <header
          className="sl-card"
          style={{
            padding: "var(--sl-space-5) var(--sl-space-6)",
            marginBottom: "var(--sl-space-5)",
            display: "flex",
            alignItems: "center",
            gap: "var(--sl-space-3)"
          }}
        >
          <span
            className="sl-mono"
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--sl-radius-sm)",
              background: "linear-gradient(135deg, var(--sl-brand), var(--sl-cat3))",
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            S
          </span>
          <div className="sl-grow">
            <span
              style={{
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: "-0.02em"
              }}
            >
              STOCKLAB
            </span>
          </div>
          <span className="sl-tag sl-tag-brand">M0</span>
          <form action={endTemporarySession}>
            <button type="submit" className="sl-btn sl-btn-secondary">
              임시 세션 종료
            </button>
          </form>
        </header>

        {/* Status card */}
        <section
          className="sl-card"
          style={{
            padding: "var(--sl-space-7)",
            marginBottom: "var(--sl-space-5)"
          }}
        >
          <div className="sl-stack" style={{ gap: "var(--sl-space-4)" }}>
            <div className="sl-row" style={{ gap: "var(--sl-space-3)" }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "var(--sl-up-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--sl-up)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <title>Active</title>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div className="sl-grow">
                <h1 className="sl-h2">Infrastructure foundation is active.</h1>
                <p className="sl-body-sm" style={{ marginTop: "var(--sl-space-1)" }}>
                  보호된 라우트가 정상 작동하고 있습니다.
                </p>
              </div>
            </div>

            <div className="sl-rule" />

            {/* Session info grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "var(--sl-space-4)"
              }}
            >
              <div className="sl-card-soft" style={{ padding: "var(--sl-space-4)" }}>
                <div className="sl-label">Session Role</div>
                <div
                  className="sl-mono"
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    marginTop: "var(--sl-space-1)",
                    color: "var(--sl-ink)"
                  }}
                >
                  {session?.role ?? "none"}
                </div>
              </div>
              <div className="sl-card-soft" style={{ padding: "var(--sl-space-4)" }}>
                <div className="sl-label">Auth Method</div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    marginTop: "var(--sl-space-1)",
                    color: "var(--sl-ink)"
                  }}
                >
                  temporary
                </div>
              </div>
              <div className="sl-card-soft" style={{ padding: "var(--sl-space-4)" }}>
                <div className="sl-label">Milestone</div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    marginTop: "var(--sl-space-1)",
                    color: "var(--sl-ink)"
                  }}
                >
                  M0
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* M0 Status / disclaimer panel */}
        <section
          className="sl-card"
          style={{
            padding: "var(--sl-space-6)",
            marginBottom: "var(--sl-space-5)",
            borderColor: "var(--sl-line-strong)",
            borderWidth: 1,
            borderStyle: "solid"
          }}
        >
          <div className="sl-stack" style={{ gap: "var(--sl-space-4)" }}>
            <div className="sl-row" style={{ gap: "var(--sl-space-2)" }}>
              <span className="sl-tag sl-tag-warn">Status</span>
              <span className="sl-label" style={{ textTransform: "none", letterSpacing: 0 }}>
                Infra Verification Surface
              </span>
            </div>

            <div className="sl-stack" style={{ gap: "var(--sl-space-3)" }}>
              {/* Check items */}
              {[
                {
                  label: "Protected route middleware",
                  desc: "인증 없이 / 에 접근 시 /login 으로 리다이렉트",
                  ok: true
                },
                {
                  label: "Temporary session cookie",
                  desc: "서버 액션으로 임시 토큰 발급 및 검증",
                  ok: true
                },
                {
                  label: "OAuth providers (Google, Apple, Kakao, Email)",
                  desc: "Supabase Auth 연동 시 활성화 예정",
                  ok: false
                },
                {
                  label: "Home dashboard widgets",
                  desc: "M1 이후 구현 예정",
                  ok: false
                },
                {
                  label: "Stock data & portfolio surfaces",
                  desc: "M2+ 범위",
                  ok: false
                }
              ].map((item) => (
                <div
                  key={item.label}
                  className="sl-row"
                  style={{
                    gap: "var(--sl-space-3)",
                    padding: "var(--sl-space-3) 0",
                    borderBottom:
                      item.label !== "Stock data & portfolio surfaces"
                        ? "1px solid var(--sl-hairline)"
                        : "none",
                    alignItems: "flex-start"
                  }}
                >
                  <span
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "var(--sl-radius-sm)",
                      border: item.ok ? "none" : "1.5px solid var(--sl-faint)",
                      background: item.ok ? "var(--sl-up)" : "transparent",
                      color: item.ok ? "#fff" : "transparent",
                      fontSize: 11,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 1
                    }}
                  >
                    {item.ok && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <title>Check</title>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    )}
                  </span>
                  <div className="sl-grow">
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</div>
                    <div className="sl-caption" style={{ marginTop: 2, fontSize: 12 }}>
                      {item.desc}
                    </div>
                  </div>
                  <span
                    className={`sl-tag ${item.ok ? "sl-tag-info" : ""}`}
                    style={{ flexShrink: 0, opacity: item.ok ? 1 : 0.7 }}
                  >
                    {item.ok ? "active" : "deferred"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ textAlign: "center", paddingTop: "var(--sl-space-4)" }}>
          <span className="sl-caption">
            STOCKLAB M0 &middot; Temporary auth loop + infrastructure foundation
          </span>
        </footer>
      </main>
    </div>
  );
}
