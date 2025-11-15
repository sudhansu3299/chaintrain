import Layout from "../components/Layout";
import { getDatasets } from "../lib/api";
import DatasetCard, {DatasetCardProps} from "../components/DatasetCard";
import { useEffect, useState } from "react";

export default function Datasets() {
  const [datasets, setDatasets] = useState<DatasetCardProps[]>([]);

  useEffect(() => {
    getDatasets().then(setDatasets);
  }, []);

  return (
      <Layout>
        <h1>Registered Datasets</h1>

        {datasets.map((ds: any, i) => (
            <DatasetCard key={i} {...ds} />
        ))}
      </Layout>
  );
}
