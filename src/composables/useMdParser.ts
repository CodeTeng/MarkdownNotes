import { marked } from 'marked';

export function useMdParser() {
  // Setup marked options here later (highlight.js)
  return {
    parse: (content: string) => marked.parse(content)
  };
}
