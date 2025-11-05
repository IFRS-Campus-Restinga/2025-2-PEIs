// components/customButtons/botaoExportar.jsx
import { useState } from "react";
import { jsPDF } from "jspdf";
import axios from "axios";

export default function BotaoExportar({ DBDATA, nomeArquivo, className }) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const DBEXPORTAR = axios.create({
    baseURL: import.meta.env.VITE_EXPORTAR_URL,
  });

  async function handleExportar() {
    setLoading(true);
    setErro("");

    try {
      // 1. Gera o PDF
      const pdf = new jsPDF();
      pdf.setFontSize(14);
      pdf.text(`Exportação de Cursos - ${nomeArquivo}`, 10, 15);

      let y = 30;
      DBDATA.forEach((curso, index) => {
        const linha = `${index + 1}. ${curso.name} (${curso.nivel || "N/D"})`;
        if (y > 280) {
          pdf.addPage();
          y = 20;
        }
        pdf.setFontSize(10);
        pdf.text(linha, 10, y);
        y += 8;
      });

      const pdfBlob = pdf.output("blob");

      // 2. Prepara FormData
      const formData = new FormData();
      formData.append("file", pdfBlob, `${nomeArquivo}.pdf`);

      // 3. Pega token do Django (do login com Google)
      const token = localStorage.getItem("django_token");
      if (!token) {
        alert("Faça login com Google primeiro!");
        setLoading(false);
        return;
      }

      // 4. Envia pro backend
      const response = await DBEXPORTAR.post("/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Token ${token}`,
        },
        withCredentials: true, // para sessão
      });

      // 5. Abre o arquivo no Google Drive
      window.open(response.data.link, "_blank");
      alert("PDF exportado com sucesso no Google Drive!");

    } catch (err) {
      console.error("Erro ao exportar:", err);
      const msg = err.response?.data?.error || "Erro ao enviar PDF";
      setErro(msg);
      alert(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleExportar}
        disabled={loading}
        className={className}
        style={{ opacity: loading ? 0.7 : 1 }}
      >
        {loading ? "Exportando..." : "Exportar para o Drive"}
      </button>
      {erro && <p style={{ color: "red", fontSize: "12px" }}>{erro}</p>}
    </div>
  );
}