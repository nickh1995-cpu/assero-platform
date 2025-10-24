"use client";

import { useState, useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Header } from "@/components/Header";

export default function TestAuthPage() {
  const [supabaseStatus, setSupabaseStatus] = useState<string>("Checking...");
  const [authStatus, setAuthStatus] = useState<string>("Checking...");
  const [user, setUser] = useState<any>(null);
  const [testEmail, setTestEmail] = useState("test@example.com");
  const [testPassword, setTestPassword] = useState("test123456");
  const [testResult, setTestResult] = useState<string>("");

  useEffect(() => {
    checkSupabaseConnection();
    checkAuthStatus();
  }, []);

  const checkSupabaseConnection = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setSupabaseStatus("❌ Supabase client not available");
        return;
      }
      
      // Test basic connection
      const { data, error } = await supabase.from('_supabase_migrations').select('*').limit(1);
      
      if (error) {
        setSupabaseStatus(`❌ Connection error: ${error.message}`);
      } else {
        setSupabaseStatus("✅ Supabase connection successful");
      }
    } catch (err) {
      setSupabaseStatus(`❌ Connection failed: ${err}`);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setAuthStatus("❌ No Supabase client");
        return;
      }

      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        setAuthStatus(`❌ Auth error: ${error.message}`);
      } else if (user) {
        setAuthStatus("✅ User authenticated");
        setUser(user);
      } else {
        setAuthStatus("ℹ️ No user authenticated");
      }
    } catch (err) {
      setAuthStatus(`❌ Auth check failed: ${err}`);
    }
  };

  const testSignUp = async () => {
    setTestResult("Testing sign up...");
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setTestResult("❌ No Supabase client");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            first_name: 'Test',
            last_name: 'User'
          }
        }
      });

      if (error) {
        setTestResult(`❌ Sign up error: ${error.message}`);
      } else {
        setTestResult(`✅ Sign up successful: ${data.user ? 'User created' : 'No user'}`);
      }
    } catch (err) {
      setTestResult(`❌ Sign up exception: ${err}`);
    }
  };

  const testSignIn = async () => {
    setTestResult("Testing sign in...");
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setTestResult("❌ No Supabase client");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });

      if (error) {
        setTestResult(`❌ Sign in error: ${error.message}`);
      } else {
        setTestResult(`✅ Sign in successful: ${data.user ? 'User authenticated' : 'No user'}`);
        setUser(data.user);
      }
    } catch (err) {
      setTestResult(`❌ Sign in exception: ${err}`);
    }
  };

  const testSignOut = async () => {
    setTestResult("Testing sign out...");
    try {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setTestResult("❌ No Supabase client");
        return;
      }

      const { error } = await supabase.auth.signOut();

      if (error) {
        setTestResult(`❌ Sign out error: ${error.message}`);
      } else {
        setTestResult("✅ Sign out successful");
        setUser(null);
      }
    } catch (err) {
      setTestResult(`❌ Sign out exception: ${err}`);
    }
  };

  return (
    <main>
      <Header />
      
      <div className="section padded light">
        <div className="container">
          <div className="signin-container">
            <div className="signin-card">
              <h1 className="section-title">Auth Test Page</h1>
              
              <div className="form-group">
                <h3>Supabase Connection</h3>
                <p>{supabaseStatus}</p>
              </div>

              <div className="form-group">
                <h3>Authentication Status</h3>
                <p>{authStatus}</p>
                {user && (
                  <div style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px', marginTop: '10px' }}>
                    <strong>User Info:</strong><br/>
                    Email: {user.email}<br/>
                    ID: {user.id}<br/>
                    Created: {new Date(user.created_at).toLocaleString()}
                  </div>
                )}
              </div>

              <div className="form-group">
                <h3>Test Authentication</h3>
                <div style={{ marginBottom: '10px' }}>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="form-input"
                    placeholder="Test Email"
                    style={{ marginBottom: '10px' }}
                  />
                  <input
                    type="password"
                    value={testPassword}
                    onChange={(e) => setTestPassword(e.target.value)}
                    className="form-input"
                    placeholder="Test Password"
                    style={{ marginBottom: '10px' }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <button onClick={testSignUp} className="btn-secondary">
                    Test Sign Up
                  </button>
                  <button onClick={testSignIn} className="btn-primary">
                    Test Sign In
                  </button>
                  <button onClick={testSignOut} className="btn-secondary">
                    Test Sign Out
                  </button>
                </div>
                
                <div style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
                  <strong>Test Result:</strong><br/>
                  {testResult}
                </div>
              </div>

              <div className="form-group">
                <h3>Environment Variables</h3>
                <div style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px', fontSize: '12px' }}>
                  <strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}<br/>
                  <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}<br/>
                  <strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
