const {Pool, Client} = require('pg')
const path = require('path')
const express = require('express')
const app = express()

const connString = process.env.DATABASE_URL

// let pool = null

app.get('/ca-cert', async (req,res) => {
  res.sendFile(path.resolve(process.env.NODE_EXTRA_CA_CERTS))
})

app.all('*', async (req, res) => {
  console.log(JSON.stringify(process.env,null,2))
  console.log(`Request on: ${req.path}`)
  // if(!pool){
  //   console.log(`Trying: ${connString}`)
  //   pool = await new Pool({connString});
  //   console.log(JSON.stringify(pool,null,2))
  // }

  // console.log(`Trying: query`)
  // let now = await pool.query("SELECT NOW()");

  const client = new Client({connString});
  await client.connect();

  console.log('client demo: query')
  const now = await client.query("SELECT NOW()");
  const data = JSON.stringify(now.rows[0].now,null,2)

  console.log(`Just queried ${data}`)
  res.send(`The time is now: ${data}`)
})
app.listen(process.env.PORT || 3000)
