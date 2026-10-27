import { content, installCommand } from '../../app/utils/content'
import { docs } from '../../app/utils/docs'

// The llms.txt convention (llmstxt.org): the whole page as plain Markdown, for AI assistants and search.
export default defineEventHandler((event) => {
  const { siteUrl, repo, version } = useRuntimeConfig().public
  const { en, ar } = content
  const install = installCommand(repo)

  setHeader(event, 'content-type', 'text/markdown; charset=utf-8')

  return [
    `# ${en.brand}`,
    '',
    `> ${en.description} MIT license, version ${version}. The interface is in English and Arabic (${ar.brand}).`,
    '',
    en.hero.text,
    '',
    '## Features',
    '',
    ...en.features.items.map(item => `- **${item.title}:** ${item.text}`),
    '',
    '## Install',
    '',
    en.install.text,
    '',
    '```bash',
    install,
    '```',
    '',
    `On a server, add \`--server\`: \`${install} -s -- --server\`. ${en.install.updates}`,
    '',
    '## Privacy',
    '',
    ...en.privacy.items.map(item => `- **${item.title}:** ${item.text}`),
    '',
    '## Questions',
    '',
    ...en.faq.items.flatMap(item => [`### ${item.question}`, '', item.answer, '']),
    `## ${docs.en.heading}`,
    '',
    docs.en.intro,
    '',
    ...docs.en.sections.flatMap(section => [`### ${section.title}`, '', section.text, ...(section.points ?? []).map(point => `- ${point}`), '']),
    `### ${docs.en.limitsTitle}`,
    '',
    ...docs.en.limits.map(([name, limit]) => `- **${name}:** ${limit}`),
    '',
    '## Links',
    '',
    `- [Website](${siteUrl}/): features, screenshots and install`,
    `- [Website in Arabic](${siteUrl}/ar/)`,
    `- [Accounts & numbers guide](${siteUrl}${docs.en.path})`,
    `- [Accounts & numbers guide in Arabic](${siteUrl}${docs.ar.path})`,
    `- [Source code and README](${repo})`,
    `- [Releases](${repo}/releases)`,
    `- [Contributing](${repo}/blob/main/CONTRIBUTING.md)`,
    '',
  ].join('\n')
})
