#!/usr/bin/env node
// design-system-mcp — เสิร์ฟ design system ของ jeweley-ui ผ่าน MCP (stdio)
// Resources: tokens/components/archetypes/principles · Tools: get/list/validate/search
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

import { getTokens, validateValue } from './src/parse-tokens.js'
import { COMPONENTS, ARCHETYPES, PRINCIPLES } from './src/data.js'

const json = (obj) => ({ content: [{ type: 'text', text: JSON.stringify(obj, null, 2) }] })

const server = new McpServer({
  name: 'design-system-mcp',
  version: '0.1.0'
})

// ---------- Resources ----------
const TOKEN_GROUPS = ['colors', 'spacing', 'radius', 'shadow', 'typography']
for (const g of TOKEN_GROUPS) {
  server.resource(`tokens-${g}`, `tokens://${g}`, async (uri) => {
    const data = await getTokens(g)
    return { contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(data, null, 2) }] }
  })
}

server.resource('components-catalog', 'components://catalog', async (uri) => ({
  contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(COMPONENTS.map((c) => ({ name: c.name, group: c.group, role: c.role })), null, 2) }]
}))

server.resource('archetypes-all', 'archetypes://all', async (uri) => ({
  contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(ARCHETYPES, null, 2) }]
}))

server.resource('principles-core', 'principles://core', async (uri) => ({
  contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(PRINCIPLES, null, 2) }]
}))

// ---------- Tools ----------
server.tool(
  'get_design_tokens',
  'ดึง design token สดจาก variable.scss — ระบุ group (colors|spacing|radius|shadow|typography) หรือเว้นว่างเพื่อเอาทั้งหมด',
  { group: z.enum(['colors', 'spacing', 'radius', 'shadow', 'typography']).optional() },
  async ({ group }) => json(await getTokens(group))
)

server.tool(
  'list_components',
  'ลิสต์ generic component ทั้งหมดในระบบ (ตัวเลือก: กรองด้วย group generic|prime-vue)',
  { group: z.enum(['generic', 'prime-vue']).optional() },
  async ({ group }) => {
    const items = group ? COMPONENTS.filter((c) => c.group === group) : COMPONENTS
    return json({ count: items.length, components: items.map((c) => ({ name: c.name, group: c.group, role: c.role })) })
  }
)

server.tool(
  'get_component_spec',
  'ดึง spec ของ component 1 ตัว (role/variants/states/props) — ใช้เขียน component spec ตอน redesign',
  { name: z.string() },
  async ({ name }) => {
    const c = COMPONENTS.find((x) => x.name.toLowerCase() === name.toLowerCase())
    if (!c) return json({ error: `ไม่พบ component: ${name}`, hint: 'เรียก list_components เพื่อดูชื่อทั้งหมด' })
    return json(c)
  }
)

server.tool(
  'get_archetype',
  'ดึง spec ของ page archetype (list|create-edit|detail|dashboard|modal)',
  { name: z.enum(['list', 'create-edit', 'detail', 'dashboard', 'modal']) },
  async ({ name }) => json(ARCHETYPES[name])
)

server.tool(
  'validate_value',
  'เช็คว่าค่าสี/spacing/radius ตรง token หรือไม่ (สะท้อนกฎห้าม hardcode) — คืน token ที่ควรใช้',
  { kind: z.enum(['color', 'spacing', 'radius']), value: z.string() },
  async ({ kind, value }) => json(await validateValue(kind, value))
)

server.tool(
  'search_design_system',
  'ค้นหาข้าม token/component/archetype/principle ด้วยคำค้น',
  { query: z.string() },
  async ({ query }) => {
    const q = query.toLowerCase()
    const tokens = await getTokens()
    const tokenHits = []
    for (const [grp, obj] of Object.entries(tokens.tokens)) {
      for (const [k, v] of Object.entries(obj)) {
        if (k.toLowerCase().includes(q) || String(v).toLowerCase().includes(q)) tokenHits.push({ group: grp, name: k, value: v })
      }
    }
    const compHits = COMPONENTS.filter(
      (c) => c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q) || (c.props || []).some((p) => p.toLowerCase().includes(q))
    ).map((c) => ({ name: c.name, role: c.role }))
    const archHits = Object.entries(ARCHETYPES)
      .filter(([k, a]) => k.includes(q) || a.name.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q))
      .map(([k, a]) => ({ key: k, name: a.name }))
    const principleHits = PRINCIPLES.filter((p) => p.toLowerCase().includes(q))
    return json({ query, tokens: tokenHits, components: compHits, archetypes: archHits, principles: principleHits })
  }
)

const transport = new StdioServerTransport()
await server.connect(transport)
console.error('design-system-mcp running on stdio')
