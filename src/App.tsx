import Providers from "./providers/Providers";
import AppRoutes from "./routes/AppRoutes";
import ErrorOverlay from "./components/debug/ErrorOverlay";

function App() {
  return (
    <Providers>
      <AppRoutes />
      <ErrorOverlay />
    </Providers>
  );
}

export default App;
