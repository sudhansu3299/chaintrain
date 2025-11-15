import Layout from "../components/Layout";

export default function Upload() {
  return (
      <Layout>
        <h1>Upload Dataset</h1>
        <input type="file" />
        <button>Submit</button>
      </Layout>
  );
}
