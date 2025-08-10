import React from "react";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "./firebase";
import { toast } from "react-toastify";
import { setDoc, doc } from "firebase/firestore";

function SignInwithGoogle() {
  function googleLogin() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).then(async (result) => {
      console.log(result);
      const user = result.user;
      if (result.user) {
        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
          firstName: user.displayName,
          photo: user.photoURL,
          lastName: "",
        });
        toast.success("User logged in Successfully", {
          position: "top-center",
        });
        window.location.href = "/profile";
      }
    });
  }

  return (
    <Button
      startContent={<Icon icon="flat-color-icons:google" width={24} />}
      variant="bordered"
      className="w-full border-gray-300 hover:border-gray-400"
      onClick={googleLogin}
    >
      Continue with Google
    </Button>
  );
}

export default SignInwithGoogle;