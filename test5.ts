const run = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/coupons", {
      method: "GET",
      headers: { "Host": "ais-dev-yirp3kh4jdkpomhwqbcneu-776900666071.asia-southeast1.run.app", "X-Forwarded-Proto": "https", "Referer": "https://ais-dev-yirp3kh4jdkpomhwqbcneu-776900666071.asia-southeast1.run.app/" },
    });
    console.log("Status:", response.status);
    console.log("Body:", await response.text());
  } catch (err) {
    console.error(err);
  }
};
run();
