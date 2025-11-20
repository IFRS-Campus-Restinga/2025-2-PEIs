import { useEffect, useState } from "react";

export default function CrudForm({ schema, selected, onSave, onCancel }) {
  const [form, setForm] = useState({});

  useEffect(() => {
    setForm(selected || {});
  }, [selected]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={submit} style={{ marginBottom: 20 }}>
      {schema.fields.map((field) => (
        <div key={field.name} style={{ marginBottom: 10 }}>
          <label>{field.label}</label>
          <input
            type={field.type}
            name={field.name}
            value={form[field.name] || ""}
            required={field.required}
            onChange={handleChange}
          />
        </div>
      ))}

      <button type="submit">{selected ? "Salvar" : "Cadastrar"}</button>
      {selected && <button onClick={onCancel}>Cancelar</button>}
    </form>
  );
}
