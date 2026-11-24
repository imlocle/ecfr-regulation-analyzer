import { useState } from "react";
import { triggerIngest } from "@/services/api";
import "@/styles/IngestDataButton.css";

interface IngestDataButtonProps {
  onError?: (error: string) => void;
}

const IngestDataButton = ({ onError }: IngestDataButtonProps) => {
  const [ingesting, setIngesting] = useState(false);

  const handleIngest = async () => {
    setIngesting(true);
    try {
      const result = await triggerIngest();
      alert(
        `${result.message}\n\nThe data will be updated in a few minutes. You can manually refresh the page to see the latest data.`
      );
    } catch (e: any) {
      if (onError) {
        onError(e.message);
      }
    } finally {
      setIngesting(false);
    }
  };

  return (
    <button
      className="ingest-button"
      onClick={handleIngest}
      disabled={ingesting}
      aria-label="Ingest new data"
    >
      {ingesting ? (
        <>
          <span className="spinner" aria-hidden="true"></span>
          Ingesting...
        </>
      ) : (
        "Ingest Data"
      )}
    </button>
  );
};

export default IngestDataButton;
