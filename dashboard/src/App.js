import AuthGate from "./AuthGate";
import Dashboard from "./Dashboard";

function App() {
  return (
    <AuthGate>
      <Dashboard />
    </AuthGate>
  );
}

export default App;
