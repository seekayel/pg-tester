const {Pool, Client} = require('pg')
const path = require('path')
const fs = require('fs')
const express = require('express')
const app = express()

const connString = "" //process.env.DATABASE_URL

// let pool = null

app.get('/ca-cert', async (req,res) => {
  res.sendFile(path.resolve(process.env.NODE_EXTRA_CA_CERTS))
})


async function query(config) {
  const client = new Client(config);
  await client.connect();

  console.log('client demo: query')
  const now = await client.query("SELECT NOW()");
  return JSON.stringify(now.rows[0].now,null,2)
}


app.get('/with-ssl', async (req,res) => {
  console.log('got /with-ssl')

  const config = {
    ssl: {
      rejectUnauthorized: true,
      ca: fs.readFileSync(path.resolve(process.env.PGSSLROOTCERT)).toString(),
    },
  }

  const data = await query(config)

  console.log(`Just queried ${data}`)
  res.send(`The time is now: ${data}`)
})

app.get('/with-ssl-string', async (req,res) => {
  console.log('got /with-ssl')

  const config = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: true,
      ca: fs.readFileSync(path.resolve(process.env.PGSSLROOTCERT)).toString(),
    },
  }

  const data = await query(config)

  console.log(`Just queried ${data}`)
  res.send(`The time is now: ${data}`)
})

app.get('/with-string', async (req,res) => {
  console.log('got /with-string')

  const config = {
    connectionString: process.env.DATABASE_URL,
  }

  const data = await query(config)

  console.log(`Just queried ${data}`)
  res.send(`The time is now: ${data}`)
})

app.all('*', async (req, res) => {
  // console.log(JSON.stringify(process.env,null,2))
  console.log(`Request on: ${req.path}`)
  // if(!pool){
  //   console.log(`Trying: ${connString}`)
  //   pool = await new Pool({connString});
  //   console.log(JSON.stringify(pool,null,2))
  // }

  // console.log(`Trying: query`)
  // let now = await pool.query("SELECT NOW()");

  let data = await query({})
  console.log(`Just queried ${data}`)
  res.send(`The time is now: ${data}`)

})
app.listen(process.env.PORT || 3000)
