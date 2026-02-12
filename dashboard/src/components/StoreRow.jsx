import StatusBadge from "./StatusBadge";

export default function StoreRow({ store, onDelete }) {
  return (
    <tr>
      <td>{store.id}</td>
      <td>{store.engine}</td>
      <td><StatusBadge status={store.status} /></td>
      <td>
        <a href={store.url} target="_blank" rel="noreferrer">
          {store.url}
        </a>
      </td>
      <td>{new Date(store.createdAt).toLocaleString()}</td>
      <td>
        <button onClick={() => onDelete(store.id)}>Delete</button>
      </td>
    </tr>
  );
}
