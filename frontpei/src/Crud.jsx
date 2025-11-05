import { useEffect, useState } from "react";
import axios from "axios";
import PEIPeriodoLetivo from "./components/PEIPeriodoLetivo";
import Pareceres from "./components/Parecer";
import { Link } from "react-router-dom";
import "../cssGlobal.css"

function Crud() {
  const DB = axios.create({ baseURL: import.meta.env.VITE_API_URL });

  const [pessoas, setPessoas] = useState([]);
  const [erroBanco, setErroBanco] = useState(false);
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState(1);

  
  async function recuperaPessoas() {
    try {
      const resposta = await DB.get("/");
      console.log("resposta da API:", resposta.data);
      if (Array.isArray(resposta.data)) {
        setPessoas(resposta.data);
      } else if (Array.isArray(resposta.data.results)) {
        setPessoas(resposta.data.results);
      } else {
        console.error("API não retornou lista:", resposta.data);
        setPessoas([]);
      }
      setErroBanco(false);
    } catch (erro) {
      console.error("Erro ao buscar pessoas:", erro);
      setErroBanco(true);
    }
  }

  
  async function adicionaPessoa(event) {
    event.preventDefault();
    const nomeTrim = nome.trim();
    const catNum = Number(categoria);

    if (nomeTrim.length < 7) {
      alert("O nome precisa ter ao menos 7 caracteres.");
      return;
    }
    if (![1, 2, 3].includes(catNum)) {
      alert("Categoria inválida. Escolha 1, 2 ou 3.");
      return;
    }

    const novo = { nome: nomeTrim, categoria: catNum };
    try {
      await DB.post("/", novo);
      await recuperaPessoas();
      setNome("");
      setCategoria(1);
      setErroBanco(false);
    } catch (erro) {
      console.error("Erro ao criar pessoa:", erro);
      setErroBanco(true);
      alert("Falha ao cadastrar a pessoa!");
    }
  }

  
  useEffect(() => {
    recuperaPessoas();
  }, []);

  return (
    <>

      <hr />
      <h2>Cadastrar pessoa</h2>
      <form onSubmit={adicionaPessoa}>
        <label>Nome:</label>
        <br />
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Digite o nome (min. 7 caracteres)"
        />
        <br /><br />
        <label>Categoria:</label>
        <br />
        <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
        </select>
        <br /><br />
        <button type="submit">Adicionar</button>
      </form>

      <hr />
      <h2>Dados cadastrados:</h2>
      {erroBanco ? (
        <p>Não foi possível acessar o backend do django...</p>
      ) : (
        pessoas.map((pessoa) => (
          <div key={pessoa.id}>
            <p>
              <b>Nome:</b> {pessoa.nome} | <b>Categoria:</b> {pessoa.categoria}
            </p>
          </div>
        ))
      )}

      <hr />
      <h2>Área de visualização bruta dos dados:</h2>
      <p>Status de erro: {JSON.stringify(erroBanco, null, 2)}</p>
      <p>Dados do model <b>Pessoa</b>:</p>
      <pre>{JSON.stringify(pessoas, null, 2)}</pre>
    </>
  );
}

export default Crud;
