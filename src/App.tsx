import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Garden } from './components/Garden';
import { AuthModal } from './components/AuthModal';
import { Session } from '@supabase/supabase-js';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [gardenId, setGardenId] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadOrCreateGarden(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        if (session) {
          await loadOrCreateGarden(session.user.id);
        } else {
          setGardenId(null);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadOrCreateGarden = async (userId: string) => {
    const { data: gardens, error } = await supabase
      .from('gardens')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error loading garden:', error);
      setLoading(false);
      return;
    }

    if (gardens) {
      setGardenId(gardens.id);
    } else {
      const { data: newGarden, error: createError } = await supabase
        .from('gardens')
        .insert({ user_id: userId, name: 'My Garden' })
        .select()
        .single();

      if (createError) {
        console.error('Error creating garden:', createError);
      } else if (newGarden) {
        setGardenId(newGarden.id);
      }
    }
    setLoading(false);
  };

  const handleSignUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const handleSignIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🌱</div>
          <p className="text-gray-600 font-medium">Loading your garden...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-pink-50 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDAsIDAsIDAsIDAuMDIpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

        <div className="relative z-10 text-center max-w-md mx-4">
          <div className="mb-8 flex justify-center gap-4 text-6xl">
            <span className="animate-float">🌸</span>
            <span className="animate-float" style={{ animationDelay: '0.2s' }}>🌿</span>
            <span className="animate-float" style={{ animationDelay: '0.4s' }}>🌺</span>
          </div>

          <h1 className="text-5xl font-bold text-gray-800 mb-4">Virtual Garden</h1>
          <p className="text-lg text-gray-600 mb-8">
            Grow and nurture your own digital plants. Watch them bloom as you care for them.
          </p>

          <button
            onClick={() => setShowAuth(true)}
            className="px-8 py-4 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white rounded-2xl font-medium text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            Start Your Garden
          </button>

          <div className="mt-12 grid grid-cols-3 gap-4 text-center">
            <div className="bg-white bg-opacity-60 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-3xl mb-2">💧</div>
              <p className="text-sm text-gray-600 font-medium">Water Plants</p>
            </div>
            <div className="bg-white bg-opacity-60 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-3xl mb-2">❤️</div>
              <p className="text-sm text-gray-600 font-medium">Show Care</p>
            </div>
            <div className="bg-white bg-opacity-60 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-3xl mb-2">🌱</div>
              <p className="text-sm text-gray-600 font-medium">Watch Grow</p>
            </div>
          </div>
        </div>

        {showAuth && (
          <AuthModal
            onClose={() => setShowAuth(false)}
            onSignIn={handleSignIn}
            onSignUp={handleSignUp}
          />
        )}
      </div>
    );
  }

  if (!gardenId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🌱</div>
          <p className="text-gray-600 font-medium">Creating your garden...</p>
        </div>
      </div>
    );
  }

  return <Garden gardenId={gardenId} onSignOut={handleSignOut} />;
}

export default App;
