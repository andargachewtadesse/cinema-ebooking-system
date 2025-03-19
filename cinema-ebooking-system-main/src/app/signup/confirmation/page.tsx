'use client';
import { useRouter } from 'next/navigation';
import React from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

const Confirmation: React.FC = () => {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex items-center justify-between mb-12">
        <Link href="/">
          <h1 className="text-2xl font-bold">Bulldawgs Cinema</h1>
        </Link>
        <div className="flex gap-4">
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-black text-white hover:bg-gray-800">Sign Up</Button>
          </Link>
        </div>
      </header>

      <div className="flex justify-center items-center min-h-[60vh]">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mb-6">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
          </div>

          <CardTitle className="text-2xl font-bold mb-2">Registration Successful!</CardTitle>
          
          <CardContent className="p-0 mb-6">
            <p className="text-muted-foreground">
              Your account has been created successfully.
            </p>
            <p className="text-muted-foreground">
              You can now log in using your credentials.
            </p>
          </CardContent>

          <CardFooter className="flex justify-center p-0">
            <Button 
              onClick={() => router.push('/login')}
              className="w-full bg-black text-white hover:bg-gray-800"
            >
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Confirmation;
