import { useNavigate } from "react-router-dom";
import { botoesPorPerfil } from "../../configs/permissoes";
import "../../cssGlobal.css";


const SubHeader = ({ perfilSelecionado }) => {
  const navigate = useNavigate();

  // Se nenhum perfil foi selecionado, não renderiza o SubHeader
  if (!perfilSelecionado) return null;

  // Pega os botões permitidos para o perfil selecionado
  const botoes = botoesPorPerfil[perfilSelecionado] || [];

  return (
    <nav className="subheader">
      <div className="subheader-buttons">
        {botoes.map((botao) => (
          <button
            key={botao.path}
            onClick={() => navigate(botao.path)}
            className="subheader-btn"
          >
            {botao.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default SubHeader;
