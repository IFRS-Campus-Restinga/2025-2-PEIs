import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ROUTES } from "../../configs/apiRoutes";
import "./Menu.css";

const Menu = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [gruposUsuario, setGruposUsuario] = useState([]);
    const [nomeUsuario, setNomeUsuario] = useState("Usuário");
    const [aluno, setAluno] = useState(null);

    const params = new URLSearchParams(location.search);
    const idFromUrl = params.get("id");
    const peiCentralId = location.state?.peiCentralId || idFromUrl;

    useEffect(() => {
        if (!peiCentralId) return;

        async function carregarDados() {
            try {
                const token = localStorage.getItem("token");
                console.log("Token obtido do localStorage:", token);
                if (!token) throw new Error("Token de autenticação não encontrado.");
                const headers = { Authorization: `Token ${token}` };
                console.log("Headers enviados na requisição:", headers);

                const res = await axios.get(`${API_ROUTES.PEI_CENTRAL}${peiCentralId}/`, { headers });
                console.log("Resposta do backend:", res.data);

                const pei = res.data;
                console.log("PEI Central retornado:", pei);

                // --- ALUNO ---
                const alunoData = pei.aluno || { nome: "Aluno não encontrado", email: "" };
                setAluno(alunoData);
                console.log("Aluno retornado:", alunoData);

                // --- PERÍODOS ---
                const periodos = pei.periodos || [];
                console.log("Períodos retornados:", periodos);
                setPeriodoPrincipal(periodos[0]?.periodo_principal || "—");

                // --- CURSO ---
                const cursoData = pei.cursos || null;
                setCurso(cursoData);
                if (cursoData) {
                    setNomeCurso(cursoData.nome || "—");
                    const coord = cursoData.coordenador;
                    if (coord) {
                        const nomeCoord = coord.nome || coord.username || coord.email?.split("@")[0] || "—";
                        setCoordenador(nomeCoord);
                        setEmailCoordenador(coord.email || "");
                    }
                }

                const todosPareceres = (pei.periodos || [])
                    .flatMap(p => p.componentes_curriculares || [])
                    .flatMap(comp =>
                        (comp.pareceres || []).map(parecer => ({
                            ...parecer,
                            componenteNome: comp.disciplina?.nome || "Sem disciplina",
                            professorNome:
                                parecer.professor?.first_name ||
                                parecer.professor?.nome ||
                                parecer.professor?.email?.split("@")[0] ||
                                "Professor",
                        }))
                    )
                    .sort((a, b) => new Date(b.data) - new Date(a.data));

                setPareceres(todosPareceres);

                // E-MAILS DOS PROFESSORES DAS DISCIPLINAS
                const emailsSet = new Set();
                (pei.periodos || []).forEach(p => {
                    (p.componentes_curriculares || []).forEach(comp => {
                        (comp.disciplina?.professores || []).forEach(prof => {
                            if (prof?.email) emailsSet.add(prof.email);
                        });
                    });
                });
                setEmailsProfessores(Array.from(emailsSet));

                const mapa = {
                    "FECHADO": "fechado",
                    "SUSPENSO": "suspenso",
                    "EM ANDAMENTO": "em_andamento",
                    "ABERTO": "aberto"
                };
                setStatusPEI(mapa[pei.status_pei] || "aberto");

            } catch (err) {
                console.error("Erro ao carregar PEI:", err);
                setErro(true);
            }
        }
        carregarDados();
    }, [peiCentralId]);

    useEffect(() => {
        const usuarioSalvo = localStorage.getItem("usuario");
        if (usuarioSalvo) {
            try {
                const user = JSON.parse(usuarioSalvo);
                setNomeUsuario(user.nome || user.username || "Usuário");
                setGruposUsuario((user.grupos || []).map(g => g.toLowerCase()));
            } catch (err) {
                console.error("Erro ao ler usuário:", err);
            }
        }
    }, []);

    const renderBotoesOriginais = () => {
        return (
            <>
                {gruposUsuario.map((grupo) => {
                    switch (grupo) {
                        case "professor":
                            return (
                                <>
                                    <Link to="/pareceres" state={{ peiCentralId }} className="btn-acao-pei-menu">Cadastrar Parecer</Link>
                                    <Link to="/documentacaoComplementar" state={{ matricula: aluno?.matricula }} className="btn-acao-pei-menu">Gerenciar Documentações Complementares</Link>
                                    <Link to="/peicentral" className="btn-acao-pei-menu">Visualizar PEI Central</Link>
                                </>
                            );
                        case "pedagogo":
                            return (
                                <>
                                    <Link to="/ataDeAcompanhamento" className="btn-acao-pei-menu">Gerenciar Atas de Acompanhamento</Link>
                                    <Link to="/peicentral" className="btn-acao-pei-menu">Visualizar PEI Central</Link>
                                    <Link to="/documentacaoComplementar" state={{ matricula: aluno?.matricula }} className="btn-acao-pei-menu">Gerenciar Documentações Complementares</Link>
                                </>
                            );
                        case "napne":
                            return (
                                <>
                                    <Link to="/crud/PEIPeriodoLetivo" className="btn-acao-pei-menu">Gerenciar Períodos Letivos</Link>
                                    <Link to="/peicentral" className="btn-acao-pei-menu">Visualizar PEI Central</Link>
                                    <Link to="/crud/componenteCurricular" className="btn-acao-pei-menu">Gerenciar Componentes Curriculares</Link>
                                    <Link to="/ataDeAcompanhamento" className="btn-acao-pei-menu">Gerenciar Atas de Acompanhamento</Link>
                                    <Link to="/documentacaoComplementar" state={{ matricula: aluno?.matricula }} className="btn-acao-pei-menu">Gerenciar Documentações Complementares</Link>
                                    <Link to="/acompanhamentos" className="btn-acao-pei-menu">Acompanhamentos</Link>
                                </>
                            );
                        case "coordenador":
                            return (
                                <>
                                    <Link to="/crud/Curso" className="btn-acao-pei-menu">Gerenciar Cursos</Link>
                                    <Link to="/crud/Disciplina" className="btn-acao-pei-menu">Gerenciar Disciplinas</Link>
                                    <Link to="/peicentral" className="btn-acao-pei-menu">Visualizar PEI Central</Link>
                                    <Link to="/crud/aluno" className="btn-acao-pei-menu">Gerenciar Alunos</Link>
                                    <Link to="/ataDeAcompanhamento" className="btn-acao-pei-menu">Gerenciar Atas de Acompanhamento</Link>
                                    <Link to="/documentacaoComplementar" state={{ matricula: aluno?.matricula }} className="btn-acao-pei-menu">Gerenciar Documentações Complementares</Link>
                                </>
                            );
                        case "admin":
                            return (
                                <>
                                    <Link to="/usuario" className="btn-acao-pei-menu">Gerenciar Usuários</Link>
                                    <Link to="/crud/Curso" className="btn-acao-pei-menu">Gerenciar Cursos</Link>
                                    <Link to="/crud/Disciplina" className="btn-acao-pei-menu">Gerenciar Disciplinas</Link>
                                    <Link to="/crud/PEIPeriodoLetivo" className="btn-acao-pei-menu">Gerenciar Períodos Letivos</Link>
                                    <Link to="/crud/aluno" className="btn-acao-pei-menu">Gerenciar Alunos</Link>
                                    <Link to="/peicentral" className="btn-acao-pei-menu">Visualizar PEI Central</Link>
                                    <Link to="/pareceres" state={{ peiCentralId }} className="btn-acao-pei-menu">Cadastrar Parecer</Link>
                                    <Link to="/crud/componenteCurricular" className="btn-acao-pei-menu">Gerenciar Componentes Curriculares</Link>
                                    <Link to="/ataDeAcompanhamento" className="btn-acao-pei-menu">Gerenciar Atas de Acompanhamento</Link>
                                    <Link to="/documentacaoComplementar" state={{ matricula: aluno?.matricula }} className="btn-acao-pei-menu">Gerenciar Documentações Complementares</Link>
                                </>
                            );
                        default:
                            return null;
                    }
                })}
            </>
        );
    };

    return (
        <div className="pei-coluna-acoes">
            <div className="acoes-card">
                <h3>Navegação</h3>
                <div className="lista-botoes-vertical">
                    {renderBotoesOriginais()}
                </div>
            </div>
        </div>
    );
};
export default Menu;
