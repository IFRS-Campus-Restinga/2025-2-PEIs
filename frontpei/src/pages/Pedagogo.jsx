import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./disciplina.css";

function Pedagogos() {
  const DBPEDAGOGO = axios.create({baseURL: import.meta.env.VITE_PEDAGOGO_URL});
  const [pedagogo, setPedagogo] = useState("");
  const [pedagogosCadastradas, setPedagogosCadastradas] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editNome, setEditNome] = useState("");

  async function recuperaPedagogos() {
    try {
      const response = await DBPEDAGOGO.get("/");
      const data = response.data;
      setPedagogosCadastradas(Array.isArray(data) ? data : data.results);
    } catch (err) {
      console.error("Erro ao buscar disciplinas: ", err);
    }
  }

  async function adicionaPedagogo(event) {
    event.preventDefault();
    const nomePedagogo = pedagogo.trim();

    if (!nomePedagogo) {
      alert("Por favor, insira um nome válido para a pedagogo.");
      return;
    }

    try {
      await DBPEDAGOGO.post("/", { nome: nomePedagogo });
      await recuperaPedagogos();
      setPedagogo("");
    } catch (err) {
      console.error("Erro ao criar pedagogo:", err);
      alert("Falha ao cadastrar pedagogo!");
    }
  }

  // Função para deletar disciplina
  async function deletaPedagogo(id) {
    if (!window.confirm("Tem certeza que deseja deletar este pedagogo?")) return;

    try {
      await DBPEDAGOGO.delete(`/${id}/`);
      await recuperaPedagogos();
    } catch (err) {
      console.error("Erro ao deletar pedagogo:", err);
      alert("Falha ao deletar pedagogo!");
    }
  }

  async function atualizaPedagogo(id) {
    const nomeTrim = editNome.trim();
    if (!nomeTrim) return alert("Insira um nome válido!");

    try {
      await DBPEDAGOGO.put(`/${id}/`, { nome: nomeTrim });
      setEditId(null);
      setEditNome("");
      await recuperaPedagogos();
    } catch (err) {
      console.error("Erro ao atualizar pedagogo:", err);
      alert("Falha ao atualizar pedagogo!");
    }
  }


  useEffect(() => {
    recuperaPedagogos();
  }, []);

  return (
    <div className="disciplinas-container">
      <h1>Gerenciar Pedagogo</h1>

      <h2>Cadastrar pedagogo</h2>
      <form className="disciplinas-form" onSubmit={adicionaPedagogo}>
        <label>Nome: </label>
        <br />
        <textarea
          value={pedagogo}
          onChange={(e) => setPedagogo(e.target.value)}
        />
        <br />
        <button type="submit">Adicionar pedagogo</button>
      </form>

      <div className="disciplinas-list">
        <h3>Pedagogos Cadastrados</h3>
        <ul>
          {pedagogosCadastradas.map((d) => (
            <li key={d.id}>
              {editId === d.id ? (
                <>
                  <input
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                  />
                  <div className="btn-group">
                    <button onClick={() => atualizaPedagogo(d.id)}>Salvar</button>
                  </div>
                </>
              ) : (
                <>
                  <span>{d.nome}</span>
                  <div className="btn-group">
                    <button
                      onClick={() => {
                        setEditId(d.id);
                        setEditNome(d.nome);
                      }}
                    >
                      Editar
                    </button>
                    <button onClick={() => deletaPedagogo(d.id)}>Deletar</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>


      <Link to="/" className="voltar-btn">Voltar</Link>
    </div>
  );
}

export default Pedagogos;
