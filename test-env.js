const { loadEnvConfig } = require('@next/env')
loadEnvConfig(process.cwd())
console.log("MISTRAL_API_KEY:", process.env.MISTRAL_API_KEY)
