import "@/styles/InfoTooltip.css";

interface InfoTooltipProps {
  text: string;
}

const InfoTooltip = ({ text }: InfoTooltipProps) => {
  return (
    <span className="info-tooltip">
      <svg
        className="info-icon"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M8 7.5V11.5M8 5.5V5.51"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="tooltip-text" role="tooltip">
        {text}
      </span>
    </span>
  );
};

export default InfoTooltip;
