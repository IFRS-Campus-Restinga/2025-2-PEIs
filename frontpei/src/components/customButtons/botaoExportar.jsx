import {jsPDF} from "jspdf";
import { useEffect } from "react";

export default function BotaoExportar(props) {
    const DBDATA = props.DBDATA
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
    const nomeArquivo = props.nomeArquivo
    //const tipoArquivo = props.tipoArquivo

    useEffect(() => {
        function initClient() {
        gapi.load("client:auth2", () => {
            gapi.auth2.init({
            client_id: clientId,
            scope: "https://www.googleapis.com/auth/drive.file",
            });
        });
        }
        window.gapi ? initClient() : console.log("Aguardando API Google...");
    }, [clientId]);

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

        const auth = gapi.auth2.getAuthInstance();
        const user = auth.currentUser.get();
        if (!user.isSignedIn()) {
            await auth.signIn();
        }

        const accessToken = user.getAuthResponse().access_token;
        const metadata = {
            name: `${nomeArquivo}.pdf`,
            mimeType: "application/pdf",
        };

        const form = new FormData();
        form.append(
            "metadata",
            new Blob([JSON.stringify(metadata)], { type: "application/json" })
        );
        form.append("file", pdfBlob);

        const res = await fetch(
            "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
            {
            method: "POST",
            headers: new Headers({ Authorization: "Bearer " + accessToken }),
            body: form,
            }
        );

        const data = await res.json();
        alert(`PDF enviado com sucesso! ID: ${data.id}`);
        } catch (err) {
        console.error(err);
        alert("Erro ao exportar para o Drive");
        }
    }


    return(
        <>
            <button onClick={handleExportar}>Exportar dados para o Drive</button>
        </>
    )
}