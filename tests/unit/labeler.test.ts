import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

function computeTierForPath(protectedYaml: string, filePath: string) {
  const obj = yaml.load(protectedYaml) as Record<string, string[]>;
  let highest = 1;
  for (const key of Object.keys(obj)) {
    const tier = parseInt(key.replace('Tier','')) || 1;
    for (const pattern of obj[key as keyof typeof obj]) {
      if (pattern.endsWith('/**')) {
        const prefix = pattern.replace('/**','');
        if (filePath.startsWith(prefix)) highest = Math.max(highest, tier);
      } else if (filePath === pattern) {
        highest = Math.max(highest, tier);
      }
    }
  }
  return highest;
}

test('compute tier for sample paths', () => {
  const yamlTxt = fs.readFileSync(path.resolve(__dirname, '../../docs/system/PROTECTED_PATHS.yaml'), 'utf8');
  expect(computeTierForPath(yamlTxt, 'src/index.ts')).toBeGreaterThanOrEqual(1);
  expect(computeTierForPath(yamlTxt, 'docs/system/DECISIONS.md')).toBeGreaterThanOrEqual(3);
  expect(computeTierForPath(yamlTxt, '.github/workflows/labeler.yml')).toBe(4);
});
