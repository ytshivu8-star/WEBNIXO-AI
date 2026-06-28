const run = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@test.com", amount: 49, planId: "pro_monthly" })
    });
    console.log("Status:", response.status);
    console.log("Body:", await response.text());
  } catch (err) {
    console.error(err);
  }
};
run();
