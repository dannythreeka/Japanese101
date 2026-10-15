import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

const sha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA ||
  execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
if (!/^[a-f0-9]{40}$/.test(sha)) throw new Error('Invalid build commit SHA')
writeFileSync('dist/version.json', JSON.stringify({ sha }, null, 2) + '\n')
