import { jsPDF } from "jspdf";
import axios from "axios";

export default function BotaoExportar({ DBDATA, nomeArquivo }) {
    const DBEXPORTAR = axios.create({baseURL: import.meta.env.VITE_EXPORTAR_URL,});

    async function handleExportar() {
        try {
            const pdf = new jsPDF();
            pdf.text(`Exportação de dados - ${nomeArquivo}`, 10, 10);

            let y = 20;
            DBDATA.forEach((item, index) => {
                pdf.text(`${index + 1}. ${JSON.stringify(item)}`, 10, y);
                y += 10;
            });

            const pdfBlob = pdf.output("blob");

            const formData = new FormData();
            formData.append("file", pdfBlob, `${nomeArquivo}.pdf`);

            // Envia para o backend via axios
            const response = await DBEXPORTAR.post("/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            alert(`PDF enviado com sucesso!`);
        } catch (err) {
            console.error(err);
            alert("Erro ao exportar PDF");
        }
    }

    return (
        <button onClick={handleExportar}>
        Exportar dados para o Drive
        </button>
    );
}
