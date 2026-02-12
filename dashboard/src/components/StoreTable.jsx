import StoreRow from "./StoreRow";

export default function StoreTable({ stores, onDelete }) {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Engine</th>
          <th>Status</th>
          <th>URL</th>
          <th>Created</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {stores.map((s) => (
          <StoreRow key={s.id} store={s} onDelete={onDelete} />
        ))}
      </tbody>
    </table>
  );
}
