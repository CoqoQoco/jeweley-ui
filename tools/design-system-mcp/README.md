# design-system-mcp

MCP server ที่เสิร์ฟ **design system ของ jeweley-ui** ให้ AI client (Claude Code / claude.ai) ดึงไปใช้ตอน redesign
— token ดึง **สดจาก `src/assets/scss/variable.scss`** ทุกครั้ง (ไม่มี doc drift)

## ติดตั้ง

```bash
cd tools/design-system-mcp
npm install
node selftest.js   # ตรวจ core logic ตรงกับ variable.scss
```

## Resources

| URI | เนื้อหา |
|---|---|
| `tokens://{colors\|spacing\|radius\|shadow\|typography}` | token สดจาก variable.scss |
| `components://catalog` | รายชื่อ generic component 26 ตัว |
| `archetypes://all` | page archetype 5 แบบ |
| `principles://core` | หลักการออกแบบ 12 ข้อ |

## Tools

| Tool | หน้าที่ |
|---|---|
| `get_design_tokens(group?)` | ดึง token (เว้น group = ทั้งหมด) |
| `list_components(group?)` | ลิสต์ component (generic\|prime-vue) |
| `get_component_spec(name)` | spec: role/variants/states/props |
| `get_archetype(name)` | spec ของ archetype |
| `validate_value(kind,value)` | เช็คว่า color/spacing/radius ตรง token ไหม → คืน token ที่ควรใช้ |
| `search_design_system(query)` | ค้นข้าม token/component/archetype/principle |

## ต่อเข้า Claude Code (stdio) — แนะนำ

วิธี A — CLI:
```bash
claude mcp add design-system -- node ./tools/design-system-mcp/index.js
```

วิธี B — เพิ่มใน `.claude/settings.json` (local-only, **ห้าม commit**):
```json
{
  "mcpServers": {
    "design-system": {
      "command": "node",
      "args": ["./tools/design-system-mcp/index.js"]
    }
  }
}
```
แล้ว restart Claude Code → ใช้ tool ได้เลย เช่นถาม "design token สีหลักคืออะไร" → เรียก `get_design_tokens`

## ต่อเข้า claude.ai / Claude Design (remote — ยังเป็น gate)

ต้องแปลงเป็น **remote MCP (HTTP/SSE)** + deploy ออกเน็ต + auth แล้วเพิ่มเป็น Connector
→ **ต้องเทสต์ก่อนว่า Claude Design Beta รับ custom connector ได้จริง** (ดู `docs/claude-design/05`)
ถ้ายังไม่รองรับ → fallback copy-paste เอกสาร `docs/claude-design/00,01,03`

## หมายเหตุ

- ต้องรันจาก repo root ของ jeweley-ui (path ของ variable.scss resolve จาก `index.js` แบบ relative)
- `node_modules/` ของ tool นี้ไม่ต้อง commit (ดู .gitignore ของ repo)
