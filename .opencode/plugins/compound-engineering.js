import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"

const pluginDir = path.dirname(fileURLToPath(import.meta.url))
const skillsDir = path.resolve(pluginDir, "../../skills")

function loadSkills() {
  const commands = {}
  try {
    const entries = fs.readdirSync(skillsDir)
    for (const entry of entries) {
      const skillPath = path.join(skillsDir, entry)
      if (!fs.statSync(skillPath).isDirectory()) continue
      const filePath = path.join(skillPath, "SKILL.md")
      if (!fs.existsSync(filePath)) continue
      const content = fs.readFileSync(filePath, "utf8")
      const m = content.match(/^name:\s*(\S+)/m)
      if (!m) continue
      const name = m[1]
      commands[name] = {
        template: `Execute the "${name}" skill.\n\nTask: $ARGUMENTS`,
      }
    }
  } catch {}
  return commands
}

const skillCommands = loadSkills()

export const CompoundEngineeringPlugin = async () => ({
  config: async (config) => {
    config.skills = config.skills || {}
    config.skills.paths = config.skills.paths || []
    if (!config.skills.paths.includes(skillsDir)) {
      config.skills.paths.push(skillsDir)
    }
    config.command = config.command || {}
    for (const [name, cmd] of Object.entries(skillCommands)) {
      if (!(name in config.command)) {
        config.command[name] = cmd
      }
    }
  },
})

export default CompoundEngineeringPlugin
