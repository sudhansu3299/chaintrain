import Layout from "../components/Layout";
import Link from "next/link";

export default function Home() {
  return (
      <Layout>
        <h1>Welcome to the Dataset Registry</h1>

        <p>This is your Sui + Walrus + Nautilus Verifiable Dataset System.</p>

        <div style={{ marginTop: "20px" }}>
          <Link href="/upload">
            <button>Upload Dataset</button>
          </Link>
        </div>

        <div style={{ marginTop: "20px" }}>
          <Link href="/datasets">
            <button>View Datasets</button>
          </Link>
        </div>
      </Layout>
  );
}
