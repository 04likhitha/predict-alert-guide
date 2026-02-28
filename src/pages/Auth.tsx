import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const signInSchema = z.object({
  email: z.string().trim().email('Invalid email address').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
});

const signUpSchema = z.object({
  displayName: z.string().trim().min(2, 'Display name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] });

type SignInForm = z.infer<typeof signInSchema>;
type SignUpForm = z.infer<typeof signUpSchema>;

export default function Auth() {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { if (user) navigate('/'); }, [user, navigate]);

  const signInForm = useForm<SignInForm>({ resolver: zodResolver(signInSchema), defaultValues: { email: '', password: '' } });
  const signUpForm = useForm<SignUpForm>({ resolver: zodResolver(signUpSchema), defaultValues: { displayName: '', email: '', password: '', confirmPassword: '' } });

  const onSignIn = async (data: SignInForm) => { setIsLoading(true); await signIn(data.email, data.password); setIsLoading(false); };
  const onSignUp = async (data: SignUpForm) => { setIsLoading(true); await signUp(data.email, data.password, data.displayName); setIsLoading(false); };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald to-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold">GreenTech GRIP</h1>
          <p className="text-xs text-muted-foreground mt-1">Reliability Intelligence Platform</p>
        </div>

        <Card className="bg-card border border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Welcome</CardTitle>
            <CardDescription className="text-xs">Sign in or create a new account</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-5 h-9">
                <TabsTrigger value="signin" className="text-xs">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="text-xs">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <Form {...signInForm}>
                  <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-3">
                    <FormField control={signInForm.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel className="text-xs">Email</FormLabel><FormControl><Input placeholder="your@email.com" type="email" className="h-9 text-sm" {...field} /></FormControl><FormMessage className="text-[10px]" /></FormItem>
                    )} />
                    <FormField control={signInForm.control} name="password" render={({ field }) => (
                      <FormItem><FormLabel className="text-xs">Password</FormLabel><FormControl><Input placeholder="••••••••" type="password" className="h-9 text-sm" {...field} /></FormControl><FormMessage className="text-[10px]" /></FormItem>
                    )} />
                    <Button type="submit" className="w-full h-9 text-xs" disabled={isLoading}>
                      {isLoading ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Signing in...</> : 'Sign In'}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="signup">
                <Form {...signUpForm}>
                  <form onSubmit={signUpForm.handleSubmit(onSignUp)} className="space-y-3">
                    <FormField control={signUpForm.control} name="displayName" render={({ field }) => (
                      <FormItem><FormLabel className="text-xs">Display Name</FormLabel><FormControl><Input placeholder="John Doe" className="h-9 text-sm" {...field} /></FormControl><FormMessage className="text-[10px]" /></FormItem>
                    )} />
                    <FormField control={signUpForm.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel className="text-xs">Email</FormLabel><FormControl><Input placeholder="your@email.com" type="email" className="h-9 text-sm" {...field} /></FormControl><FormMessage className="text-[10px]" /></FormItem>
                    )} />
                    <FormField control={signUpForm.control} name="password" render={({ field }) => (
                      <FormItem><FormLabel className="text-xs">Password</FormLabel><FormControl><Input placeholder="••••••••" type="password" className="h-9 text-sm" {...field} /></FormControl><FormMessage className="text-[10px]" /></FormItem>
                    )} />
                    <FormField control={signUpForm.control} name="confirmPassword" render={({ field }) => (
                      <FormItem><FormLabel className="text-xs">Confirm Password</FormLabel><FormControl><Input placeholder="••••••••" type="password" className="h-9 text-sm" {...field} /></FormControl><FormMessage className="text-[10px]" /></FormItem>
                    )} />
                    <Button type="submit" className="w-full h-9 text-xs" disabled={isLoading}>
                      {isLoading ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Creating account...</> : 'Create Account'}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
