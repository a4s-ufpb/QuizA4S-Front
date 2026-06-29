import "./FeedbackBox.css";

interface FeedbackBoxProps {
  title: string;
  color: string;
}

function FeedbackBox({ title, color }: FeedbackBoxProps) {
  return (
    <div className={`feedback-box ${color}`}>
      <p>{title}</p>
    </div>
  );
}

export default FeedbackBox;
