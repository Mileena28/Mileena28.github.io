"""Export the current Almanac sources. Usage: python3 scripts/build_astrology_data.py REPO"""
import hashlib, json, re, subprocess, sys
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
source_files = sorted([*(repo/'Info').glob('*.json'), *(repo/'Part04').glob('month-*.md'), repo/'Part01/01-FindingYourStarDay.md'])
result['sourceDigest'] = hashlib.sha256(b''.join(str(f.relative_to(repo)).encode()+b'\0'+f.read_bytes() for f in source_files)).hexdigest()
result['sourceHasLocalChanges'] = bool(subprocess.check_output(['git','-C',str(repo),'status','--porcelain','--','Info','Part04','Part01/01-FindingYourStarDay.md'],text=True).strip())
result['timeline'] = json.loads((output.parents[2] / '_data/constellation_timeline.json').read_text())
output.write_text(json.dumps(result,ensure_ascii=False,separators=(',',':'))+'\n')
print(f'Exported {len(calendar)} dates and {len(daily)} authored daily readings from {result["sourceCommit"]}')

# Build the public overview from the same snapshot as the interactive calculator.
# This keeps palettes, house bands, regional hours and relationship groups aligned.
from html import escape

def esc(value):
    return escape(str(value).replace('**', ''))

def para(value):
    return ''.join('<p>'+esc(p)+'</p>' for p in value.split('\n\n'))

def cards(items):
    return '<div class="world-grid astrology-two">'+''.join(items)+'</div>'

def card(title, meta, body):
    return '<article class="world-card"><h3 class="world-term">'+esc(title)+'</h3><p class="world-meta">'+esc(meta)+'</p><div class="world-definition">'+body+'</div></article>'

def section(id, eyebrow, title, body):
    return '<section class="home-section" id="'+id+'"><p class="home-eyebrow">'+eyebrow+'</p><h2>'+title+'</h2>'+body+'</section>\n'

content = section('system','Start here','Four parts of your Star Day.',
    '<p class="oracle-intro">The Siren Bone Oracle belongs to the world of Blood of the Wild Gods. Athea’s calendar brings together a constellation, a symbolic moon station, a house, and a rising sign. Each offers a different way to reflect on a life.</p>'+
    cards([card('Constellation','Your larger story',para('Your birth date selects a constellation and its themes.')),
           card('Moon station','Your inner self',para('A fixed symbolic station offers an image for inward experience.')),
           card('House','Where the themes unfold',para('Your day within the constellation’s reign selects an area of life.')),
           card('Rising sign','How you arrive',para('Your constellation and recorded local birth time select a symbolic approach to meeting the world.'))])+
    '<p><a class="home-button" href="/astrology/#find">Find your Star Day →</a></p>')
constellations=[]
for sign in sorted(result['signs'],key=lambda x:int(x['association'].split('Month ')[1])):
    constellations.append(card(sign['name'].title(),sign['association']+' · '+sign['status']+' · '+sign['element'],
        para(sign['symbol'])+para('Colors: '+', '.join(sign['colors']))+para('Sacred colors: '+', '.join(sign['sacred_colors']))+para(sign['core_reading'])))
content += section('constellations','The twelve constellations','Some stars remember. Others wait.',
    '<p class="oracle-intro">Athea records four manifested constellations and eight prophesied ones. Later events in The Silence bring the Awakener into the sky. The Almanac keeps Athea’s historical perspective; the website’s <a href="/world-guide/calendars/#constellation-timeline">story timeline</a> follows that later development.</p>'+cards(constellations))
moons = cards([card(p['name'].replace(' BORN','').title(),p['days'],para(' · '.join(p['titles']))) for p in result['moon']['moon_phases_section']['phases']])
houses = cards([card(h['name'],h['daily_activation'],para(h['domain'])+'<p><em>'+esc(h['sacred_question'])+'</em></p>') for h in result['rising']['house_system']['houses']])
regions = cards([card(r['name'],r['hours'],para(r['effect'])) for r in result['rising']['rising_sign_system']['regional_modifiers']['regions']])
content += section('charts','Explore the system','A calendar you can return to.',
    para(result['moon']['calendar_convention'])+
    '<details class="oracle-detail"><summary>Eight symbolic moon stations</summary><div>'+moons+'</div></details>'+
    '<details class="oracle-detail"><summary>Twelve houses · realms of experience</summary><div><p>The day bands below use the day within an Arcadian reign, not the day of an Earth month. The Broken Chain’s extra five days and February 29 belong to the Void Temple.</p>'+houses+'</div></details>'+
    '<details class="oracle-detail"><summary>Six skies · finding your rising sign</summary><div><p>Use the local clock time recorded at birth, without time-zone or daylight-saving conversion. The region selects a column in the Rising Shift Table; your constellation selects its row. The Star Day calculator handles that lookup for you.</p>'+regions+
    '<p>For a known time exactly at midnight, 04:00, 08:00, noon, 16:00 or 20:00, either adjacent region may be explored. If the time is unknown, use only the Verdant Veil column as a clearly labeled provisional noon reading.</p></div></details>')
content += section('compatibility','The Celestial Concordance','Where different natures meet.',
    para(result['compatibility']['author_note'])+'<p>The 78 constellation pairings and 36 moon pairings explore possible connections. The groups below describe themes, rather than ranking relationships.</p>'+
    cards([card(g['title'],'',para(g['description'])) for g in result['compatibility']['compatibility_groups']])+
    '<p><a class="home-button" href="/astrology/#compatibility">Explore two birthdays →</a></p>')
(output.parents[2]/'_includes/arcadian-reference.html').write_text('<!-- Generated by scripts/build_astrology_data.py; edit the shared source or generator. -->\n'+content)
