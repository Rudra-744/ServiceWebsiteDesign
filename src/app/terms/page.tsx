import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms", robots: { index: false } };

// TODO(client): replace with the real terms before launch.
export default function Page() {
  return (
    <div className="page wrap sec" data-page="terms">
      <h1 className="d2">Terms</h1>
      <p className="lede" style={{ marginTop: 24 }}>
        TODO: the client will provide the terms text.
      </p>
    </div>
  );
}
