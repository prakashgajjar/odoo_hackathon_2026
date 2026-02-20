  export const handleLogin = async (e, data) => {
    e.preventDefault();

    if (!data.email || !data.password) {
      console.error("Email and password are required for login");
      return false;
    }

    try {
      const res = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        console.error("Network response was not ok");
        return false;
      }

      const resData = await res.json();
      console.log("Login successful:", resData);
      return true;
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      return false;
    }
  };
