import { useParams } from "react-router-dom";
import CrudPage from "../components/crud/CrudPage";

export default function CrudDynamicPage() {
  const { modelKey } = useParams();
  return <CrudPage modelKey={modelKey} />;
}