export async function mandaEmail(destino, assunto, texto) {
    const url = import.meta.env.VITE_EMAIL_URL;
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