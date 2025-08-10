"use client";

import React, { useState } from "react";
import { Button, Input, Link, Form, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "./firebase";
import { setDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";

export default function Register() {
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");

  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible);

  const handleRegister = async (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match", {
        position: "bottom-center",
      });
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
          firstName: fname,
          lastName: lname,
          photo: ""
        });
      }
      toast.success("User Registered Successfully!!", {
        position: "top-center",
      });
      window.location.href = "/profile";
    } catch (error) {
      toast.error("Error registering user: " + error.message, {
        position: "bottom-center",
      });
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="rounded-large bg-white shadow-lg flex w-full max-w-sm flex-col gap-4 px-8 pt-6 pb-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-gray-800">Create your account</h1>
          <p className="text-sm text-gray-500">Join PrathiVidhi community</p>
        </div>

        <Form className="flex flex-col gap-3" validationBehavior="native" onSubmit={handleRegister}>
          <div className="flex gap-2">
            <Input
              isRequired
              label="First Name"
              name="firstName"
              placeholder="Enter your first name"
              type="text"
              variant="bordered"
              value={fname}
              onChange={(e) => setFname(e.target.value)}
              className="flex-1"
            />
            <Input
              label="Last Name"
              name="lastName"
              placeholder="Enter your last name"
              type="text"
              variant="bordered"
              value={lname}
              onChange={(e) => setLname(e.target.value)}
              className="flex-1"
            />
          </div>
          
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
          
          <Input
            isRequired
            endContent={
              <button type="button" onClick={toggleConfirmVisibility} className="focus:outline-none">
                {isConfirmVisible ? (
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
            label="Confirm Password"
            name="confirmPassword"
            placeholder="Confirm your password"
            type={isConfirmVisible ? "text" : "password"}
            variant="bordered"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full"
          />
          
          <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-2" color="primary" type="submit">
            Create Account
          </Button>
        </Form>
        
        <div className="flex items-center gap-4 py-2">
          <Divider className="flex-1 bg-gray-200" />
          <p className="text-xs text-gray-500 shrink-0">OR</p>
          <Divider className="flex-1 bg-gray-200" />
        </div>
        
        <div className="flex flex-col gap-2">
          <Button
            startContent={<Icon icon="flat-color-icons:google" width={24} />}
            variant="bordered"
            className="w-full border-gray-300 hover:border-gray-400"
          >
            Continue with Google
          </Button>
        </div>
        
        <p className="text-sm text-center text-gray-600">
          Already have an account?&nbsp;
          <Link href="/login" size="sm" className="text-blue-600 hover:text-blue-800">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}