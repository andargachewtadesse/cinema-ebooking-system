'use client';
import { useRouter } from 'next/navigation';
import React from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Registration Successful!</CardTitle>
            <CardDescription className="text-center">
              Your account has been created
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-gray-700 mt-2">Your account has been created successfully.</p>
              <p className="text-gray-700">You can now log in using your credentials.</p>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center pt-6">
            <Button 
              onClick={() => router.push('/login')}
              className="bg-black text-white hover:bg-gray-800 px-8"
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
