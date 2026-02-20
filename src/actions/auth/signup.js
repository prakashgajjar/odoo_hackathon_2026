export const handleSignup = async (e, data) => {
  e.preventDefault();

  if (!data.email || !data.password || !data.fullname ) {
    console.error("All fields are required for signup");
    return false;
  }

  try {
    const res = await fetch("/api/user/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

      const response = await res.json();
      return response ;

  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    return false;
  }
};
