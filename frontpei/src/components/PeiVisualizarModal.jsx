import logo from "../assets/logo.png";
import logo_nome from "../assets/logo-sem-nome.png";
import { useEffect } from "react";

const PeiVisualizarModal = ({ selectPei, onClose, gerarPDF }) => {
  if (!selectPei) return null;
  
  useEffect(() => {
  const handleEsc = (event) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  window.addEventListener("keydown", handleEsc);

  return () => {
    window.removeEventListener("keydown", handleEsc);
  };
}, [onClose]);
  console.log("Modal recebeu onClose =", onClose);

  return (
    
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          width: "80%",
          height: "80%",
          padding: "20px",
          borderRadius: "8px",
          overflowY: "auto",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "red",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "6px 10px",
            cursor: "pointer",
            zIndex: 9999,
          }}
        >
          X
        </button>
        <br />
        <header className="header">
          <div className="header-left">
            <img src={logo_nome} alt="Logo IFRS" className="header-logo" />
          </div>
          <div style={{ marginRight: "auto" }} className="header-text">
            <strong>INSTITUTO FEDERAL</strong>
            <span>Rio Grande do Sul</span>
            <span>Campus Restinga</span>
          </div>
          <div className="header-center">
            <h1>Visualização do PEI</h1>
            <span>Plano Educacional Individualizado</span>
          </div>
        </header>

        {/* BOTÃO PDF */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            width: "100%",
            marginTop: "10px",
            marginBottom: "20px",
          }}
        >
          <div
            onClick={gerarPDF}
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              gap: "10px",
              padding: "8px 12px",
              borderRadius: "6px",
              transition: "0.2s ease",
              width: "fit-content",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.03)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
          >
            <img
              src="https://static.vecteezy.com/system/resources/previews/023/234/824/non_2x/pdf-icon-red-and-white-color-for-free-png.png"
              style={{ width: "50px", height: "50px" }}
              alt="PDF icon"
            />

            <span style={{ fontSize: "20px", fontWeight: "600" }}>
              Download da Documentação
            </span>
          </div>
        </div>

        {/* CONTEÚDO */}
        <div
          id="conteudo-pei-pdf"
          style={{
            marginLeft: "100px",
            marginRight: "100px",
            padding: "50px",
            fontSize: "16px",
            textAlign: "justify",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <img src={logo} height={150} />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <p>
                <b>Aluno:</b> {selectPei.aluno?.nome}
              </p>
              <p>
                <b>Matrícula:</b> {selectPei.aluno?.matricula}
              </p>
              <p>
                <b>Curso:</b> {selectPei.cursos?.nome}
              </p>
            </div>

            <div>
              <p>
                <b>Status:</b> {selectPei.status_pei}
              </p>
            </div>
          </div>

          <br />
          <br />

          <p>
            <b>Histórico:</b>
            <br /> &emsp;&emsp;
            {selectPei.historico_do_aluno}
          </p>

          <p>
            <b>Necessidades:</b>
            <br /> &emsp;&emsp;
            {selectPei.necessidades_educacionais_especificas}
          </p>

          <p>
            <b>Habilidades:</b>
            <br /> &emsp;&emsp;
            {selectPei.habilidades}
          </p>

          <p>
            <b>Dificuldades:</b>
            <br /> &emsp;&emsp;
            {selectPei.dificuldades_apresentadas}
          </p>

          <p>
            <b>Adaptações:</b>
            <br /> &emsp;&emsp;
            {selectPei.adaptacoes}
          </p>

          <br />
          <br />

          <div style={{ textAlign: "center" }}>
            <p>
              <b>Assinatura Docente:</b>
              <br />_______________
            </p>
            <p>
              <b>Assinatura Coordenador de Curso:</b>
              <br />_______________
            </p>
            <p>
              <b>Assinatura NAPNE/NAAf:</b>
              <br />_______________
            </p>
            <p>
              <b>Assinatura Setor Pedagógico:</b>
              <br />_______________
            </p>
            <p>
              <b>Assinatura Assistência Estudantil:</b>
              <br />_______________
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeiVisualizarModal;
