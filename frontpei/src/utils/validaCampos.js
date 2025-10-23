export function validaCampos(form, formElement) {
  const mensagens = [];
  if (!formElement) return mensagens;

  const inputs = formElement.querySelectorAll("[name]");

  inputs.forEach((input) => {
    const nome = input.getAttribute("name");
    const label =
      input.previousElementSibling?.innerText.replace(/:$/, "") || nome;

    if (input.type === "file") {
      if (!input.files || input.files.length === 0) {
        mensagens.push({ fieldName: nome, message: `Preencha o campo: ${label}` });
      }
      return;
    }

    if (!form[nome] || form[nome].toString().trim() === "") {
      mensagens.push({ fieldName: nome, message: `Preencha o campo: ${label}` });
    }
  });

  return mensagens;
}
