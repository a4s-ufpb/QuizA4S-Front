import "./FeedbackBox.css";

interface FeedbackBoxProps {
  title: string;
  color: string;
  subtitle?: string;
}

function FeedbackBox({ title, color, subtitle }: FeedbackBoxProps) {
  return (
    <div className={`feedback-box ${color}`}>
      <p>{title}</p>
      {subtitle && (
        <p style={{ fontSize: "0.9em", marginTop: 8, opacity: 0.95, whiteSpace: "pre-wrap" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default FeedbackBox;
