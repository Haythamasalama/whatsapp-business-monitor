import { content, installCommand } from '../../app/utils/content'

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
    '## Links',
    '',
    `- [Website](${siteUrl}/): features, screenshots and install`,
    `- [Website in Arabic](${siteUrl}/ar/)`,
    `- [Source code and README](${repo})`,
    `- [Releases](${repo}/releases)`,
    `- [Contributing](${repo}/blob/main/CONTRIBUTING.md)`,
    '',
  ].join('\n')
})
