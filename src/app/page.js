"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Loader from "@/components/Loader";
import { handleLogin } from "@/actions/auth/login";
import { handleSignup } from "@/actions/auth/signup";

export default function LoginPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [ckeckusernameData, setCkeckusernameData] = useState(null);
  const [otp, setOtp] = useState("");
  const [data, setData] = useState({
    email: "",
    password: "",
    fullname: "",
  });
  const [isOtpVisible, setIsOtpVisible] = useState(false);
  const [loading, setLoading] = useState(false); // loader state

  useEffect(() => {
    setShow(true);
  }, []);

  useEffect(() => {
    // Simple auth check on mount
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/user/check", {
          credentials: "include",
        });
        if (res.ok) {
          router.replace("/home");
        }
      } catch (error) {
        console.log("Not authenticated");
      }
    };
    checkAuth();
  }, [router]);

  // ===== Signup =====
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await handleSignup(e, data);
      if (success.status === 201) {
        setIsOtpVisible(true);
      }
      if (success.status === 409) {
        toast.error("Oops! This email is already registered. Try logging in?");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const onSubmitLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const success = await handleLogin(e, data);
      if (success) {
        router.push("/home");
      }
    } catch (err) {
      console.error(err);
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-black via-zinc-900 to-gray-800 text-white px-4 relative">
      {loading && <Loader />} {/* show loader overlay */}
      <div className="max-w-6xl w-full md:grid-cols-2 gap-8 items-center py-10">
        {/* Left: Animated Image */}

        {/* Right: Auth Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="bg-zinc-900 rounded-2xl p-8 w-full max-w-md mx-auto shadow-2xl border border-zinc-700"
        >
          <h2 className="text-4xl font-extrabold tracking-wide text-center mb-6 bg-linear-to-r from-green-400 to-blue-500 text-transparent bg-clip-text">
            {isLogin ? "Welcome back to Poplix" : "Join the Poplix Revolution"}
          </h2>

          {/* Show Login / Signup form */}
          {isLogin ? (
            <form className="space-y-4" onSubmit={onSubmitLogin}>
              <input
                type="text"
                placeholder="Email or username"
                className="input-style"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
              />
              <input
                type="password"
                placeholder="Password"
                className="input-style"
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
              />
              <button
                type="submit"
                className="btn-style bg-blue-600 hover:bg-blue-700"
              >
                Log In
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={onSubmit}>
              <input
                type="email"
                placeholder="Email"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                className="input-style"
              />
              {!data.email.endsWith("@gmail.com") && data.email.length > 0 && (
                <p className="text-yellow-400 text-xs">Only Gmail allowed</p>
              )}

              <input
                type="password"
                placeholder="Password"
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
                className="input-style"
              />
              {data.password.length > 0 && data.password.length < 6 && (
                <p className="text-yellow-400 text-xs">
                  Min 6 characters required
                </p>
              )}

              <input
                type="text"
                placeholder="Fullname"
                value={data.fullname}
                onChange={(e) => setData({ ...data, fullname: e.target.value })}
                className="input-style"
              />
              {!/^[a-zA-Z\s]+$/.test(data.fullname) &&
                data.fullname.length > 0 && (
                  <p className="text-yellow-400 text-xs">
                    No numbers allowed in name
                  </p>
                )}

              {(() => {
                const valid =
                  data.email.endsWith("@gmail.com") &&
                  data.password.length >= 6 &&
                  /^[a-zA-Z\s]+$/.test(data.fullname) &&
                  /^[a-zA-Z][a-zA-Z0-9._]{5,}$/.test(data.username) &&
                  ckeckusernameData === true;

                return (
                  <button
                    type="submit"
                    className={`btn-style bg-green-600 hover:bg-green-700}`}
                  >
                    Sign Up
                  </button>
                );
              })()}
            </form>
          )}

          {/* Toggle login/signup */}
          <div className="text-center text-sm text-zinc-400 mt-6">
            {isLogin ? (
              <>
                Don’t have an account?{" "}
                <button
                  onClick={() => {
                    setIsLogin(false);
                    setData({
                      email: "",
                      password: "",
                      fullname: "",
                    });
                  }}
                  className="text-green-400 hover:underline"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => {
                    setData({
                      email: "",
                      password: "",
                      fullname: "",
                    });
                    setIsLogin(true);
                    setIsOtpVisible(false);
                  }}
                  className="text-blue-400 hover:underline"
                >
                  Log In
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
