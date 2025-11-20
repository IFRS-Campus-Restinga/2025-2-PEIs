const formatarNome = (pessoa) => {
  // Caso 1: recebe string direta (ex: "ana_beatriz")
  if (typeof pessoa === "string" && pessoa.trim() !== "") {
    return pessoa
      .replace(/_/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  }

  // Caso 2: recebe objeto { nome: "...", username: "..." }
  if (pessoa && typeof pessoa === "object") {
    if (pessoa.nome) return pessoa.nome;
    if (pessoa.username) {
      return pessoa.username
        .replace(/_/g, " ")
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
    }
  }

  // Caso 3: nada encontrado
  return "Não informado";
};

export default formatarNome;