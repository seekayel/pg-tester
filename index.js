const {Pool, Client} = require('pg')
const path = require('path')
const fs = require('fs')
const express = require('express')
const { resolve } = require('path')
const app = express()


app.get('/files', async (req,res) => {
  const files = {}
  console.log('starting')
  files['.'] = fs.readdirSync(path.resolve('.'))
  files['dist'] = fs.readdirSync(path.resolve('./dist'))
  files['node_modules'] = fs.readdirSync(path.resolve('./node_modules'))
  console.log(JSON.stringify(files,null,2))
  res.json(files)
})
app.get('/file/ca-cert', async (req,res) => {
  console.log(`got ${req.path}`)
  res.sendFile(path.resolve(process.env.NODE_EXTRA_CA_CERTS))
})
app.get('/file/global-bundle', async (req,res) => {
  console.log(`got ${req.path}`)
  res.sendFile(path.resolve(process.env.BUNDLE_FILE ||  './_cyclic/global-bundle.pem'))
})
app.get('/file/postgres-root', async (req,res) => {
  console.log(`got ${req.path}`)
  res.sendFile(path.resolve('~/.postgresql/root.crt'))
})

async function query(config) {
  const client = new Client(config);
  await client.connect();

  console.log(`Client with config: ${JSON.stringify(config,null,2)}`)
  const isSSL = await client.query("show ssl");

  const now = await client.query("SELECT NOW()");
  // console.log(`Queried with: ${JSON.stringify(client,null,2)}`)
  console.log(`TLS Options: ${(client.connection?.stream?._tlsOptions)? 'Configured':'Missing'}`)
  return JSON.stringify({...now.rows[0],...isSSL.rows[0]},null,2)
}



app.get('/env/insecure', async (req,res) => {
  console.log(`got ${req.path}`)

  process.env.PGHOST        = process.env.secure_PGHOST
  process.env.PGPORT        = process.env.secure_PGPORT
  process.env.PGDATABASE    = process.env.secure_PGDATABASE
  process.env.PGUSER        = process.env.secure_PGUSER
  process.env.PGPASSWORD    = process.env.secure_PGPASSWORD
  process.env.PGSSLMODE     = 'disable'
  process.env.PGSSLROOTCERT = ''


  const data = await query({})

  console.log(`Just queried ${data}`)
  res.send(`The time is now: ${data}`)
})

app.get('/env/ssl', async (req,res) => {
  console.log(`got ${req.path}`)

  process.env.PGHOST        = process.env.secure_PGHOST
  process.env.PGPORT        = process.env.secure_PGPORT
  process.env.PGDATABASE    = process.env.secure_PGDATABASE
  process.env.PGUSER        = process.env.secure_PGUSER
  process.env.PGPASSWORD    = process.env.secure_PGPASSWORD
  process.env.PGSSLMODE     = process.env.secure_PGSSLMODE
  process.env.PGSSLROOTCERT = process.env.secure_PGSSLROOTCERT


  const data = await query({})

  console.log(`Just queried ${data}`)
  res.send(`The time is now: ${data}`)
})

app.get('/string/ssl', async (req,res) => {
  console.log(`got ${req.path}`)

  const config = {
    connectionString: process.env.DATABASE_URL_SECURE,
    // ssl: {
    //   rejectUnauthorized: true,
    //   ca: fs.readFileSync(path.resolve(process.env.PGSSLROOTCERT)).toString(),
    // },
  }

  const data = await query(config)

  console.log(`Just queried ${data}`)
  res.send(`The time is now: ${data}`)
})

app.get('/string/insecure', async (req,res) => {
  console.log(`got ${req.path}`)

  const config = {
    connectionString: process.env.DATABASE_URL_INSECURE,
  }

  const data = await query(config)

  console.log(`Just queried ${data}`)
  res.send(`The time is now: ${data}`)
})

app.get('/info', (req,res) => {
  console.log(`got ${req.path}`)
  res.json({
    // env: process.env,
    resolve: path.resolve('.'),
    pgcrt: path.resolve('~/.postgresql/root.crt'),
  })
})

app.all('*', async (req, res) => {
  console.log(`got ${req.path}`)
  res.send('mic check, good.')
})

app.listen(process.env.PORT || 3000)
