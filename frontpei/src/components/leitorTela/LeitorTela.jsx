import { useState, useEffect } from "react";
import "../../cssGlobal.css";

/*
Esse componente ativa globalmente um leitor de tela ao passar o mouse por cima.
Vai funcionar enquanto o botão existir na tela (por isso colocado no header),
ele adiciona em todos os componentes HTML a função com o addEventListener.
*/

function LeitorTela() {

  // estado de ativado ou desativado do leitor
  const [leitorAtivo, setLeitorAtivo] = useState(false);

  // inicializador pra funcao
  useEffect(() => {

    // se o leitor nao estiver ativo, sai da funcao e nao adiciona o evento
    if (!leitorAtivo) return;
    // funcao chamada sempre que o mouse entra em algum elemento da pagina
    const lerTexto = (e) => {
      // o innerText pega o texto visivel do elemento onde o mouse entrou
      const texto = e.target.innerText?.trim();
      // dando uma validada no texto capturado
      if (texto && texto.length > 0) {
        // interrompe se ja estiver falando
        speechSynthesis.cancel(); 
        // cria o objeto de fala
        const fala = new SpeechSynthesisUtterance(texto);
        // define o idioma
        fala.lang = "pt-BR";
        // executa a fala em si
        speechSynthesis.speak(fala); } };

    // aqui a magia, adiciona o evento de hover em todo elemento html
    document.addEventListener("mouseenter", lerTexto, true);
    // ou remove o evento quando o desativar o leitor ou o desmontar o componente
    return () => document.removeEventListener("mouseenter", lerTexto, true);

}, [leitorAtivo]); // depende do estado 'leitorAtivo'

  // aqui o botao que liga e desliga
  return (
    <div className="area-leitor">
      <span className="leitor-label">{leitorAtivo ? "🔊" : "🔇"}</span>
      <label className="botao">
        <input type="checkbox" checked={leitorAtivo} onChange={() => setLeitorAtivo(!leitorAtivo)}/>
        <span className="slider round"></span>
      </label>
    </div> );}

export default LeitorTela;