fetch("http://localhost:4000/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: "admin",
    password: "sendstores123"
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
