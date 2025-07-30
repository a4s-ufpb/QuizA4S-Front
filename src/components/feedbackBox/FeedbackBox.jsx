import "./FeedbackBox.css";

function FeedbackBox({ title, color }) {
  return (
    <div className={`feedback-box ${color}`}>
      <p>{title}</p>
    </div>
  );
}

export default FeedbackBox;