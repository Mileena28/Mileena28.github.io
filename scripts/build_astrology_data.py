"""Export the current Almanac sources. Usage: python3 scripts/build_astrology_data.py REPO"""
import json, re, subprocess, sys
from pathlib import Path
repo = Path(sys.argv[1])
output = Path(__file__).resolve().parents[1] / 'assets/data/astrology.json'
months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
calendar = {}
for line in (repo/'Part01/01-FindingYourStarDay.md').read_text().splitlines():
    heading = re.match(r'## Month (\d+): (.*?) — (.*?) \(', line)
    if heading: reign, sign, month = heading.groups()
    cells = [c.strip().replace('**','') for c in line.split('|')[1:-1]]
    if len(cells) != 5: continue
    date = re.match(r'([A-Z][a-z]{2}) (\d+)', cells[0])
    if not date: continue
    earth_month, earth_day = date.groups()
    key = f'{months.index(earth_month)+1:02}-{int(earth_day):02}'
    calendar[key] = dict(sign=sign, month=month, day=cells[1], reignDay=cells[2], house=cells[3], moon=cells[4])
daily = {}
for path in sorted((repo/'Part04').glob('month-*.md')):
    for entry in re.split(r'^## Day ', path.read_text(), flags=re.M)[1:]:
        day = re.match(r'([\d.]+) ', entry).group(1)
        sections = re.split(r'^### ', entry, flags=re.M)[1:]
        daily[day] = [dict(title=s.split('\n',1)[0].strip(), text=re.sub(r'\n---\s*$', '', s.split('\n',1)[1]).strip()) for s in sections]
assert len(calendar) == len(daily) == 366
assert all(d['day'] in daily for d in calendar.values())
assert calendar['02-29']['day'] == '59.5' and calendar['03-01']['day'] == '60'
def read(name): return json.loads((repo/'Info'/f'{name}.json').read_text())
signs = read('constellation-signs')
result = dict(sourceCommit=subprocess.check_output(['git','-C',str(repo),'rev-parse','HEAD'],text=True).strip(), calendar=calendar, daily=daily, signs=signs['manifested_constellations']+signs['prophesied_constellations'], moon=read('moon-signs'), rising=read('rising-signs'), compatibility=read('constellation-compatibility'), moonCompatibility=read('moon-compatibility'))
result['timeline'] = json.loads((output.parents[2] / '_data/constellation_timeline.json').read_text())
output.write_text(json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n')
print(f'Exported {len(calendar)} dates and {len(daily)} authored daily readings from {result["sourceCommit"]}')
