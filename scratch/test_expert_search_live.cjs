async function testSearchEndpoint() {
  const hash = "b837e14f4d6919eea3d74cea3eea8fa80684640610e6bb93b464fc1d8f963ddc";
  const searchUrl = `https://stellar.expert/explorer/testnet/search?term=${hash}`;
  console.log("Testing search URL:", searchUrl);
  try {
    const res = await fetch(searchUrl);
    console.log("Status:", res.status);
  } catch (e) {
    console.error("Error:", e);
  }
}
testSearchEndpoint();
