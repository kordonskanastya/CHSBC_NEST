import * as pg from 'pg'
import * as readline from 'node:readline'
import { stdin, stdout, env } from 'process'
import { ROLE } from '../../auth/roles/role.enum'
import { hashPassword } from '../../api/users/users.service'

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()

const { POSTGRES_HOST, POSTGRES_USER, POSTGRES_PORT, POSTGRES_PASSWORD, POSTGRES_DATABASE } = env

async function ask(query: string) {
  const readlineInterface = readline.createInterface({
    input: stdin,
    output: stdout,
  })

  return new Promise((resolve) =>
    readlineInterface.question(query, (ans) => {
      readlineInterface.close()
      resolve(ans)
    }),
  )
}

async function main() {
  const email = await ask('Enter root email: ')
  console.log(`Email ${email}`)

  const password = await ask('Enter root password: ')
  console.log(`Password ${password}`)

  const connection = new pg.Client({
    host: POSTGRES_HOST,
    user: POSTGRES_USER,
    port: POSTGRES_PORT,
    password: String(POSTGRES_PASSWORD),
    database: POSTGRES_DATABASE,
    multipleStatements: true,
  })

  connection.connect()

  console.log('Running SQL seed...')

  const seedQuery = `INSERT INTO 
    public.users ("firstName", "lastName", "email", "password", "role") 
    values ('${email}', '${email}', '${email}', '${await hashPassword(password as string)}', '${ROLE.ROOT}');`

  connection.query(seedQuery, (err) => {
    connection.end()
    if (err) throw err
    console.log('SQL seed completed! ')
  })
}

main()
