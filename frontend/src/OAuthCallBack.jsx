
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      if (token) {
        localStorage.setItem('firebaseToken', token);
        navigate('/chatpage');
      } else {
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate]);

  return <div>Loading...</div>;
}