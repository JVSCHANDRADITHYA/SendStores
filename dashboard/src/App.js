import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchStores, createStore, deleteStore } from "./api";

import StoreTable from "./components/StoreTable";
import SummaryCards from "./components/SummaryCards";
import StatusChart from "./components/StatusChart";


function App() {
  const [engine, setEngine] = useState("woocommerce");
  const queryClient = useQueryClient();

  // Fetch stores (poll every 3 seconds)
  const {
    data: stores = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["stores"],
    queryFn: fetchStores,
    refetchInterval: 3000,
  });

  // Create store
  const createStoreMutation = useMutation({
    mutationFn: () => createStore(engine),
    onSuccess: () => {
      queryClient.invalidateQueries(["stores"]);
    },
  });

  // Delete store
  const deleteStoreMutation = useMutation({
    mutationFn: (id) => deleteStore(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["stores"]);
    },
  });

  return (
    <div className="container">
      <header>
        <h1>Store Provisioning Dashboard</h1>
        <p>Local K8s native multi-store orchestration</p>
      </header>

      {/* Controls */}
      <div className="controls">
        <select value={engine} onChange={(e) => setEngine(e.target.value)}>
          <option value="woocommerce">WooCommerce</option>
          <option value="medusa">MedusaJS</option>
        </select>

        <button
          onClick={() => createStoreMutation.mutate()}
          disabled={createStoreMutation.isLoading}
        >
          {createStoreMutation.isLoading ? "Provisioning..." : "Create Store"}
        </button>
      </div>

      {isLoading && <p>Loading stores…</p>}
      {isError && <p>Error loading stores</p>}

      {!isLoading && !isError && (
        <>
          {/* 🔥 NEW: Top summary cards */}
          <SummaryCards stores={stores} />

          {/* 📊 NEW: Charts */}
          <StatusChart stores={stores} />

          {/* 📋 Existing table */}
          <StoreTable
            stores={stores}
            onDelete={(id) => deleteStoreMutation.mutate(id)}
          />
        </>
      )}
    </div>
  );
}

export default App;
