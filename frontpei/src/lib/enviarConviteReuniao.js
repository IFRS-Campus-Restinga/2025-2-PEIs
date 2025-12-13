import { API_ROUTES } from "../configs/apiRoutes";
export async function enviarConviteReuniao(destino, assunto, descricao, inicio, fim) {
  const url = API_ROUTES.ENVIARCONVITEREUNIAO;
  try {
    const resposta = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        destinos: Array.isArray(destino) ? destino : [destino],
        assunto,
        descricao,
        // formato "2025-02-20T14:00"
        inicio,
        // formato "2025-02-20T15:00"   
        fim
      }),
    });

    if (!resposta.ok) {
      throw new Error(`Erro ao enviar convite: ${resposta.status}`);
    }

    const dados = await resposta.json();
    console.log("Convite enviado:", dados);
    return dados;

  } catch (erro) {
    console.error("Erro no envio de convite:", erro);
    throw erro;
  }
}