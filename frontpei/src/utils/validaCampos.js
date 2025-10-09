
/**
 * Valida campos de um formulário com base nos atributos `name`
 * @param {Object} form - objeto do estado (ex: { objetivos: "", metodologia: "" })
 * @param {HTMLFormElement} formElement - referência ao elemento <form>
 * @returns {string[]} - lista de mensagens de erro
 */
export function validaCampos(form, formElement) {
  const mensagens = [];

  if (!formElement) return mensagens;

  // Pega todos os elementos que tenham atributo "name"
  const inputs = formElement.querySelectorAll("[name]");

  inputs.forEach((input) => {
    const nome = input.getAttribute("name");
    const label = input.previousElementSibling?.innerText.replace(/:$/, '') || nome; // pega o texto do <label> antes do campo
    if (!form[nome] || form[nome].toString().trim() === "") {
      mensagens.push(`Preencha o campo: ${label}`);
    }
  });

  return mensagens;
}
