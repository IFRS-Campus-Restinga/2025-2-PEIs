import { API_ROUTES } from "../configs/apiRoutes";
export async function mandaEmail(destino, assunto, texto) {
    const url = API_ROUTES.MANDAEMAIL;
    try {
      const resposta = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destino,
          assunto,
          texto,
        }),
      });
  
      if (!resposta.ok) {
        throw new Error(`Erro ao enviar email: ${resposta.status}`); }
  
      const dados = await resposta.json();
      console.log("Email enviado com sucesso:", dados);
      return dados;
  
    } catch (erro) {
      console.error("Erro no envio de email:", erro);
      throw erro; }

}
