import React, { useState } from "react";
import api from "../configs/api";
import { API_ROUTES } from "../configs/apiRoutes";
import { useNavigate } from "react-router-dom";

export default function Registro() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [profile, setProfile] = useState("professor");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const response = await api.post(API_ROUTES.REGISTER, {
                name,
                email,
                profile,
                message: ""
            });

            if (response.status === 201) {
                setMessage("Cadastro enviado! Aguarde aprovação do administrador.");

                setTimeout(() => {
                    navigate("/aguardando-aprovacao");
                }, 2000);
            }
        } catch (error) {
            console.error("Erro no registro:", error);
            setMessage("Erro ao enviar cadastro. Verifique os dados e tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="page-container">
            <div className="card">
                <h2 className="titulo-pagina">Cadastro de Usuário</h2>

                <form onSubmit={handleSubmit} className="form">

                    <label className="label">Nome completo</label>
                    <input
                        type="text"
                        className="input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <label className="label">Email institucional</label>
                    <input
                        type="email"
                        className="input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label className="label">Perfil desejado</label>
                    <select
                        className="input"
                        value={profile}
                        onChange={(e) => setProfile(e.target.value)}
                    >
                        <option value="professor">Professor</option>
                        <option value="coordenador">Coordenador</option>
                        <option value="pedagogo">Pedagogo</option>
                        <option value="napne">NAPNE</option>
                    </select>

                    <button
                        type="submit"
                        className="btn-primario"
                        disabled={loading}
                    >
                        {loading ? "Enviando..." : "Cadastrar"}
                    </button>
                </form>

                {message && <p className="mensagem-feedback">{message}</p>}
            </div>
        </div>
    );
}
