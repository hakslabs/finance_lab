import { redirect } from "next/navigation";

import { setTemporaryAuthCookie } from "@/app/_lib/auth/cookies";

type LoginPageProps = {
  searchParams?: Promise<{ next?: string }>;
};

function safeRedirectTarget(value: string | undefined): string {
  if (
    !value?.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/api")
  ) {
    return "/";
  }

  return value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  async function startTemporarySession() {
    "use server";

    await setTemporaryAuthCookie("user");
    redirect(safeRedirectTarget(params?.next));
  }

  return (
    <div className="sl-center" style={{ minHeight: "100vh", padding: "var(--sl-space-6)" }}>
      <main style={{ width: "100%", maxWidth: 400 }}>
        {/* Brand mark */}
        <header style={{ textAlign: "center", marginBottom: "var(--sl-space-8)" }}>
          <div
            className="sl-row"
            style={{
              justifyContent: "center",
              gap: "var(--sl-space-2)",
              marginBottom: "var(--sl-space-4)"
            }}
          >
            <span
              className="sl-mono"
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--sl-radius-md)",
                background: "linear-gradient(135deg, var(--sl-brand), var(--sl-cat3))",
                color: "#fff",
                fontSize: 17,
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              S
            </span>
            <span
              style={{
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: "36px"
              }}
            >
              STOCKLAB
            </span>
          </div>
          <p className="sl-body-sm" style={{ textAlign: "center" }}>
            인프라 검증용 임시 세션
          </p>
        </header>

        {/* Login card */}
        <section className="sl-card" style={{ padding: "var(--sl-space-7)" }}>
          <h1 className="sl-h2" style={{ marginBottom: "var(--sl-space-1)" }}>
            로그인
          </h1>
          <p
            className="sl-caption"
            style={{ marginBottom: "var(--sl-space-6)", fontSize: 13 }}
          >
            M0 단계: 임시 인증으로 보호된 라우트를 확인합니다.
          </p>

          {/* OAuth placeholders (disabled) */}
          <div className="sl-stack" style={{ gap: "var(--sl-space-2)", marginBottom: "var(--sl-space-5)" }}>
            <button
              type="button"
              className="sl-btn sl-btn-ghost sl-btn-block sl-btn-lg"
              disabled
              aria-disabled="true"
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background:
                    "conic-gradient(from 0deg, #ea4335, #fbbc04, #34a853, #4285f4, #ea4335)",
                  flexShrink: 0
                }}
              />
              Google로 계속하기
              <span
                className="sl-tag"
                style={{
                  marginLeft: "auto",
                  fontSize: 10,
                  padding: "1px 6px",
                  background: "var(--sl-surface-alt)"
                }}
              >
                준비 중
              </span>
            </button>

            <button
              type="button"
              className="sl-btn sl-btn-ghost sl-btn-block sl-btn-lg"
              disabled
              aria-disabled="true"
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  background: "#FEE500",
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#3C1E1E"
                }}
              >
                K
              </span>
              카카오로 계속하기
              <span
                className="sl-tag"
                style={{
                  marginLeft: "auto",
                  fontSize: 10,
                  padding: "1px 6px",
                  background: "var(--sl-surface-alt)"
                }}
              >
                준비 중
              </span>
            </button>

            <button
              type="button"
              className="sl-btn sl-btn-ghost sl-btn-block sl-btn-lg"
              disabled
              aria-disabled="true"
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  background: "#000",
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#fff"
                }}
              >
              A
              </span>
              Apple로 계속하기
              <span
                className="sl-tag"
                style={{
                  marginLeft: "auto",
                  fontSize: 10,
                  padding: "1px 6px",
                  background: "var(--sl-surface-alt)"
                }}
              >
                준비 중
              </span>
            </button>

            <button
              type="button"
              className="sl-btn sl-btn-ghost sl-btn-block sl-btn-lg"
              disabled
              aria-disabled="true"
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "var(--sl-radius-sm)",
                  background: "var(--sl-surface-alt)",
                  border: "1.5px solid var(--sl-line-strong)",
                  flexShrink: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--sl-muted)"
                }}
              >
              ✉
              </span>
              이메일로 계속하기
              <span
                className="sl-tag"
                style={{
                  marginLeft: "auto",
                  fontSize: 10,
                  padding: "1px 6px",
                  background: "var(--sl-surface-alt)"
                }}
              >
                준비 중
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="sl-divider" style={{ marginBottom: "var(--sl-space-5)" }}>
            또는
          </div>

          {/* Temporary session form */}
          <form action={startTemporarySession}>
            <button
              type="submit"
              className="sl-btn sl-btn-primary sl-btn-block sl-btn-lg"
            >
              Continue with temporary session
            </button>
          </form>
        </section>

        {/* M0 Disclaimer */}
        <aside
          className="sl-card-soft"
          style={{
            marginTop: "var(--sl-space-5)",
            padding: "var(--sl-space-4) var(--sl-space-5)",
            border: "1px dashed var(--sl-line-strong)"
          }}
        >
          <div className="sl-stack" style={{ gap: "var(--sl-space-2)" }}>
            <div className="sl-row" style={{ gap: "var(--sl-space-2)" }}>
              <span className="sl-tag sl-tag-warn">M0</span>
              <span className="sl-label" style={{ textTransform: "none", letterSpacing: 0 }}>
                인프라 검증 단계
              </span>
            </div>
            <ul
              className="sl-caption"
              style={{
                paddingLeft: "var(--sl-space-4)",
                listStyle: "disc",
                display: "flex",
                flexDirection: "column",
                gap: 2
              }}
            >
              <li>임시 세션만 지원합니다 (OAuth 연동 예정)</li>
              <li>보호된 라우트 미들웨어 동작을 확인 중</li>
              <li>실제 인증은 Supabase Auth로 대체됩니다</li>
            </ul>
          </div>
        </aside>

        {/* Footer */}
        <footer
          style={{
            marginTop: "var(--sl-space-8)",
            textAlign: "center"
          }}
        >
          <span className="sl-caption">
            STOCKLAB M0 &middot; Infrastructure Verification Surface
          </span>
        </footer>
      </main>
    </div>
  );
}
