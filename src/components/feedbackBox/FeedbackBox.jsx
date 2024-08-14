import "./FeedbackBox.css"

function FeedbackBox({title, color}) {
  return (
    <div className={`feedback-box ${color}`}>
        <p className={color}>{title}</p>
    </div>
  )
}

export default FeedbackBox