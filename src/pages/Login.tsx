import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Eye, EyeOff, User, Mail, Phone, Lock, Upload, AlertCircle } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { getStoredEmployees } from '@/lib/employeeStorage';

export default function Login() {
  const { loginWithCredentials, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Sign In form
  const [signInData, setSignInData] = useState({
    loginId: '',
    password: '',
  });
  
  // Sign Up form
  const [signUpData, setSignUpData] = useState({
    companyName: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    
    if (!signInData.loginId.trim()) {
      setLoginError('Please enter your Login ID');
      return;
    }
    
    if (!signInData.password.trim()) {
      setLoginError('Please enter your password');
      return;
    }
    
    const result = loginWithCredentials(signInData.loginId, signInData.password);
    
    if (!result.success) {
      setLoginError(result.error || 'Login failed. Please try again.');
      return;
    }
    
    navigate('/dashboard');
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // Sign up logic would go here - for now show message
    setLoginError('Please contact your HR administrator to create an account.');
  };

  // Get demo credentials from storage
  const storedEmployees = getStoredEmployees();
  const demoCredentials = storedEmployees.slice(0, 2).map((emp) => ({
    loginId: emp.loginId,
    password: emp.password,
    role: emp.role === 'admin' ? 'Admin/HR' : 'Employee',
    name: emp.name,
  }));

  const fillDemoCredentials = (loginId: string, password: string) => {
    setSignInData({ loginId, password });
    setLoginError(null);
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.success('Logo uploaded (preview not stored in demo)');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 border border-primary/20">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-1">
            <span className="gradient-text">HRMS Portal</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Human Resource Management System
          </p>
        </div>

        {/* Auth Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* Sign In Tab */}
          <TabsContent value="signin">
            <div className="glass-card p-6">
              <form onSubmit={handleSignIn} className="space-y-5">
                {loginError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="loginId">Login ID / Email</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="loginId"
                      placeholder="Enter your Login ID"
                      value={signInData.loginId}
                      onChange={(e) => {
                        setSignInData({ ...signInData, loginId: e.target.value });
                        setLoginError(null);
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={signInData.password}
                      onChange={(e) => {
                        setSignInData({ ...signInData, password: e.target.value });
                        setLoginError(null);
                      }}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  SIGN IN
                </Button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground mb-3 text-center">Demo Credentials (click to fill)</p>
                <div className="space-y-2">
                  {demoCredentials.map((cred) => (
                    <button
                      key={cred.loginId}
                      type="button"
                      onClick={() => fillDemoCredentials(cred.loginId, cred.password)}
                      className="w-full p-3 rounded-lg bg-muted/30 hover:bg-muted/50 border border-border hover:border-primary/30 transition-all text-left"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">{cred.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{cred.loginId}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${cred.role === 'Admin/HR' ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'}`}>
                          {cred.role}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Sign Up Tab */}
          <TabsContent value="signup">
            <div className="glass-card p-6">
              <form onSubmit={handleSignUp} className="space-y-4">
                {loginError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="companyName"
                        placeholder="Enter company name"
                        value={signUpData.companyName}
                        onChange={(e) => setSignUpData({ ...signUpData, companyName: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        title="Upload Logo"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4" />
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoFile}
                      />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={signUpData.name}
                      onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={signUpData.phone}
                      onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signupPassword">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="signupPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={signUpData.password}
                      onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={signUpData.confirmPassword}
                      onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  Sign Up
                </Button>
                
                {/* Already have account link */}
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('signin')}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign In
                  </button>
                </p>
              </form>

              {/* Note about registration */}
              <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> In production, only HR officers or Admins can create new user accounts. Login IDs are auto-generated in format: <code className="text-primary">OI + Name Initials + Year + Serial</code>
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <p className="mt-8 text-sm text-muted-foreground">
        © 2026 HRMS. Built for modern workplaces.
      </p>
    </div>
  );
}
