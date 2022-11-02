const express = require("express");
const { isReady, PrivateKey, Field, Signature } = require("snarkyjs");
const app = express();
const port = process.env.PORT || 3001;

async function getCreditScore(id) {
  // We need to wait for SnarkyJS to finish loading before we can do anything
  await isReady;

  // The private key of our account. When running locally the hardcoded key will
  // be used. In production the key will be loaded from a Vercel environment
  // variable.
  const privateKey = PrivateKey.fromBase58(
    process.env.PRIVATE_KEY ??
      "EKF65JKw9Q1XWLDZyZNGysBbYG21QbJf3a4xnEoZPZ28LKYGMw53"
  );

  // We get the users credit score. In this case it's 787 for user 1, and 536
  // for anybody else :)
  const knownCreditScore = (id) => (id === "1" ? 787 : 536);

  // We compute the public key associated with our private key
  const publicKey = privateKey.toPublicKey();

  // Define a Field with the value of the users id
  const userId = Field(id);

  // Define a Field with the users credit score
  const creditScore = Field(knownCreditScore(id));

  // Use our private key to sign an array of Fields containing the users id and
  // credit score
  const signature = Signature.create(privateKey, [userId, creditScore]);
  console.log(process.memoryUsage());
  return {
    data: { id: userId, creditScore: creditScore },
    signature: signature,
    publicKey: privateKey,
  };
}

app.get("/user/:id", async (req, res) =>
  res.send(await getCreditScore(req.params.id))
);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
