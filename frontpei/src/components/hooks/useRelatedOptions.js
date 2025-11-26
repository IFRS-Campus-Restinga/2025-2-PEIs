import axios from "axios";

export async function loadRelatedOptions(schema, setOptionsCache) {
  for (const field of schema.fields) {
    if (field.type === "ForeignKey" || field.type === "OneToOneField") {
      try {
        const endpoint = `/services/${field.name}/`;  
        const res = await axios.get(`http://localhost:8000${endpoint}`);
        setOptionsCache(prev => ({
          ...prev,
          [field.name]: res.data.results || res.data
        }));
      } catch (e) {
        console.warn("⚠ Falha ao carregar opções de:", field.name);
      }
    }
  }
}
