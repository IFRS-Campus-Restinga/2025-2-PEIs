export default function CrudTable({ schema, data, onEdit, onDelete }) {
  return (
    <table border="1" cellPadding="6">
      <thead>
        <tr>
          {schema.fields.map((f) => (
            <th key={f.name}>{f.label}</th>
          ))}
          <th>Ações</th>
        </tr>
      </thead>

      <tbody>
        {data.map((row) => (
          <tr key={row.id}>
            {schema.fields.map((f) => (
              <td key={f.name}>{row[f.name]}</td>
            ))}
            <td>
              <button onClick={() => onEdit(row)}>Editar</button>
              <button onClick={() => onDelete(row.id)}>Excluir</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
