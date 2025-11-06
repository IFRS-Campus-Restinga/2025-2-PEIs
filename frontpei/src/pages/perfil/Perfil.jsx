import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Perfil.css";
import defaultAvatar from "../../assets/user.svg";

const Perfil = () => {
  const navigate = useNavigate();
  const USUARIO_URL = import.meta.env.VITE_USUARIO_URL || "http://localhost:8000/services/usuario/";
  const TOKEN_HEADER = import.meta.env.VITE_BACKEND_TOKEN || "";
  const TOKEN_BEARER = localStorage.getItem("access") || localStorage.getItem("token") || "";

  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    let cancel = false;

    async function fetchUsuario() {
      try {
        setLoading(true);
        const headers = {};
        if (TOKEN_HEADER) headers["X-BACKEND-TOKEN"] = TOKEN_HEADER;
        if (!TOKEN_HEADER && TOKEN_BEARER) headers["Authorization"] = `Bearer ${TOKEN_BEARER}`;

        const resp = await axios.get(USUARIO_URL, { headers });
        if (cancel) return;
        const data = resp?.data || {};
        setRaw(data);

        const nome =
          data.nome || data.name || data.user?.name || data.user?.first_name || "";
        const email =
          data.email || data.user?.email || "";
        const foto = data.foto || data.avatar || data.user?.avatar || "";

        const ultimo =
          data.ultimo_acesso || data.last_login || data.last_access || null;

        if (nome || email) {
          setUsuario({
            nome: nome || "—",
            email: email || "—",
            foto: foto || "",
            primeiro_acesso: null,
            ultimo_acesso: ultimo,
          });
        } else {
          const local = localStorage.getItem("usuario");
          if (local) {
            const u = JSON.parse(local);
            setUsuario({
              nome: u.nome || u.name || "—",
              email: u.email || "—",
              foto: u.foto || "",
              primeiro_acesso: null,
              ultimo_acesso: null,
            });
          } else {
            setUsuario(null);
          }
        }
      } catch (e) {
        if (cancel) return;
        const local = localStorage.getItem("usuario");
        if (local) {
          const u = JSON.parse(local);
          setUsuario({
            nome: u.nome || u.name || "—",
            email: u.email || "—",
            foto: u.foto || "",
            primeiro_acesso: null,
            ultimo_acesso: null,
          });
        } else {
          setError("Não foi possível carregar os dados do usuário.");
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    }

    fetchUsuario();
    return () => { cancel = true; };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    localStorage.removeItem("access");
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="perfil-page">
      <div className="perfil-card">
        <div className="perfil-header">
          <h2>Meu Perfil</h2>
        </div>

        {loading && <div className="perfil-loading">Carregando...</div>}
         {!loading && error && <div className="perfil-error">{error}</div>}

        {!loading && error && (
          <div className="perfil-error">{error}</div>
        )}

        {!loading && !error && usuario && (
          <>
            {/* FOTO CENTRALIZADA */}
            <div className="perfil-avatar-center">
              <img
                src={usuario.foto && usuario.foto.length ? usuario.foto : defaultAvatar}
                alt={usuario.nome || "Usuário"}
              />

              <div className="perfil-basic-center">
                <h3 className="perfil-nome">{usuario.nome}</h3>
                <p className="perfil-email">{usuario.email}</p>
              </div>
            </div>
            {/* DADOS DE ACESSO */}

            <div className="perfil-meta-grid">
              <div className="info-card">
                <div className="info-label">Primeiro acesso</div>
                <div className="info-value">Não disponível</div>
              </div>
</div>
            {/* BOTÕES */}
            <div className="perfil-actions-center">
              <button className="btn btn-secondary" onClick={() => navigate(-1)}>Voltar</button>
              <button className="btn btn-danger" onClick={handleLogout}>Sair</button>
            </div>
          </>
        )}

        {!loading && !error && !usuario && (
          <div className="perfil-empty">
            Usuário não encontrado.
            <button className="btn" onClick={() => navigate("/")}>Voltar</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Perfil;
