import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    console.log('Login Success:', credentialResponse);
    // Use the auth context to handle login
    login(credentialResponse);
    navigate('/dashboard');
  };

  const handleGoogleError = () => {
    console.log('Login Failed');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-20 w-4 h-4 bg-white/20 rounded-full"></div>
      <div className="absolute top-60 right-32 w-6 h-6 bg-white/30 rounded-full"></div>
      <div className="absolute bottom-40 left-40 w-3 h-3 bg-white/25 rounded-full"></div>
      <div className="absolute bottom-20 right-20 w-5 h-5 bg-white/20 rounded-full"></div>

      <div className="max-w-md w-full space-y-8 text-center">
        {/* Mascot */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Speech bubble */}
            <div className="bg-white/90 rounded-full p-8 shadow-2xl relative">
              {/* Capybara face */}
              <div className="w-24 h-24 bg-orange-400 rounded-full relative mx-auto">
                {/* Eyes */}
                <div className="absolute top-4 left-4 w-3 h-3 bg-black rounded-full"></div>
                <div className="absolute top-4 right-4 w-3 h-3 bg-black rounded-full"></div>
                {/* Nose */}
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-black rounded-full"></div>
                {/* Ears */}
                <div className="absolute -top-2 left-2 w-4 h-6 bg-orange-600 rounded-full transform -rotate-12"></div>
                <div className="absolute -top-2 right-2 w-4 h-6 bg-orange-600 rounded-full transform rotate-12"></div>
              </div>
              
              {/* Speech bubble tail */}
              <div className="absolute bottom-0 left-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white/90 transform translate-y-full"></div>
            </div>
          </div>
        </div>

        {/* Title and description */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white">
            Learn English easily with cards
          </h1>
          <p className="text-lg text-purple-200">
            Learn words using cards, create your own cards with the extention!
          </p>
        </div>

        {/* Google Login Button */}
        <div className="mt-12">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-1 shadow-xl hover:shadow-2xl transition-all duration-300">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_blue"
              size="large"
              text="signin_with"
              shape="rectangular"
              logo_alignment="left"
              width="100%"
            />
          </div>
        </div>

        {/* Footer text */}
        <div className="mt-8">
          <p className="text-sm text-purple-300">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
