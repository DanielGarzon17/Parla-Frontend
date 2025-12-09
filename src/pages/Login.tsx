import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useEffect, useState } from 'react';
import { googleLogin, getUserProfile } from '@/services/authApi';
import logo from '@/assets/logo.png';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, login: authLogin } = useAuth();
  const { isDark } = useTheme();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const { access_token } = tokenResponse;
      setLoginError(null);
      setIsLoggingIn(true);

      try {
        // Get user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        
        const userInfo = await userInfoResponse.json();

        // Send to backend - this sets the session cookie
        await googleLogin(access_token, userInfo);

        // Fetch full user profile from backend
        const userData = await getUserProfile();
        
        //console.log('Login successful:', userData);
        
        // Set authentication state with complete user data from backend
        authLogin(userData);
        navigate('/dashboard');
      } catch (error) {
        console.error('Login error:', error);
        setLoginError(error instanceof Error ? error.message : 'Error al iniciar sesión');
      } finally {
        setIsLoggingIn(false);
      }
    },
    onError: (err) => {
      console.error('Google OAuth error:', err);
      setLoginError('Error al conectar con Google');
    },
  });

  return (
    <div className={`min-h-screen flex items-center justify-center p-8 relative overflow-hidden transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900' 
        : 'bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700'
    }`}>
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
            <img src={logo} alt="User avatar" className="w-30 h-30 object-cover" />
            
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
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
            {loginError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                {loginError}
              </div>
            )}
            <button 
              onClick={() => login()}
              disabled={isLoggingIn || isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Login con Google
                </>
              )}
            </button>
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
