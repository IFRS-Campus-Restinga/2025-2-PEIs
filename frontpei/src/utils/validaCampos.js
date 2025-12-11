import { getAlertManager } from "../context/AlertContext";

// Mantém um gerenciador global para exibir alertas inline sem hooks
const alertManager = getAlertManager();

/**
 * Valida campos obrigatórios de um formulário
 * e adiciona mensagens inline persistentes até o usuário corrigir o valor.
 *
 * @param {Object} form - estado atual do formulário (ex: { nome: "abc", email: "" })
 * @param {HTMLElement} formElement - elemento <form> para percorrer os inputs
 * @param {Object} [backendErrors] - opcional: erros vindos do backend (ex: { nome: ["já existe"], email: ["inválido"] })
 * @returns {Array<{ fieldName: string, message: string }>}
 */
export function validaCampos(form, formElement, backendErrors = null) {
  const mensagens = [];

  if (!formElement) return mensagens;

  const inputs = formElement.querySelectorAll("[name]");

  // Verifica campos obrigatórios
  inputs.forEach((input) => {
    const nome = input.getAttribute("name");
    const label =
      input.previousElementSibling?.innerText.replace(/:$/, "") || nome;

    const valor =
      form[nome] !== undefined && form[nome] !== null
        ? form[nome].toString().trim()
        : "";

    // Campo obrigatório vazio
    if (valor === "" || valor.length === 0) {
      const msg = `Preencha o campo: ${label}`;
      mensagens.push({ fieldName: nome, message: msg });
      alertManager?.addAlert(msg, "error", { fieldName: nome });
    }
  });

  //  Integração com erros do backend
  if (backendErrors && typeof backendErrors === "object") {
    Object.entries(backendErrors).forEach(([field, msgs]) => {
      if (Array.isArray(msgs) && msgs.length > 0) {
        const msg = msgs.join(", ");
        mensagens.push({ fieldName: field, message: msg });
        alertManager?.addAlert(msg, "error", { fieldName: field });
      }
    });
  }

  return mensagens;
}
