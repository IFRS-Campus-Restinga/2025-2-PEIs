/**
 * Valida campos de um formulário com base nos atributos `name`
 * Funciona tanto para campos de texto quanto para campos de upload de arquivo.
 *
 * @param {Object} form - objeto do estado (ex: { autor: "", tipo: "" })
 * @param {HTMLFormElement} formElement - referência ao elemento <form>
 * @returns {string[]} - lista de mensagens de erro
 */
export function validaCampos(form, formElement) {
  const mensagens = [];

  if (!formElement) return mensagens;

  // Seleciona todos os campos que tenham atributo "name"
  const inputs = formElement.querySelectorAll("[name]");

  inputs.forEach((input) => {
    const nome = input.getAttribute("name");
    const label =
      input.previousElementSibling?.innerText.replace(/:$/, "") || nome;

    // Caso 1: campo de arquivo
    if (input.type === "file") {
      if (!input.files || input.files.length === 0) {
        mensagens.push(`Preencha o campo: ${label}`);
      }
      return; // evita continuar para validação de texto
    }

    // Caso 2: campo de texto normal, select ou textarea
    if (!form[nome] || form[nome].toString().trim() === "") {
      mensagens.push(`Preencha o campo: ${label}`);
    }
  });

  return mensagens;
}
