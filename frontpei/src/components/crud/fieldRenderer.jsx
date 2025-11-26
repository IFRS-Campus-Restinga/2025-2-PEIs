export function renderInput(field, form, handleChange, optionsCache) {
  const value = form[field.name] ?? "";

  // Não renderiza ID
  if (field.name === "id") return null;

  // FK / OneToOne => SELECT
  if (field.type === "ForeignKey" || field.type === "OneToOneField") {
    const options = optionsCache[field.name] || [];

    return (
      <select name={field.name} value={value} onChange={handleChange}>
        <option value="">Selecione...</option>
        {options.map(opt => (
          <option key={opt.id} value={opt.id}>
            {opt.nome || opt.label || opt.id}
          </option>
        ))}
      </select>
    );
  }

  // Textos longos
  if (field.type === "TextField") {
    return (
      <textarea
        name={field.name}
        value={value}
        onChange={handleChange}
        rows={4}
      />
    );
  }

  // Boolean
  if (field.type === "BooleanField") {
    return (
      <input
        type="checkbox"
        checked={!!value}
        onChange={(e) =>
          handleChange({ target: { name: field.name, value: e.target.checked } })
        }
      />
    );
  }

  // Date
  if (field.type === "DateField") {
    return (
      <input type="date" name={field.name} value={value} onChange={handleChange} />
    );
  }

  // Default → charfield
  return (
    <input type="text" name={field.name} value={value} onChange={handleChange} />
  );
}
