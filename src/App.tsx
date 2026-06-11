import { LanguageProvider } from "./context/LanguageContext";
import AppContent from "./AppContent";

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
