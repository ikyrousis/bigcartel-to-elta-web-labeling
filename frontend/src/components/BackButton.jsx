import { useNavigate } from 'react-router-dom';

function BackButton() {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem' }}>
      ← Back
    </button>
  );
}

export default BackButton;
