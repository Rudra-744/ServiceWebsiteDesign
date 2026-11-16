import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy policy", robots: { index: false } };

// TODO(client): replace with the real privacy policy before launch.
export default function Page() {
  return (
    <div className="page wrap sec" data-page="privacy">
      <h1 className="d2">Privacy policy</h1>
      <p className="lede" style={{ marginTop: 24 }}>
        TODO: the client will provide the privacy policy text.
      </p>
    </div>
  );
}
