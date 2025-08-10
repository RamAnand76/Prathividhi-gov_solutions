"use client";

import React, { useState } from "react";
import { Button, Input, Checkbox, Link, Form, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import { toast } from "react-toastify";
import SignInwithGoogle from "./signInWithGoogle";

export default function Login() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleError = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No user found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-email':
        return 'Invalid email format.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in Successfully");
      window.location.href = "/profile";
      toast.success("User logged in Successfully", {
        position: "top-center",
      });
    } catch (error) {
      const errorMessage = handleError(error.code);
      console.log(errorMessage);
      toast.error(errorMessage, {
        position: "bottom-center",
      });
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="rounded-large bg-white shadow-lg flex w-full max-w-sm flex-col gap-4 px-8 pt-6 pb-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-gray-800">Sign in to your account</h1>
          <p className="text-sm text-gray-500">Welcome back to PrathiVidhi</p>
        </div>

        <Form className="flex flex-col gap-3" validationBehavior="native" onSubmit={handleSubmit}>
          <Input
            isRequired
            label="Email Address"
            name="email"
            placeholder="Enter your email"
            type="email"
            variant="bordered"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full"
          />
          <Input
            isRequired
            endContent={
              <button type="button" onClick={toggleVisibility} className="focus:outline-none">
                {isVisible ? (
                  <Icon
                    className="text-gray-400 pointer-events-none text-2xl"
                    icon="solar:eye-closed-linear"
                  />
                ) : (
                  <Icon
                    className="text-gray-400 pointer-events-none text-2xl"
                    icon="solar:eye-bold"
                  />
                )}
              </button>
            }
            label="Password"
            name="password"
            placeholder="Enter your password"
            type={isVisible ? "text" : "password"}
            variant="bordered"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full"
          />
          <div className="flex w-full items-center justify-between px-1 py-2">
            <Checkbox name="remember" size="sm" className="text-sm">
              Remember me
            </Checkbox>
            <Link className="text-gray-500 hover:text-blue-600" href="#" size="sm">
              Forgot password?
            </Link>
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700" color="primary" type="submit">
            Sign In
          </Button>
        </Form>
        
        <div className="flex items-center gap-4 py-2">
          <Divider className="flex-1 bg-gray-200" />
          <p className="text-xs text-gray-500 shrink-0">OR</p>
          <Divider className="flex-1 bg-gray-200" />
        </div>
        
        <div className="flex flex-col gap-2">
          <SignInwithGoogle />
        </div>
        
        <p className="text-sm text-center text-gray-600">
          Need to create an account?&nbsp;
          <Link href="/register" size="sm" className="text-blue-600 hover:text-blue-800">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}