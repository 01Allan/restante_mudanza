import {
    access
    ,readFile
} from 'node:fs/promises'
import {
    extname
    ,join
    ,normalize
    ,resolve
} from 'node:path'
import type { FastifyInstance } from 'fastify'

const distPath = resolve(process.cwd(), 'dist')
const contentTypes: Record<string, string> = {
    '.css': 'text/css; charset=utf-8'
    ,'.html': 'text/html; charset=utf-8'
    ,'.ico': 'image/x-icon'
    ,'.js': 'text/javascript; charset=utf-8'
    ,'.json': 'application/json; charset=utf-8'
    ,'.png': 'image/png'
    ,'.svg': 'image/svg+xml'
    ,'.webp': 'image/webp'
}

export async function registerStaticRoutes(app: FastifyInstance) {
    const hasDist = await pathExists(distPath)

    if (!hasDist) {
        app.log.warn('dist directory not found. Static frontend is disabled.')
        return
    }

    app.get('/*', async (request, reply) => {
        const url = new URL(request.url, 'http://localhost')
        let filePath = getStaticPath(url.pathname)
        let file = await readFile(filePath).catch(async () => {
            filePath = join(distPath, 'index.html')
            return readFile(filePath)
        })
        const extension = extname(filePath)

        return reply
            .type(contentTypes[extension] ?? 'application/octet-stream')
            .send(file)
    })
}

function getStaticPath(pathname: string) {
    const safePath = normalize(decodeURIComponent(pathname)).replace(/^(\.\.(\/|\\|$))+/, '')
    const filePath = join(distPath, safePath === '/' ? 'index.html' : safePath)

    if (!filePath.startsWith(distPath)) {
        return join(distPath, 'index.html')
    }

    return filePath
}

async function pathExists(path: string) {
    try {
        await access(path)
        return true
    } catch {
        return false
    }
}
