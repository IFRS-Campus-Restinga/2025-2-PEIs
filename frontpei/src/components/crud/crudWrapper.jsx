// src/components/crud/crudWrapper.jsx
import { useParams } from "react-router-dom";
import CrudUniversal from "./CrudUniversal";

// Mapeamento de aliases para modelos (opcional)
const MODEL_ALIASES = {
  componenteCurricular: "ComponenteCurricular",
  Pareceres: "Pareceres",
  Curso: "Curso",
  Disciplina: "Disciplina",
  Aluno: "Aluno",
  Periodo: "Periodo",
  AtaDeAcompanhamento: "AtaDeAcompanhamento",
  DocumentacaoComplementar: "DocumentacaoComplementar",
  Usuario: "Usuario"
};

const CrudWrapper = () => {
  const { modelKey } = useParams();

  // Normaliza modelKey para compatibilidade com a API
  const modelName = MODEL_ALIASES[modelKey] || modelKey;

  return <CrudUniversal modelName={modelName} />;
};

export default CrudWrapper;
