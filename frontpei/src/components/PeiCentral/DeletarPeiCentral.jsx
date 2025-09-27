import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function DeletarPeiCentral() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");

  const DB = axios.create({ baseURL: import.meta.env.VITE_PEI_CENTRAL_URL });

  async function handleDelete() {
    try {
      await DB.delete(`/${id}/`);
      
      setSucesso("PEI CENTRAL DELETADO!!!");
      setTimeout(() => {navigate("/peicentral")}, 2000);

    } catch (error) {
      console.error(error);
      setErro("Erro ao tentar deletar. Verifique o console.");
    }
  }

  function handleCancel() {
    navigate(-1); 
  }

  return (
    <div>
      <h2>Excluir PEI Central</h2>
      <p>Tem certeza que deseja excluir o registro <b>{id}</b>?</p>
      {sucesso && <div className="text-sucesso">{sucesso}</div>}
      {erro && <div className="text-erro">{erro}</div>}
      <button 
        onClick={handleDelete} 
        style={{ backgroundColor: "red", color: "white", marginRight: "10px" }}
      >
        Sim, deletar
      </button>

      <button onClick={handleCancel}>Cancelar</button>
    </div>
  );
}

export default DeletarPeiCentral;
