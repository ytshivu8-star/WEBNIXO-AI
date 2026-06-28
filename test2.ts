const run = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: '{"email":"test@test.com", amount: 49, planId: "pro_monthly"}' // missing quotes on amount key
    });
    console.log("Status:", response.status);
    console.log("Body:", await response.text());
  } catch (err) {
    console.error(err);
  }
};
run();
