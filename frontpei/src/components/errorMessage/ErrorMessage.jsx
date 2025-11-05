import "../../cssGlobal.css";

const ErrorMessage = ({ message, align = "center" }) => {
  if (!message) return null;

  return (
    <p className="error-message" style={{ textAlign: align }}>
      {message}
    </p>
  );
};

export default ErrorMessage;
