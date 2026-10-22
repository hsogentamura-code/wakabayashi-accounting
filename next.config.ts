import type { NextConfig } from "next";

const securityHeaders = [
  // クリックジャッキング対策: 他サイトの iframe 埋め込みを禁止
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // MIMEスニッフィング対策: ブラウザによる Content-Type の誤認・不正実行を防止
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // リファラー制御: 別オリジンへの詳細パス漏洩を防止
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // 不要なブラウザ機能（カメラ・マイク・位置情報）のアクセスを遮断
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  // HTTPS接続を強制 (HSTS: 2年間有効、サブドメイン含む)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // DNS プリフェッチの有効化
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
